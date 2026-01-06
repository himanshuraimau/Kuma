/**
 * Redis Consumer - Process messages from stream
 */

import os from 'os';
import { readFromStream, acknowledgeMessage, claimAbandonedMessages } from './streams';
import { publishStatus } from './status';
import { publishToDLQ, republishForRetry } from './producer';
import {
    REDIS_STREAMS,
    REDIS_CONSUMER_GROUPS,
    DEFAULT_RETRY_CONFIG,
    DEFAULT_CONSUMER_OPTIONS,
    JobStatus,
    type MessageJob,
    type StreamEntry,
    type ConsumerOptions,
} from './types';

/**
 * Message processor function type
 */
export type MessageProcessor = (job: MessageJob) => Promise<void>;

/**
 * Consumer class for processing messages from Redis streams
 */
export class MessageConsumer {
    private consumerName: string;
    private isRunning: boolean = false;
    private processor: MessageProcessor;
    private options: Required<ConsumerOptions>;
    private processingCount: number = 0;

    constructor(processor: MessageProcessor, options?: ConsumerOptions) {
        // Generate unique consumer name
        this.consumerName = `worker-${os.hostname()}-${process.pid}-${Date.now()}`;
        this.processor = processor;
        this.options = {
            concurrency: options?.concurrency || DEFAULT_CONSUMER_OPTIONS.concurrency!,
            claimMinIdleTime: options?.claimMinIdleTime || DEFAULT_CONSUMER_OPTIONS.claimMinIdleTime!,
            processingTimeout: options?.processingTimeout || DEFAULT_CONSUMER_OPTIONS.processingTimeout!,
        };
    }

    /**
     * Start consuming messages
     */
    public async start(): Promise<void> {
        if (this.isRunning) {
            console.log('⚠️ Consumer already running');
            return;
        }

        this.isRunning = true;
        console.log(`🚀 Starting consumer: ${this.consumerName}`);
        console.log(`📊 Concurrency: ${this.options.concurrency}`);

        // Start main consumption loop
        this.consumeLoop();

        // Start claiming abandoned messages periodically
        this.startClaimingLoop();
    }

    /**
     * Stop consuming messages
     */
    public async stop(): Promise<void> {
        console.log(`🛑 Stopping consumer: ${this.consumerName}`);
        this.isRunning = false;

        // Wait for in-flight messages to complete
        const maxWaitTime = 30000; // 30 seconds
        const startTime = Date.now();

        while (this.processingCount > 0) {
            if (Date.now() - startTime > maxWaitTime) {
                console.log(`⚠️ Force stopping with ${this.processingCount} messages still processing`);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`✅ Consumer stopped: ${this.consumerName}`);
    }

    /**
     * Main consumption loop
     */
    private async consumeLoop(): Promise<void> {
        while (this.isRunning) {
            try {
                // Check if we can process more messages
                if (this.processingCount >= this.options.concurrency) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                }

                // Read messages from stream
                const entries = await readFromStream(
                    REDIS_STREAMS.MESSAGE_STREAM,
                    REDIS_CONSUMER_GROUPS.CHAT_PROCESSORS,
                    this.consumerName,
                    this.options.concurrency - this.processingCount,
                    5000 // 5 second block time
                );

                // Process each message
                for (const entry of entries) {
                    if (!this.isRunning) break;
                    
                    if (this.processingCount < this.options.concurrency) {
                        this.processMessage(entry);
                    }
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                
                // Check if this is a connection error
                if (errorMessage.includes('not connected') || errorMessage.includes('Connection')) {
                    console.error(`❌ Redis connection error in consume loop, waiting to reconnect...`);
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
                } else {
                    console.error(`❌ Error in consume loop:`, error);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for other errors
                }
            }
        }
    }

    /**
     * Claiming loop for abandoned messages
     */
    private async startClaimingLoop(): Promise<void> {
        const claimInterval = 60000; // 1 minute

        const claim = async () => {
            if (!this.isRunning) return;

            try {
                const abandoned = await claimAbandonedMessages(
                    REDIS_STREAMS.MESSAGE_STREAM,
                    REDIS_CONSUMER_GROUPS.CHAT_PROCESSORS,
                    this.consumerName,
                    this.options.claimMinIdleTime
                );

                if (abandoned.length > 0) {
                    console.log(`⚡ Claimed ${abandoned.length} abandoned messages`);
                    
                    for (const entry of abandoned) {
                        if (!this.isRunning) break;
                        this.processMessage(entry);
                    }
                }
            } catch (error) {
                console.error(`❌ Error claiming abandoned messages:`, error);
            }

            if (this.isRunning) {
                setTimeout(claim, claimInterval);
            }
        };

        setTimeout(claim, claimInterval);
    }

    /**
     * Process a single message
     */
    private async processMessage(entry: StreamEntry): Promise<void> {
        this.processingCount++;
        const { id: messageId, message } = entry;

        try {
            // Parse job from stream entry
            const job = this.parseJob(message);

            console.log(`📨 Processing job ${job.jobId} (messageId: ${messageId})`);

            // Update status
            await publishStatus(job.jobId, {
                jobId: job.jobId,
                status: JobStatus.PROCESSING,
                timestamp: Date.now(),
                message: `Processing by ${this.consumerName}`,
            });

            // Update metadata
            job.metadata.processingStartedAt = Date.now();
            if (!job.metadata.firstAttemptAt) {
                job.metadata.firstAttemptAt = Date.now();
            }

            // Process with timeout
            await this.processWithTimeout(job);

            // Acknowledge successful processing
            await acknowledgeMessage(
                REDIS_STREAMS.MESSAGE_STREAM,
                REDIS_CONSUMER_GROUPS.CHAT_PROCESSORS,
                messageId
            );

            console.log(`✅ Completed job ${job.jobId}`);

        } catch (error) {
            console.error(`❌ Error processing message ${messageId}:`, error);
            await this.handleProcessingError(entry, error as Error);
        } finally {
            this.processingCount--;
        }
    }

    /**
     * Process job with timeout
     */
    private async processWithTimeout(job: MessageJob): Promise<void> {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Processing timeout after ${this.options.processingTimeout}ms`));
            }, this.options.processingTimeout);
        });

        await Promise.race([
            this.processor(job),
            timeoutPromise,
        ]);
    }

    /**
     * Handle processing error
     */
    private async handleProcessingError(entry: StreamEntry, error: Error): Promise<void> {
        try {
            const job = this.parseJob(entry.message);
            const retryCount = job.metadata.retryCount;

            // Check if we should retry or move to DLQ
            if (retryCount < DEFAULT_RETRY_CONFIG.maxRetries) {
                // Retry with backoff
                const delay = DEFAULT_RETRY_CONFIG.delays[retryCount] || 15000;
                
                console.log(`🔄 Will retry job ${job.jobId} after ${delay}ms (attempt ${retryCount + 1}/${DEFAULT_RETRY_CONFIG.maxRetries})`);
                
                // Acknowledge current message
                await acknowledgeMessage(
                    REDIS_STREAMS.MESSAGE_STREAM,
                    REDIS_CONSUMER_GROUPS.CHAT_PROCESSORS,
                    entry.id
                );

                // Wait and republish
                await new Promise(resolve => setTimeout(resolve, delay));
                await republishForRetry(job, error.message);
            } else {
                // Max retries exceeded, move to DLQ
                console.log(`☠️ Max retries exceeded for job ${job.jobId}, moving to DLQ`);
                
                await acknowledgeMessage(
                    REDIS_STREAMS.MESSAGE_STREAM,
                    REDIS_CONSUMER_GROUPS.CHAT_PROCESSORS,
                    entry.id
                );

                await publishToDLQ(job, error.message, error.stack);
            }
        } catch (handleError) {
            console.error(`❌ Error handling processing error:`, handleError);
            // Don't acknowledge - let it be claimed later
        }
    }

    /**
     * Parse job from Redis stream entry
     */
    private parseJob(message: Record<string, string>): MessageJob {
        return {
            jobId: message.jobId!,
            userId: message.userId!,
            chatId: message.chatId!,
            message: message.message!,
            agentType: message.agentType!,
            imageAttachments: message.imageAttachments ? JSON.parse(message.imageAttachments) : undefined,
            documentAttachments: message.documentAttachments ? JSON.parse(message.documentAttachments) : undefined,
            metadata: JSON.parse(message.metadata!),
        };
    }

    /**
     * Get consumer name
     */
    public getConsumerName(): string {
        return this.consumerName;
    }

    /**
     * Get processing count
     */
    public getProcessingCount(): number {
        return this.processingCount;
    }
}
