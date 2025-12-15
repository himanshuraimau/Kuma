/**
 * Admin Routes - Monitoring and management
 */

import { Router } from 'express';
import { authenticate } from '../lib/middleware/auth.middleware';
import {
    getRedisHealth,
    getRedisMetrics,
    getJobById,
    getDLQMessages,
    retryDLQMessage,
    trimStreamEndpoint,
} from '../controllers/admin.controller';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authenticate);

// Redis health and metrics
router.get('/redis/health', getRedisHealth);
router.get('/redis/metrics', getRedisMetrics);

// Job management
router.get('/jobs/:jobId', getJobById);

// DLQ management
router.get('/dlq', getDLQMessages);
router.post('/dlq/:messageId/retry', retryDLQMessage);

// Stream management
router.post('/stream/trim', trimStreamEndpoint);

export default router;
