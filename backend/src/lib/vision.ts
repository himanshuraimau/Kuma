import { generateText } from 'ai';
import { openai } from './ai/client';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import type { ImageAttachment } from './storage';
import { getChatImageBase64 } from './storage';
import type { DocumentAttachment } from './documents';
import { buildDocumentContext } from './documents';

export interface VisionAnalysisResult {
    description: string;
    confidence?: number;
    metadata?: Record<string, any>;
}

/**
 * Analyze image with OpenAI Vision (GPT-4o)
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
        // Read image and convert to base64
        const imageBuffer = await fs.readFile(filepath);
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        const { text } = await generateText({
            model: openai('gpt-4o'),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image', image: dataUrl },
                    ],
                },
            ],
        });

        return {
            description: text,
            metadata: {
                model: 'gpt-4o',
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
 * Build image content for OpenAI messages format
 */
async function buildImageContent(
    chatId: string,
    imageAttachments: ImageAttachment[]
): Promise<Array<{ type: 'image'; image: string }>> {
    const imageContent: Array<{ type: 'image'; image: string }> = [];
    
    for (const attachment of imageAttachments) {
        const base64Data = await getChatImageBase64(chatId, attachment.filename);
        const dataUrl = `data:${attachment.mimetype};base64,${base64Data}`;
        imageContent.push({ type: 'image', image: dataUrl });
    }
    
    return imageContent;
}

/**
 * Generate content with multimodal input (text + images)
 * Uses OpenAI GPT-4o for vision capabilities
 */
export async function generateMultimodalContent(options: {
    prompt: string;
    chatId: string;
    imageAttachments: ImageAttachment[];
    model?: string;
}): Promise<VisionAnalysisResult> {
    const { prompt, chatId, imageAttachments, model = 'gpt-4o' } = options;
    
    try {
        const imageContent = await buildImageContent(chatId, imageAttachments);
        
        const { text } = await generateText({
            model: openai(model),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        ...imageContent,
                    ],
                },
            ],
        });
        
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
 * Stream multimodal content (text + images + documents)
 * Uses OpenAI GPT-4o for streaming responses with vision
 */
export async function streamMultimodalContent(options: {
    prompt: string;
    chatId: string;
    imageAttachments?: ImageAttachment[];
    documentAttachments?: DocumentAttachment[];
    model?: string;
    onChunk: (chunk: string) => void;
}): Promise<string> {
    const { prompt, chatId, imageAttachments, documentAttachments, model = 'gpt-4o', onChunk } = options;
    
    try {
        const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: string }> = [];
        
        // Build the user message content
        let textContent = prompt;
        
        // Add document context if present
        if (documentAttachments && documentAttachments.length > 0) {
            textContent = buildDocumentContext(prompt, documentAttachments);
        }
        
        content.push({ type: 'text', text: textContent });
        
        // Add images if present
        if (imageAttachments && imageAttachments.length > 0) {
            const imageContent = await buildImageContent(chatId, imageAttachments);
            content.push(...imageContent);
        }
        
        // Use streamText from AI SDK for streaming
        const { streamText } = await import('ai');
        const result = streamText({
            model: openai(model),
            messages: [
                {
                    role: 'user',
                    content: content as any,
                },
            ],
        });
        
        let fullText = '';
        
        for await (const chunk of result.textStream) {
            fullText += chunk;
            onChunk(chunk);
        }
        
        return fullText;
    } catch (error: any) {
        throw new Error(`Multimodal streaming failed: ${error.message}`);
    }
}
