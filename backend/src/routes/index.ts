import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import agentsRoutes from './agents.routes';
import appsRoutes from './apps.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/agents', agentsRoutes);
router.use('/apps', appsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

export default router;
