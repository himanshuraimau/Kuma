import { Router } from 'express';
import { upload, getChatImagePath } from '../lib/storage';
import * as uploadController from '../controllers/upload.controller';
import { authMiddleware } from '../lib/middleware';
import { prisma } from '../db/prisma';
import { existsSync } from 'fs';
import path from 'path';

const router = Router();

/**
 * Upload and analyze image
 * POST /api/upload/analyze
 */
router.post(
    '/analyze',
    authMiddleware,
    upload.single('image'),
    uploadController.uploadAndAnalyze
);

/**
 * Upload and extract text (OCR)
 * POST /api/upload/extract-text
 */
router.post(
    '/extract-text',
    authMiddleware,
    upload.single('image'),
    uploadController.uploadAndExtractText
);

/**
 * Upload and describe image
 * POST /api/upload/describe
 */
router.post(
    '/describe',
    authMiddleware,
    upload.single('image'),
    uploadController.uploadAndDescribe
);

/**
 * Serve chat image
 * GET /api/upload/chats/:chatId/:filename
 */
router.get('/chats/:chatId/:filename', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user?.id;
        const { chatId, filename } = req.params;

        if (!chatId || !filename) {
            return res.status(400).json({ error: 'Invalid parameters' });
        }

        // Verify user owns this chat
        const chat = await prisma.chats.findUnique({
            where: { id: chatId, userId },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Get image path
        const imagePath = getChatImagePath(chatId, filename);
        
        if (!existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Serve the file
        res.sendFile(path.resolve(imagePath));
    } catch (error) {
        console.error('Error serving chat image:', error);
        res.status(500).json({ error: 'Failed to serve image' });
    }
});

export default router;
