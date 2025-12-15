/**
 * Redis Module Exports
 */

// Client
export { redis, RedisClient } from './client';

// Types
export * from './types';

// Streams
export {
    initializeStream,
    initializeDLQ,
    addToStream,
    readFromStream,
    acknowledgeMessage,
    claimAbandonedMessages,
    getStreamLength,
    getPendingCount,
    getStreamMetrics,
    trimStream,
    deleteMessage,
    getStreamInfo,
    removeConsumer,
} from './streams';

// Producer
export { publishMessage, publishToDLQ, republishForRetry } from './producer';

// Consumer
export { MessageConsumer, type MessageProcessor } from './consumer';

// Status tracking
export {
    publishStatus,
    subscribeToJobStatus,
    getJobStatus,
    publishChatMessage,
    subscribeToChatMessages,
    publishUserNotification,
    subscribeToUserNotifications,
} from './status';
