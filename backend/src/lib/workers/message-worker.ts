/**
 * Message Worker - Consumes and processes chat messages from Redis stream
 */

import { MessageConsumer, type MessageProcessor, redis, initializeStream, initializeDLQ } from '../redis';
import { streamAgent } from '../ai/agents/agent';
import { prisma } from '../../db/prisma';
import { publishStatus, publishChatMessage } from '../redis/status';
import { JobStatus, type MessageJob } from '../redis/types';

/**
 * Process a chat message job
 */
const processMessage: MessageProcessor = async (job: MessageJob) => {
    const { jobId, userId, chatId, message, agentType, imageAttachments, documentAttachments } = job;

    console.log(`🤖 Processing chat message: ${jobId}`);
    console.log(`   User: ${userId}, Chat: ${chatId}, Agent: ${agentType}`);

    try {
        // Update status to streaming
        await publishStatus(jobId, {
            jobId,
            status: JobStatus.STREAMING,
            timestamp: Date.now(),
            message: 'AI generating response',
            progress: 50,
        });

        let fullResponse = '';
        let toolCallsData: any[] = [];

        // Stream the AI response (this saves messages to DB internally)
        await streamAgent({
            agentName: agentType as any,
            userId,
            chatId,
            message: message.trim(),
            imageAttachments,
            documentAttachments,
            onChunk: (chunk) => {
                fullResponse += chunk;
                // Could publish streaming chunks via pub/sub here if needed
            },
            onToolCall: (toolName, args) => {
                toolCallsData.push({ toolName, args });
                console.log(`🔧 Tool call: ${toolName}`);
            },
            onToolResult: (toolName, result) => {
                console.log(`✅ Tool result: ${toolName}`);
            },
            onFinish: (response) => {
                fullResponse = response;
                console.log(`✨ AI response complete (${response.length} chars)`);
            },
        });

        // Get the saved assistant message from DB
        const assistantMessage = await prisma.messages.findFirst({
            where: {
                chatId,
                role: 'assistant',
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 1,
        });

        if (!assistantMessage) {
            throw new Error('Assistant message not found in database');
        }

        // Publish completion status
        await publishStatus(jobId, {
            jobId,
            status: JobStatus.COMPLETED,
            timestamp: Date.now(),
            message: 'Message processed successfully',
            progress: 100,
            data: {
                chatId,
                messageId: assistantMessage.id,
                responseLength: fullResponse.length,
                toolCalls: toolCallsData.length,
            },
        });

        // Publish new message notification via pub/sub
        await publishChatMessage(chatId, {
            messageId: assistantMessage.id,
            content: fullResponse,
            role: 'assistant',
        });

        console.log(`✅ Job ${jobId} completed successfully`);

    } catch (error) {
        console.error(`❌ Error processing job ${jobId}:`, error);

        // Publish error status
        await publishStatus(jobId, {
            jobId,
            status: JobStatus.FAILED,
            timestamp: Date.now(),
            message: error instanceof Error ? error.message : 'Unknown error',
        });

        // Re-throw to trigger retry logic in consumer
        throw error;
    }
};

/**
 * Start the message worker
 */
export async function startMessageWorker() {
    console.log('🚀 Starting Message Worker...');

    try {
        // Initialize Redis connection
        await redis.connect();
        console.log('✅ Redis connected');

        // Initialize streams and consumer groups
        await initializeStream();
        console.log('✅ Message stream initialized');

        await initializeDLQ();
        console.log('✅ DLQ stream initialized');

        // Create and start consumer
        const consumer = new MessageConsumer(processMessage, {
            concurrency: 5, // Process 5 messages concurrently
            claimMinIdleTime: 60000, // Claim messages idle > 1 minute
            processingTimeout: 300000, // 5 minute timeout per message
        });

        await consumer.start();

        console.log('✅ Message worker started successfully');
        console.log(`📊 Consumer: ${consumer.getConsumerName()}`);

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            console.log(`\n📥 Received ${signal}, shutting down worker...`);
            
            try {
                await consumer.stop();
                await redis.disconnect();
                console.log('✅ Worker shutdown complete');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        return consumer;

    } catch (error) {
        console.error('❌ Failed to start message worker:', error);
        throw error;
    }
}

/**
 * Main entry point (if run directly)
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    startMessageWorker().catch((error) => {
        console.error('❌ Worker failed:', error);
        process.exit(1);
    });
}
