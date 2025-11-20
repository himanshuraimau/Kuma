import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import agentsRoutes from './agents.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/agents', agentsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

export default router;
