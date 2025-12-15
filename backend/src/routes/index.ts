import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import agentsRoutes from './agents.routes';
import appsRoutes from './apps.routes';
import uploadRoutes from './upload.routes';
import memoryRoutes from './memory.routes';
import documentsRoutes from './documents.routes';
import adminRoutes from './admin.routes';

import voiceRoutes from './voice.routes';
import voiceProcessRoutes from './voice-process.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/agents', agentsRoutes);
router.use('/apps', appsRoutes);
router.use('/upload', uploadRoutes);
router.use('/memories', memoryRoutes);
router.use('/documents', documentsRoutes);
router.use('/admin', adminRoutes);
router.use('/voice', voiceRoutes);
router.use('/voice', voiceProcessRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

export default router;
