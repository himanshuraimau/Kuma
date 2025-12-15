/**
 * Redis Streams Types for Message Queue System
 */

// Import and re-export types from other modules
import type { ImageAttachment } from '../storage';
import type { DocumentAttachment } from '../documents';

export type { ImageAttachment, DocumentAttachment };

/**
 * Job status in the processing pipeline
 */
export enum JobStatus {
    PENDING = 'pending',           // Message queued, waiting for processing
    PROCESSING = 'processing',     // Worker picked up the message
    STREAMING = 'streaming',       // AI is generating response
    COMPLETED = 'completed',       // Successfully processed and saved
    FAILED = 'failed',             // Error occurred, will retry
    DEAD = 'dead',                 // Failed after max retries, moved to DLQ
}

/**
 * Message job structure in Redis stream
 */
export interface MessageJob {
    jobId: string;
    userId: string;
    chatId: string;
    message: string;
    agentType: string;
    imageAttachments?: ImageAttachment[];
    documentAttachments?: DocumentAttachment[];
    metadata: MessageJobMetadata;
}

/**
 * Metadata for job tracking
 */
export interface MessageJobMetadata {
    clientId?: string;          // Client identifier for routing responses
    timestamp: number;          // When job was created
    retryCount: number;         // Number of retry attempts
    firstAttemptAt?: number;    // Timestamp of first processing attempt
    lastAttemptAt?: number;     // Timestamp of last processing attempt
    processingStartedAt?: number; // When current processing started
}

/**
 * Job status update event
 */
export interface JobStatusUpdate {
    jobId: string;
    status: JobStatus;
    timestamp: number;
    message?: string;           // Status message or error
    progress?: number;          // 0-100 for progress indication
    data?: any;                 // Additional data (e.g., chatId, messageId)
}

/**
 * Job result after processing
 */
export interface JobResult {
    jobId: string;
    chatId: string;
    messageId: string;          // ID of the saved message in database
    response: string;           // AI generated response
    usage?: {                   // Token usage info
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    processingTime: number;     // Time taken in milliseconds
}

/**
 * Dead letter queue entry
 */
export interface DLQEntry {
    jobId: string;
    originalJob: MessageJob;
    error: string;
    stackTrace?: string;
    failedAt: number;
    retryCount: number;
    lastError?: string;
}

/**
 * Redis stream configuration
 */
export interface StreamConfig {
    streamName: string;
    consumerGroup: string;
    consumerName: string;
    maxLen?: number;            // Maximum stream length (trimming)
    blockTime?: number;         // Blocking read timeout in ms
    batchSize?: number;         // Number of messages to read at once
}

/**
 * Consumer options
 */
export interface ConsumerOptions {
    concurrency?: number;       // Number of messages to process in parallel
    claimMinIdleTime?: number;  // Claim messages idle for this duration (ms)
    processingTimeout?: number; // Max time for processing a message (ms)
}

/**
 * Redis stream entry (ioredis format)
 */
export interface StreamEntry {
    id: string;                 // Redis stream entry ID
    message: {                  // Field-value pairs
        [key: string]: string;
    };
}

/**
 * Metrics for monitoring
 */
export interface StreamMetrics {
    streamLength: number;       // Current backlog
    pendingCount: number;       // Messages claimed but not ACKed
    consumerCount: number;      // Active consumers
    processingRate: number;     // Messages/second
    errorRate: number;          // Errors/total messages
    avgProcessingTime: number;  // Average processing time in ms
    dlqSize: number;            // Dead letter queue size
}

/**
 * Retry configuration
 */
export interface RetryConfig {
    maxRetries: number;
    delays: number[];           // Delay in ms for each retry attempt
}

/**
 * Constants
 */
export const REDIS_STREAMS = {
    MESSAGE_STREAM: 'chat:messages',
    DLQ_STREAM: 'chat:messages:dlq',
} as const;

export const REDIS_CONSUMER_GROUPS = {
    CHAT_PROCESSORS: 'chat-processors',
} as const;

export const REDIS_CHANNELS = {
    JOB_STATUS: (jobId: string) => `job:${jobId}:status`,
    CHAT_MESSAGES: (chatId: string) => `chat:${chatId}:messages`,
    USER_NOTIFICATIONS: (userId: string) => `user:${userId}:notifications`,
} as const;

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    delays: [1000, 5000, 15000], // 1s, 5s, 15s
};

export const DEFAULT_STREAM_CONFIG: Partial<StreamConfig> = {
    maxLen: 10000,
    blockTime: 5000,
    batchSize: 10,
};

export const DEFAULT_CONSUMER_OPTIONS: ConsumerOptions = {
    concurrency: 5,
    claimMinIdleTime: 60000,    // 1 minute
    processingTimeout: 300000,  // 5 minutes
};
