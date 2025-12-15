#!/usr/bin/env bun

/**
 * Worker Entry Point
 * Starts the Redis message worker for processing chat messages
 */

import dotenv from 'dotenv';
import { startMessageWorker } from './src/lib/workers/message-worker';

// Load environment variables
dotenv.config();

console.log('🔧 Starting Kuma AI Message Worker...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📍 Redis URL: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);

// Start the worker
startMessageWorker()
    .then(() => {
        console.log('✅ Worker is running and waiting for messages...');
    })
    .catch((error) => {
        console.error('❌ Failed to start worker:', error);
        process.exit(1);
    });
