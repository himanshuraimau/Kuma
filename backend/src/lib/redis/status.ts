/**
 * Redis Status Tracking - Pub/Sub for real-time job status updates
 */

import { redis } from './client';
import { REDIS_CHANNELS, type JobStatusUpdate } from './types';

/**
 * Publish job status update
 */
export async function publishStatus(
    jobId: string,
    statusUpdate: JobStatusUpdate
): Promise<void> {
    try {
        const client = redis.getClient();
        const channel = REDIS_CHANNELS.JOB_STATUS(jobId);
        const message = JSON.stringify(statusUpdate);

        await client.publish(channel, message);
        
        // Also set in Redis with TTL for status polling
        await client.setex(
            `job:${jobId}:status`,
            3600, // 1 hour TTL
            message
        );
    } catch (error) {
        console.error(`❌ Failed to publish status for job ${jobId}:`, error);
        // Don't throw - status updates are non-critical
    }
}

/**
 * Subscribe to job status updates
 */
export async function subscribeToJobStatus(
    jobId: string,
    callback: (update: JobStatusUpdate) => void
): Promise<() => void> {
    const subscriber = redis.getSubscriber();
    const channel = REDIS_CHANNELS.JOB_STATUS(jobId);

    const messageHandler = (ch: string, message: string) => {
        if (ch === channel) {
            try {
                const update: JobStatusUpdate = JSON.parse(message);
                callback(update);
            } catch (error) {
                console.error(`❌ Failed to parse status update:`, error);
            }
        }
    };

    subscriber.on('message', messageHandler);
    await subscriber.subscribe(channel);

    console.log(`📡 Subscribed to status updates for job ${jobId}`);

    // Return unsubscribe function
    return async () => {
        subscriber.off('message', messageHandler);
        await subscriber.unsubscribe(channel);
        console.log(`🔇 Unsubscribed from job ${jobId} status`);
    };
}

/**
 * Get current job status from Redis
 */
export async function getJobStatus(jobId: string): Promise<JobStatusUpdate | null> {
    try {
        const client = redis.getClient();
        const statusStr = await client.get(`job:${jobId}:status`);

        if (!statusStr) {
            return null;
        }

        return JSON.parse(statusStr) as JobStatusUpdate;
    } catch (error) {
        console.error(`❌ Failed to get status for job ${jobId}:`, error);
        return null;
    }
}

/**
 * Publish chat message notification
 */
export async function publishChatMessage(
    chatId: string,
    message: { messageId: string; content: string; role: string }
): Promise<void> {
    try {
        const client = redis.getClient();
        const channel = REDIS_CHANNELS.CHAT_MESSAGES(chatId);
        
        await client.publish(channel, JSON.stringify(message));
    } catch (error) {
        console.error(`❌ Failed to publish chat message:`, error);
    }
}

/**
 * Subscribe to chat messages
 */
export async function subscribeToChatMessages(
    chatId: string,
    callback: (message: any) => void
): Promise<() => void> {
    const subscriber = redis.getSubscriber();
    const channel = REDIS_CHANNELS.CHAT_MESSAGES(chatId);

    const messageHandler = (ch: string, msg: string) => {
        if (ch === channel) {
            try {
                callback(JSON.parse(msg));
            } catch (error) {
                console.error(`❌ Failed to parse chat message:`, error);
            }
        }
    };

    subscriber.on('message', messageHandler);
    await subscriber.subscribe(channel);

    return async () => {
        subscriber.off('message', messageHandler);
        await subscriber.unsubscribe(channel);
    };
}

/**
 * Publish user notification
 */
export async function publishUserNotification(
    userId: string,
    notification: { type: string; title: string; message: string; data?: any }
): Promise<void> {
    try {
        const client = redis.getClient();
        const channel = REDIS_CHANNELS.USER_NOTIFICATIONS(userId);
        
        await client.publish(channel, JSON.stringify(notification));
    } catch (error) {
        console.error(`❌ Failed to publish user notification:`, error);
    }
}

/**
 * Subscribe to user notifications
 */
export async function subscribeToUserNotifications(
    userId: string,
    callback: (notification: any) => void
): Promise<() => void> {
    const subscriber = redis.getSubscriber();
    const channel = REDIS_CHANNELS.USER_NOTIFICATIONS(userId);

    const messageHandler = (ch: string, msg: string) => {
        if (ch === channel) {
            try {
                callback(JSON.parse(msg));
            } catch (error) {
                console.error(`❌ Failed to parse notification:`, error);
            }
        }
    };

    subscriber.on('message', messageHandler);
    await subscriber.subscribe(channel);

    return async () => {
        subscriber.off('message', messageHandler);
        await subscriber.unsubscribe(channel);
    };
}
