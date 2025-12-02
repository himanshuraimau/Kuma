import { Router } from 'express';
import { upload } from '../lib/storage';
import * as uploadController from '../controllers/upload.controller';
import { authMiddleware } from '../lib/middleware';

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

export default router;
