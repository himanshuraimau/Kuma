/**
 * Admin Controller - Monitoring and management endpoints for Redis queue
 */

import type { Request, Response } from 'express';
import { redis } from '../lib/redis/client';
import { getStreamMetrics, getStreamLength, getPendingCount, trimStream } from '../lib/redis/streams';
import { getJobStatus } from '../lib/redis/status';
import { REDIS_STREAMS, REDIS_CONSUMER_GROUPS } from '../lib/redis/types';
import { prisma } from '../db/prisma';

/**
 * Get Redis health status
 * GET /api/admin/redis/health
 */
export async function getRedisHealth(req: Request, res: Response) {
    try {
        const isHealthy = await redis.healthCheck();
        const isReady = redis.isReady();

        return res.json({
            healthy: isHealthy,
            ready: isReady,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Redis health check error:', error);
        return res.status(503).json({
            healthy: false,
            ready: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Get stream metrics
 * GET /api/admin/redis/metrics
 */
export async function getRedisMetrics(req: Request, res: Response) {
    try {
        const [messageMetrics, dlqLength, jobStats] = await Promise.all([
            getStreamMetrics(REDIS_STREAMS.MESSAGE_STREAM, REDIS_CONSUMER_GROUPS.CHAT_PROCESSORS),
            getStreamLength(REDIS_STREAMS.DLQ_STREAM),
            getJobStats(),
        ]);

        return res.json({
            stream: {
                name: REDIS_STREAMS.MESSAGE_STREAM,
                ...messageMetrics,
            },
            dlq: {
                name: REDIS_STREAMS.DLQ_STREAM,
                length: dlqLength,
            },
            jobs: jobStats,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error getting Redis metrics:', error);
        return res.status(500).json({
            error: 'Failed to get metrics',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Get job status by ID
 * GET /api/admin/jobs/:jobId
 */
export async function getJobById(req: Request, res: Response) {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({ error: 'Job ID is required' });
        }

        // Get from Redis
        const redisStatus = await getJobStatus(jobId);

        // Get from database
        const dbJob = await prisma.message_jobs.findUnique({
            where: { jobId },
        });

        if (!redisStatus && !dbJob) {
            return res.status(404).json({ error: 'Job not found' });
        }

        return res.json({
            jobId,
            redis: redisStatus,
            database: dbJob,
        });
    } catch (error) {
        console.error('Error getting job:', error);
        return res.status(500).json({
            error: 'Failed to get job',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Get DLQ messages
 * GET /api/admin/dlq
 */
export async function getDLQMessages(req: Request, res: Response) {
    try {
        const client = redis.getClient();
        const limit = parseInt(req.query.limit as string) || 50;

        // Read from DLQ stream
        const messages = await client.xrevrange(
            REDIS_STREAMS.DLQ_STREAM,
            '+',
            '-',
            'COUNT',
            limit
        );

        const formattedMessages = messages.map(([id, fields]: [string, string[]]) => {
            const message: any = { id };
            for (let i = 0; i < fields.length; i += 2) {
                const key = fields[i];
                const value = fields[i + 1];
                if (key && value !== undefined) {
                    message[key] = key === 'originalJob' || key === 'error' ? value : value;
                }
            }
            return message;
        });

        return res.json({
            count: formattedMessages.length,
            messages: formattedMessages,
        });
    } catch (error) {
        console.error('Error getting DLQ messages:', error);
        return res.status(500).json({
            error: 'Failed to get DLQ messages',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Retry a DLQ message
 * POST /api/admin/dlq/:messageId/retry
 */
export async function retryDLQMessage(req: Request, res: Response) {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({ error: 'Message ID is required' });
        }

        const client = redis.getClient();

        // Get the message from DLQ
        const messages: any = await client.xrange(
            REDIS_STREAMS.DLQ_STREAM,
            messageId,
            messageId
        );

        if (!messages || messages.length === 0) {
            return res.status(404).json({ error: 'DLQ message not found' });
        }

        const [id, fields] = messages[0];
        const originalJobStr = fields[fields.indexOf('originalJob') + 1];
        
        if (!originalJobStr) {
            return res.status(400).json({ error: 'Original job data not found' });
        }

        const originalJob = JSON.parse(originalJobStr);

        // Reset retry count
        originalJob.metadata.retryCount = 0;

        // Republish to main stream
        const streamData: Record<string, string> = {
            jobId: originalJob.jobId,
            userId: originalJob.userId,
            chatId: originalJob.chatId,
            message: originalJob.message,
            agentType: originalJob.agentType,
            metadata: JSON.stringify(originalJob.metadata),
        };

        if (originalJob.imageAttachments) {
            streamData.imageAttachments = JSON.stringify(originalJob.imageAttachments);
        }

        if (originalJob.documentAttachments) {
            streamData.documentAttachments = JSON.stringify(originalJob.documentAttachments);
        }

        const newMessageId = await client.xadd(
            REDIS_STREAMS.MESSAGE_STREAM,
            '*',
            ...Object.entries(streamData).flat()
        );

        // Delete from DLQ
        await client.xdel(REDIS_STREAMS.DLQ_STREAM, messageId);

        return res.json({
            success: true,
            jobId: originalJob.jobId,
            newMessageId,
            message: 'Job requeued successfully',
        });
    } catch (error) {
        console.error('Error retrying DLQ message:', error);
        return res.status(500).json({
            error: 'Failed to retry message',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Trim stream to reduce memory
 * POST /api/admin/stream/trim
 */
export async function trimStreamEndpoint(req: Request, res: Response) {
    try {
        const { maxLen = 10000 } = req.body;
        
        const trimmed = await trimStream(REDIS_STREAMS.MESSAGE_STREAM, maxLen);

        return res.json({
            success: true,
            trimmed,
            message: `Trimmed ${trimmed} messages from stream`,
        });
    } catch (error) {
        console.error('Error trimming stream:', error);
        return res.status(500).json({
            error: 'Failed to trim stream',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Get job statistics from database
 */
async function getJobStats() {
    const [total, byStatus] = await Promise.all([
        prisma.message_jobs.count(),
        prisma.message_jobs.groupBy({
            by: ['status'],
            _count: true,
        }),
    ]);

    const statusCounts: Record<string, number> = {};
    byStatus.forEach((item) => {
        statusCounts[item.status] = item._count;
    });

    return {
        total,
        byStatus: statusCounts,
    };
}
