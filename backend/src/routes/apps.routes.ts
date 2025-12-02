import { Router } from 'express';
import { authMiddleware } from '../lib/middleware';
import * as appsController from '../controllers/apps.controller';

const router = Router();

// Get all available apps (requires auth)
router.get('/', authMiddleware, appsController.getApps);

// Get connected apps (requires auth)
router.get('/connected', authMiddleware, appsController.getConnectedApps);

// Get available tools (requires auth)
router.get('/tools', authMiddleware, appsController.getAvailableTools);

// Initiate OAuth connection (requires auth)
router.get('/:appName/connect', authMiddleware, appsController.connectApp);

// OAuth callback (no auth required - state verification instead)
router.get('/:appName/callback', appsController.handleCallback);

// Disconnect app (requires auth)
router.delete('/:appName/disconnect', authMiddleware, appsController.disconnectApp);

export default router;
