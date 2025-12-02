import { z } from 'zod';
import type { BaseTool } from '../base.tool';
import { analyzeImage, extractTextFromImage, describeScene } from '../../lib/vision';
import { deleteFile } from '../../lib/storage';

/**
 * Analyze image content
 */
export const analyzeImageTool: BaseTool = {
    name: 'analyze_image',
    description:
        'Analyze an uploaded image and extract information based on a specific question or prompt. Use this when the user uploads an image and asks about its content.',
    category: 'vision',
    requiresAuth: false,
    schema: z.object({
        filepath: z.string().describe('Path to the uploaded image file'),
        prompt: z
            .string()
            .describe('What to analyze or question to answer about the image'),
        mimeType: z
            .string()
            .optional()
            .default('image/jpeg')
            .describe('MIME type of the image'),
    }),

    async execute(input) {
        try {
            const result = await analyzeImage(input.filepath, input.prompt, input.mimeType);

            // Delete the file after analysis
            await deleteFile(input.filepath);

            return result.description;
        } catch (error: any) {
            // Try to delete file even if analysis fails
            await deleteFile(input.filepath);
            throw new Error(`Failed to analyze image: ${error.message}`);
        }
    },
};

/**
 * Extract text from image (OCR)
 */
export const extractTextTool: BaseTool = {
    name: 'extract_text_from_image',
    description:
        'Extract all text from an uploaded image using OCR. Use this when the user uploads a screenshot, document, or any image containing text.',
    category: 'vision',
    requiresAuth: false,
    schema: z.object({
        filepath: z.string().describe('Path to the uploaded image file'),
        mimeType: z
            .string()
            .optional()
            .default('image/jpeg')
            .describe('MIME type of the image'),
    }),

    async execute(input) {
        try {
            const text = await extractTextFromImage(input.filepath, input.mimeType);

            // Delete the file after extraction
            await deleteFile(input.filepath);

            return `Extracted text:\n\n${text}`;
        } catch (error: any) {
            await deleteFile(input.filepath);
            throw new Error(`Failed to extract text: ${error.message}`);
        }
    },
};

/**
 * Describe scene in image
 */
export const describeSceneTool: BaseTool = {
    name: 'describe_image',
    description:
        'Describe what is in an uploaded image in detail. Use this when the user wants to know what an image contains or shows.',
    category: 'vision',
    requiresAuth: false,
    schema: z.object({
        filepath: z.string().describe('Path to the uploaded image file'),
        mimeType: z
            .string()
            .optional()
            .default('image/jpeg')
            .describe('MIME type of the image'),
    }),

    async execute(input) {
        try {
            const description = await describeScene(input.filepath, input.mimeType);

            // Delete the file after description
            await deleteFile(input.filepath);

            return description;
        } catch (error: any) {
            await deleteFile(input.filepath);
            throw new Error(`Failed to describe image: ${error.message}`);
        }
    },
};
