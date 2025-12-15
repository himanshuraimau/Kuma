/**
 * Redis Producer - Publish messages to stream
 */

import { v4 as uuidv4 } from 'uuid';
import { addToStream } from './streams';
import { publishStatus } from './status';
import {
    REDIS_STREAMS,
    DEFAULT_STREAM_CONFIG,
    JobStatus,
    type MessageJob,
    type ImageAttachment,
    type DocumentAttachment,
} from './types';

/**
 * Publish a chat message to the Redis stream
 */
export async function publishMessage(params: {
    userId: string;
    chatId: string;
    message: string;
    agentType: string;
    imageAttachments?: ImageAttachment[];
    documentAttachments?: DocumentAttachment[];
    clientId?: string;
}): Promise<string> {
    const jobId = uuidv4();

    try {
        const job: MessageJob = {
            jobId,
            userId: params.userId,
            chatId: params.chatId,
            message: params.message,
            agentType: params.agentType,
            imageAttachments: params.imageAttachments,
            documentAttachments: params.documentAttachments,
            metadata: {
                clientId: params.clientId,
                timestamp: Date.now(),
                retryCount: 0,
            },
        };

        // Serialize job to flat key-value pairs for Redis
        const streamData: Record<string, string> = {
            jobId: job.jobId,
            userId: job.userId,
            chatId: job.chatId,
            message: job.message,
            agentType: job.agentType,
            metadata: JSON.stringify(job.metadata),
        };

        if (job.imageAttachments) {
            streamData.imageAttachments = JSON.stringify(job.imageAttachments);
        }

        if (job.documentAttachments) {
            streamData.documentAttachments = JSON.stringify(job.documentAttachments);
        }

        // Add to stream
        const messageId = await addToStream(
            REDIS_STREAMS.MESSAGE_STREAM,
            streamData,
            DEFAULT_STREAM_CONFIG.maxLen
        );

        console.log(`📤 Published message to stream: jobId=${jobId}, messageId=${messageId}`);

        // Publish status update
        await publishStatus(jobId, {
            jobId,
            status: JobStatus.PENDING,
            timestamp: Date.now(),
            message: 'Message queued for processing',
            data: { chatId: params.chatId },
        });

        return jobId;
    } catch (error) {
        console.error(`❌ Failed to publish message:`, error);
        
        // Publish error status
        await publishStatus(jobId, {
            jobId,
            status: JobStatus.FAILED,
            timestamp: Date.now(),
            message: 'Failed to queue message',
        });

        throw error;
    }
}

/**
 * Publish a job to the Dead Letter Queue
 */
export async function publishToDLQ(
    job: MessageJob,
    error: string,
    stackTrace?: string
): Promise<void> {
    try {
        const dlqEntry = {
            jobId: job.jobId,
            originalJob: JSON.stringify(job),
            error,
            stackTrace: stackTrace || '',
            failedAt: Date.now().toString(),
            retryCount: job.metadata.retryCount.toString(),
        };

        await addToStream(REDIS_STREAMS.DLQ_STREAM, dlqEntry);

        console.log(`☠️ Moved job ${job.jobId} to DLQ after ${job.metadata.retryCount} retries`);

        // Publish dead status
        await publishStatus(job.jobId, {
            jobId: job.jobId,
            status: JobStatus.DEAD,
            timestamp: Date.now(),
            message: `Moved to DLQ: ${error}`,
        });
    } catch (dlqError) {
        console.error(`❌ Failed to move job to DLQ:`, dlqError);
    }
}

/**
 * Republish a job for retry
 */
export async function republishForRetry(
    job: MessageJob,
    error: string
): Promise<string> {
    try {
        // Increment retry count
        const updatedJob: MessageJob = {
            ...job,
            metadata: {
                ...job.metadata,
                retryCount: job.metadata.retryCount + 1,
                lastAttemptAt: Date.now(),
            },
        };

        // Serialize for stream
        const streamData: Record<string, string> = {
            jobId: updatedJob.jobId,
            userId: updatedJob.userId,
            chatId: updatedJob.chatId,
            message: updatedJob.message,
            agentType: updatedJob.agentType,
            metadata: JSON.stringify(updatedJob.metadata),
        };

        if (updatedJob.imageAttachments) {
            streamData.imageAttachments = JSON.stringify(updatedJob.imageAttachments);
        }

        if (updatedJob.documentAttachments) {
            streamData.documentAttachments = JSON.stringify(updatedJob.documentAttachments);
        }

        // Add back to stream
        const messageId = await addToStream(
            REDIS_STREAMS.MESSAGE_STREAM,
            streamData,
            DEFAULT_STREAM_CONFIG.maxLen
        );

        console.log(`🔄 Republished job ${job.jobId} for retry ${updatedJob.metadata.retryCount}`);

        // Publish retry status
        await publishStatus(job.jobId, {
            jobId: job.jobId,
            status: JobStatus.PENDING,
            timestamp: Date.now(),
            message: `Retry ${updatedJob.metadata.retryCount} after error: ${error}`,
        });

        return messageId;
    } catch (retryError) {
        console.error(`❌ Failed to republish job for retry:`, retryError);
        throw retryError;
    }
}
