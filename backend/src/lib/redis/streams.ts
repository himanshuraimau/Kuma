/**
 * Redis Streams Operations
 * Handles stream creation, consumer groups, and low-level stream operations
 */

import type Redis from 'ioredis';
import { redis } from './client';
import {
    REDIS_STREAMS,
    REDIS_CONSUMER_GROUPS,
    DEFAULT_STREAM_CONFIG,
    type StreamConfig,
    type StreamEntry,
    type StreamMetrics,
} from './types';

/**
 * Initialize stream and consumer group
 */
export async function initializeStream(
    streamName: string = REDIS_STREAMS.MESSAGE_STREAM,
    consumerGroup: string = REDIS_CONSUMER_GROUPS.CHAT_PROCESSORS
): Promise<void> {
    const client = redis.getClient();

    try {
        // Try to create consumer group
        // If stream doesn't exist, this will create it with ID 0
        await client.xgroup('CREATE', streamName, consumerGroup, '0', 'MKSTREAM');
        console.log(`✅ Created stream "${streamName}" with consumer group "${consumerGroup}"`);
    } catch (error: any) {
        if (error.message.includes('BUSYGROUP')) {
            // Consumer group already exists, that's fine
            console.log(`ℹ️ Consumer group "${consumerGroup}" already exists for stream "${streamName}"`);
        } else {
            console.error(`❌ Error creating stream/consumer group:`, error);
            throw error;
        }
    }
}

/**
 * Initialize Dead Letter Queue stream
 */
export async function initializeDLQ(): Promise<void> {
    const client = redis.getClient();
    const dlqStream = REDIS_STREAMS.DLQ_STREAM;

    try {
        // Just ensure the DLQ stream exists (no consumer group needed)
        const exists = await client.exists(dlqStream);
        if (!exists) {
            // Add a dummy entry to create the stream, then delete it
            const id = await client.xadd(dlqStream, '*', 'init', 'true');
            if (id) {
                await client.xdel(dlqStream, id);
            }
            console.log(`✅ Initialized DLQ stream "${dlqStream}"`);
        }
    } catch (error) {
        console.error(`❌ Error initializing DLQ:`, error);
        throw error;
    }
}

/**
 * Add message to stream
 */
export async function addToStream(
    streamName: string,
    data: Record<string, string | number | boolean>,
    maxLen?: number
): Promise<string> {
    const client = redis.getClient();

    try {
        const fields: (string | number)[] = [];
        
        // Convert data to flat array [key1, value1, key2, value2, ...]
        for (const [key, value] of Object.entries(data)) {
            fields.push(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }

        // Add to stream with optional trimming
        const args: (string | number)[] = [streamName];
        
        if (maxLen) {
            args.push('MAXLEN', '~', maxLen); // ~ for approximate trimming (more efficient)
        }
        
        args.push('*', ...fields); // * = auto-generate ID

        const messageId = await client.xadd(...(args as [any, ...any[]]));
        return messageId as string;
    } catch (error) {
        console.error(`❌ Error adding to stream "${streamName}":`, error);
        throw error;
    }
}

/**
 * Read from stream (consumer group)
 */
export async function readFromStream(
    streamName: string,
    consumerGroup: string,
    consumerName: string,
    count: number = 10,
    blockMs: number = 5000
): Promise<StreamEntry[]> {
    const client = redis.getClient();

    try {
        // XREADGROUP GROUP <group> <consumer> BLOCK <ms> COUNT <count> STREAMS <stream> >
        // '>' means read only new messages not yet delivered to any consumer
        const result: any = await client.xreadgroup(
            'GROUP',
            consumerGroup,
            consumerName,
            'BLOCK',
            blockMs,
            'COUNT',
            count,
            'STREAMS',
            streamName,
            '>'
        );

        if (!result) {
            return []; // No new messages
        }

        // Result format: [[streamName, [[id, [field, value, ...]], ...]]]
        const [, messages] = result[0];
        
        return messages.map(([id, fields]: [string, string[]]) => {
            const message: Record<string, string> = {};
            
            // Convert flat array to object
            for (let i = 0; i < fields.length; i += 2) {
                const key = fields[i];
                const value = fields[i + 1];
                if (key && value !== undefined) {
                    message[key] = value;
                }
            }

            return { id, message };
        });
    } catch (error) {
        console.error(`❌ Error reading from stream "${streamName}":`, error);
        throw error;
    }
}

/**
 * Acknowledge message (mark as processed)
 */
export async function acknowledgeMessage(
    streamName: string,
    consumerGroup: string,
    messageId: string
): Promise<number> {
    const client = redis.getClient();

    try {
        const acknowledged = await client.xack(streamName, consumerGroup, messageId);
        return acknowledged;
    } catch (error) {
        console.error(`❌ Error acknowledging message ${messageId}:`, error);
        throw error;
    }
}

/**
 * Claim abandoned messages (for handling dead workers)
 */
export async function claimAbandonedMessages(
    streamName: string,
    consumerGroup: string,
    consumerName: string,
    minIdleTime: number = 60000 // 1 minute
): Promise<StreamEntry[]> {
    const client = redis.getClient();

    try {
        // Get pending messages
        const pending = await client.xpending(streamName, consumerGroup, '-', '+', 10);

        if (!pending || pending.length === 0) {
            return [];
        }

        // Claim messages that have been idle too long
        const messageIds = pending
            .filter((msg: any) => msg[2] >= minIdleTime)
            .map((msg: any) => msg[0]);

        if (messageIds.length === 0) {
            return [];
        }

        // XCLAIM to take ownership
        const claimed: any = await client.xclaim(
            streamName,
            consumerGroup,
            consumerName,
            minIdleTime,
            ...messageIds
        );

        return claimed.map(([id, fields]: [string, string[]]) => {
            const message: Record<string, string> = {};
            for (let i = 0; i < fields.length; i += 2) {
                const key = fields[i];
                const value = fields[i + 1];
                if (key && value !== undefined) {
                    message[key] = value;
                }
            }
            return { id, message };
        });
    } catch (error) {
        console.error(`❌ Error claiming abandoned messages:`, error);
        return [];
    }
}

/**
 * Get stream length
 */
export async function getStreamLength(streamName: string): Promise<number> {
    const client = redis.getClient();
    return await client.xlen(streamName);
}

/**
 * Get pending message count
 */
export async function getPendingCount(
    streamName: string,
    consumerGroup: string
): Promise<number> {
    const client = redis.getClient();

    try {
        const info: any = await client.xpending(streamName, consumerGroup);
        return info ? (info[0] as number) : 0; // First element is pending count
    } catch (error) {
        console.error(`❌ Error getting pending count:`, error);
        return 0;
    }
}

/**
 * Get stream metrics for monitoring
 */
export async function getStreamMetrics(
    streamName: string,
    consumerGroup: string
): Promise<Partial<StreamMetrics>> {
    const client = redis.getClient();

    try {
        const [streamLength, pendingCount] = await Promise.all([
            getStreamLength(streamName),
            getPendingCount(streamName, consumerGroup),
        ]);

        // Get consumer info
        let consumerCount = 0;
        try {
            const groups: any = await client.xinfo('GROUPS', streamName);
            const groupInfo = groups.find((g: any) => g[1] === consumerGroup);
            if (groupInfo) {
                const consumers: any = await client.xinfo('CONSUMERS', streamName, consumerGroup);
                consumerCount = consumers.length;
            }
        } catch (error) {
            // Group might not exist yet
            consumerCount = 0;
        }

        return {
            streamLength,
            pendingCount,
            consumerCount,
        };
    } catch (error) {
        console.error(`❌ Error getting stream metrics:`, error);
        return {};
    }
}

/**
 * Trim stream to maximum length
 */
export async function trimStream(
    streamName: string,
    maxLen: number = 10000
): Promise<number> {
    const client = redis.getClient();

    try {
        const trimmed = await client.xtrim(streamName, 'MAXLEN', '~', maxLen);
        if (trimmed > 0) {
            console.log(`🗑️ Trimmed ${trimmed} messages from stream "${streamName}"`);
        }
        return trimmed;
    } catch (error) {
        console.error(`❌ Error trimming stream "${streamName}":`, error);
        return 0;
    }
}

/**
 * Delete message from stream
 */
export async function deleteMessage(
    streamName: string,
    messageId: string
): Promise<number> {
    const client = redis.getClient();
    return await client.xdel(streamName, messageId);
}

/**
 * Get stream info
 */
export async function getStreamInfo(streamName: string): Promise<any> {
    const client = redis.getClient();
    try {
        return await client.xinfo('STREAM', streamName);
    } catch (error) {
        console.error(`❌ Error getting stream info:`, error);
        return null;
    }
}

/**
 * Cleanup - remove consumer from group
 */
export async function removeConsumer(
    streamName: string,
    consumerGroup: string,
    consumerName: string
): Promise<void> {
    const client = redis.getClient();
    
    try {
        await client.xgroup('DELCONSUMER', streamName, consumerGroup, consumerName);
        console.log(`✅ Removed consumer "${consumerName}" from group "${consumerGroup}"`);
    } catch (error) {
        console.error(`❌ Error removing consumer:`, error);
    }
}
