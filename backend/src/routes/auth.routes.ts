import { Router } from 'express';
import { signup, login, me, logout } from '../controllers/auth.controller';
import { authenticate } from '../lib/middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
