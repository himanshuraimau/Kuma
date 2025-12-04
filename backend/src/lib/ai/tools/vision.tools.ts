import { tool } from 'ai';
import { z } from 'zod';
import { analyzeImage, extractTextFromImage, describeScene } from '../../vision';
import { deleteFile } from '../../storage';

/**
 * Analyze image content
 */
export const analyzeImageTool = tool({
    description: 'Analyze an uploaded image and extract information based on a specific question or prompt. Use this when the user uploads an image and asks about its content.',
    inputSchema: z.object({
        filepath: z.string().describe('Path to the uploaded image file'),
        prompt: z.string().describe('What to analyze or question to answer about the image'),
        mimeType: z.string().optional().default('image/jpeg').describe('MIME type of the image'),
    }),
    execute: async ({ filepath, prompt, mimeType = 'image/jpeg' }: { filepath: string; prompt: string; mimeType?: string }) => {
        try {
            const result = await analyzeImage(filepath, prompt, mimeType);
            await deleteFile(filepath);
            return result.description;
        } catch (error: any) {
            await deleteFile(filepath);
            throw new Error(`Failed to analyze image: ${error.message}`);
        }
    },
});

/**
 * Extract text from image (OCR)
 */
export const extractTextTool = tool({
    description: 'Extract all text from an uploaded image using OCR. Use this when the user uploads a screenshot, document, or any image containing text.',
    inputSchema: z.object({
        filepath: z.string().describe('Path to the uploaded image file'),
        mimeType: z.string().optional().default('image/jpeg').describe('MIME type of the image'),
    }),
    execute: async ({ filepath, mimeType = 'image/jpeg' }: { filepath: string; mimeType?: string }) => {
        try {
            const text = await extractTextFromImage(filepath, mimeType);
            await deleteFile(filepath);
            return `Extracted text:\n\n${text}`;
        } catch (error: any) {
            await deleteFile(filepath);
            throw new Error(`Failed to extract text: ${error.message}`);
        }
    },
});

/**
 * Describe scene in image
 */
export const describeImageTool = tool({
    description: 'Describe what is in an uploaded image in detail. Use this when the user wants to know what an image contains or shows.',
    inputSchema: z.object({
        filepath: z.string().describe('Path to the uploaded image file'),
        mimeType: z.string().optional().default('image/jpeg').describe('MIME type of the image'),
    }),
    execute: async ({ filepath, mimeType = 'image/jpeg' }: { filepath: string; mimeType?: string }) => {
        try {
            const description = await describeScene(filepath, mimeType);
            await deleteFile(filepath);
            return description;
        } catch (error: any) {
            await deleteFile(filepath);
            throw new Error(`Failed to describe image: ${error.message}`);
        }
    },
});

/**
 * Export all vision tools
 */
export const visionTools = {
    analyzeImage: analyzeImageTool,
    extractText: extractTextTool,
    describeImage: describeImageTool,
};
