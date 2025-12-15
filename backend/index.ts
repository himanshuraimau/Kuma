import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './src/routes';
import { errorHandler } from './src/lib/middleware/error.middleware';
import { redis } from './src/lib/redis/client';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*',
    credentials: true,
    exposedHeaders: ['X-Transcript', 'X-AI-Response', 'X-Chat-Id'], // Expose custom headers to frontend
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        // Initialize Redis if queue is enabled
        if (process.env.USE_REDIS_QUEUE === 'true') {
            console.log('🔄 Initializing Redis connection...');
            await redis.connect();
            const health = await redis.healthCheck();
            if (health) {
                console.log('✅ Redis connected successfully');
            } else {
                console.warn('⚠️ Redis health check failed, but continuing...');
            }
        } else {
            console.log('ℹ️ Redis queue disabled (USE_REDIS_QUEUE=false)');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();