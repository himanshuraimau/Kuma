import { Router } from 'express';
import { getToken, handleWebhook } from '../controllers/voice.controller';
import { authenticate } from '../lib/middleware/auth.middleware';

const router = Router();

// Get LiveKit token
router.post('/token', authenticate, getToken);

// LiveKit Webhook
router.post('/webhook', handleWebhook);

export default router;
