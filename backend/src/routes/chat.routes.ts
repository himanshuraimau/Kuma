import { Router } from 'express';
import { authMiddleware } from '../lib/middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Send message to agent
router.post('/', chatController.sendMessage);

// Get all chats
router.get('/', chatController.getChats);

// Get specific chat
router.get('/:id', chatController.getChat);

// Delete chat
router.delete('/:id', chatController.deleteChat);

// Update chat title
router.patch('/:id', chatController.updateChatTitle);

export default router;
