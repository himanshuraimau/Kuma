import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import type { ImageAttachment } from './storage';
import { getChatImageBase64 } from './storage';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface VisionAnalysisResult {
    description: string;
    confidence?: number;
    metadata?: Record<string, any>;
}

/**
 * Convert image file to base64
 */
async function fileToGenerativePart(filepath: string, mimeType: string) {
    const data = await fs.readFile(filepath);
    return {
        inlineData: {
            data: data.toString('base64'),
            mimeType,
        },
    };
}

/**
 * Analyze image with Gemini Vision
 */
export async function analyzeImage(
    filepath: string,
    prompt: string,
    mimeType: string = 'image/jpeg'
): Promise<VisionAnalysisResult> {
    if (!existsSync(filepath)) {
        throw new Error(`File not found: ${filepath}`);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
        const imagePart = await fileToGenerativePart(filepath, mimeType);

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();

        return {
            description: text,
            metadata: {
                model: 'gemini-2.5-pro',
                timestamp: new Date().toISOString(),
            },
        };
    } catch (error: any) {
        throw new Error(`Vision analysis failed: ${error.message}`);
    }
}

/**
 * Extract text from image (OCR)
 */
export async function extractTextFromImage(
    filepath: string,
    mimeType: string = 'image/jpeg'
): Promise<string> {
    const result = await analyzeImage(
        filepath,
        'Extract all text from this image. Return only the text content, nothing else.',
        mimeType
    );
    return result.description;
}

/**
 * Describe scene in image
 */
export async function describeScene(
    filepath: string,
    mimeType: string = 'image/jpeg'
): Promise<string> {
    const result = await analyzeImage(
        filepath,
        'Describe what you see in this image in detail. Include objects, people, actions, colors, and setting.',
        mimeType
    );
    return result.description;
}

/**
 * Answer question about image
 */
export async function answerImageQuestion(
    filepath: string,
    question: string,
    mimeType: string = 'image/jpeg'
): Promise<string> {
    const result = await analyzeImage(filepath, question, mimeType);
    return result.description;
}

/**
 * Build multimodal content parts for Gemini API
 * Combines text and images in the format Gemini expects
 */
export async function buildMultimodalParts(
    text: string,
    chatId: string,
    imageAttachments: ImageAttachment[]
): Promise<any[]> {
    const parts: any[] = [];
    
    // Add text part first
    if (text && text.trim()) {
        parts.push({ text: text.trim() });
    }
    
    // Add image parts
    for (const attachment of imageAttachments) {
        const base64Data = await getChatImageBase64(chatId, attachment.filename);
        parts.push({
            inlineData: {
                mimeType: attachment.mimetype,
                data: base64Data,
            },
        });
    }
    
    return parts;
}

/**
 * Generate content with multimodal input (text + images)
 * Uses Gemini API directly for streaming support with images
 */
export async function generateMultimodalContent(options: {
    prompt: string;
    chatId: string;
    imageAttachments: ImageAttachment[];
    model?: string;
}): Promise<VisionAnalysisResult> {
    const { prompt, chatId, imageAttachments, model = 'gemini-2.5-pro' } = options;
    
    try {
        const genModel = genAI.getGenerativeModel({ model });
        const parts = await buildMultimodalParts(prompt, chatId, imageAttachments);
        
        const result = await genModel.generateContent(parts);
        const response = result.response;
        const text = response.text();
        
        return {
            description: text,
            metadata: {
                model,
                timestamp: new Date().toISOString(),
                imageCount: imageAttachments.length,
            },
        };
    } catch (error: any) {
        throw new Error(`Multimodal generation failed: ${error.message}`);
    }
}

/**
 * Stream multimodal content (text + images)
 * Uses Gemini API streaming for real-time responses
 */
export async function streamMultimodalContent(options: {
    prompt: string;
    chatId: string;
    imageAttachments: ImageAttachment[];
    model?: string;
    onChunk: (chunk: string) => void;
}): Promise<string> {
    const { prompt, chatId, imageAttachments, model = 'gemini-2.5-pro', onChunk } = options;
    
    try {
        const genModel = genAI.getGenerativeModel({ model });
        const parts = await buildMultimodalParts(prompt, chatId, imageAttachments);
        
        const result = await genModel.generateContentStream(parts);
        let fullText = '';
        
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            onChunk(chunkText);
        }
        
        return fullText;
    } catch (error: any) {
        throw new Error(`Multimodal streaming failed: ${error.message}`);
    }
}
