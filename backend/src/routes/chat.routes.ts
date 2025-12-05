import { Router } from 'express';
import { authMiddleware } from '../lib/middleware';
import * as chatController from '../controllers/chat.controller';
import { upload } from '../lib/storage';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Send message to agent (non-streaming)
router.post('/', upload.array('images', 5), chatController.sendMessage);

// Send message to agent (streaming - SSE) - supports multimodal
router.post('/stream', upload.array('images', 5), chatController.streamMessage);

// Get all chats
router.get('/', chatController.getChats);

// Get specific chat
router.get('/:id', chatController.getChat);

// Delete chat
router.delete('/:id', chatController.deleteChat);

// Update chat title
router.patch('/:id', chatController.updateChatTitle);

export default router;
