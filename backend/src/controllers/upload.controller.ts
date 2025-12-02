import type { Request, Response } from 'express';
import path from 'path';
import { analyzeImage, extractTextFromImage, describeScene } from '../lib/vision';
import { deleteFile } from '../lib/storage';

/**
 * Upload and analyze image
 * POST /api/upload/analyze
 */
export async function uploadAndAnalyze(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { prompt } = req.body;
        if (!prompt) {
            await deleteFile(req.file.path);
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const result = await analyzeImage(req.file.path, prompt, req.file.mimetype);

        // Delete file after analysis
        await deleteFile(req.file.path);

        return res.json({
            success: true,
            analysis: result.description,
            metadata: result.metadata,
        });
    } catch (error: any) {
        // Clean up file on error
        if (req.file) {
            await deleteFile(req.file.path);
        }
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Upload and extract text (OCR)
 * POST /api/upload/extract-text
 */
export async function uploadAndExtractText(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const text = await extractTextFromImage(req.file.path, req.file.mimetype);

        // Delete file after extraction
        await deleteFile(req.file.path);

        return res.json({
            success: true,
            text,
        });
    } catch (error: any) {
        if (req.file) {
            await deleteFile(req.file.path);
        }
        return res.status(500).json({ error: error.message });
    }
}

/**
 * Upload and describe image
 * POST /api/upload/describe
 */
export async function uploadAndDescribe(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const description = await describeScene(req.file.path, req.file.mimetype);

        // Delete file after description
        await deleteFile(req.file.path);

        return res.json({
            success: true,
            description,
        });
    } catch (error: any) {
        if (req.file) {
            await deleteFile(req.file.path);
        }
        return res.status(500).json({ error: error.message });
    }
}
