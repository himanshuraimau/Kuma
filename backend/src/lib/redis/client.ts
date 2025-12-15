/**
 * Redis Client Singleton
 * Manages Redis connection with health checks and graceful shutdown
 */

import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';

class RedisClient {
    private static instance: RedisClient;
    private client: Redis | null = null;
    private subscriber: Redis | null = null; // Separate client for pub/sub
    private isConnected: boolean = false;
    private isShuttingDown: boolean = false;

    private constructor() {}

    /**
     * Get singleton instance
     */
    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    /**
     * Initialize Redis connection
     */
    public async connect(): Promise<void> {
        if (this.client && this.isConnected) {
            console.log('✅ Redis already connected');
            return;
        }

        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        const maxRetries = parseInt(process.env.REDIS_MAX_RETRIES || '3', 10);
        const retryDelay = parseInt(process.env.REDIS_RETRY_DELAY || '1000', 10);

        const options: RedisOptions = {
            maxRetriesPerRequest: maxRetries,
            retryStrategy: (times: number) => {
                if (this.isShuttingDown) {
                    return null; // Stop retrying during shutdown
                }
                if (times > maxRetries) {
                    console.error(`❌ Redis connection failed after ${maxRetries} retries`);
                    return null;
                }
                const delay = Math.min(times * retryDelay, 10000);
                console.log(`🔄 Retrying Redis connection in ${delay}ms (attempt ${times}/${maxRetries})`);
                return delay;
            },
            enableReadyCheck: true,
            lazyConnect: true, // Connect manually to handle errors
        };

        try {
            // Main client for commands and streams
            this.client = new Redis(redisUrl, options);

            // Subscriber client for pub/sub (can't share with command client)
            this.subscriber = new Redis(redisUrl, options);

            // Setup event handlers
            this.setupEventHandlers(this.client, 'Main');
            this.setupEventHandlers(this.subscriber, 'Subscriber');

            // Connect
            await Promise.all([
                this.client.connect(),
                this.subscriber.connect(),
            ]);

            this.isConnected = true;
            console.log('✅ Redis connected successfully');
            console.log(`📍 Redis URL: ${redisUrl}`);
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error);
            throw new Error('Redis connection failed');
        }
    }

    /**
     * Setup event handlers for Redis client
     */
    private setupEventHandlers(client: Redis, clientName: string): void {
        client.on('connect', () => {
            console.log(`🔌 Redis ${clientName} client connecting...`);
        });

        client.on('ready', () => {
            console.log(`✅ Redis ${clientName} client ready`);
        });

        client.on('error', (error) => {
            console.error(`❌ Redis ${clientName} client error:`, error);
        });

        client.on('close', () => {
            console.log(`🔌 Redis ${clientName} client connection closed`);
            if (!this.isShuttingDown) {
                this.isConnected = false;
            }
        });

        client.on('reconnecting', () => {
            console.log(`🔄 Redis ${clientName} client reconnecting...`);
        });

        client.on('end', () => {
            console.log(`🛑 Redis ${clientName} client ended`);
        });
    }

    /**
     * Get main Redis client
     */
    public getClient(): Redis {
        if (!this.client || !this.isConnected) {
            throw new Error('Redis client not connected. Call connect() first.');
        }
        return this.client;
    }

    /**
     * Get subscriber client (for pub/sub)
     */
    public getSubscriber(): Redis {
        if (!this.subscriber || !this.isConnected) {
            throw new Error('Redis subscriber not connected. Call connect() first.');
        }
        return this.subscriber;
    }

    /**
     * Health check
     */
    public async healthCheck(): Promise<boolean> {
        try {
            if (!this.client) return false;
            const result = await this.client.ping();
            return result === 'PONG';
        } catch (error) {
            console.error('❌ Redis health check failed:', error);
            return false;
        }
    }

    /**
     * Get connection status
     */
    public isReady(): boolean {
        return this.isConnected && this.client !== null;
    }

    /**
     * Get Redis info
     */
    public async getInfo(): Promise<string> {
        if (!this.client) throw new Error('Redis client not connected');
        return await this.client.info();
    }

    /**
     * Graceful shutdown
     */
    public async disconnect(): Promise<void> {
        if (this.isShuttingDown) {
            console.log('⚠️ Redis already shutting down');
            return;
        }

        this.isShuttingDown = true;
        console.log('🛑 Shutting down Redis connections...');

        try {
            const disconnectPromises: Promise<any>[] = [];

            if (this.client) {
                disconnectPromises.push(
                    this.client.quit().catch((err) => {
                        console.error('Error disconnecting main client:', err);
                        return this.client!.disconnect();
                    })
                );
            }

            if (this.subscriber) {
                disconnectPromises.push(
                    this.subscriber.quit().catch((err) => {
                        console.error('Error disconnecting subscriber:', err);
                        return this.subscriber!.disconnect();
                    })
                );
            }

            await Promise.all(disconnectPromises);

            this.client = null;
            this.subscriber = null;
            this.isConnected = false;

            console.log('✅ Redis disconnected successfully');
        } catch (error) {
            console.error('❌ Error during Redis disconnect:', error);
            // Force disconnect
            this.client?.disconnect();
            this.subscriber?.disconnect();
        }
    }
}

// Export singleton instance
export const redis = RedisClient.getInstance();

// Export class for testing
export { RedisClient };

// Graceful shutdown handlers
let shutdownInProgress = false;

async function gracefulShutdown(signal: string) {
    if (shutdownInProgress) return;
    shutdownInProgress = true;

    console.log(`\n📥 Received ${signal}, shutting down gracefully...`);

    try {
        await redis.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});
