import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import { existsSync } from 'fs';

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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const imagePart = await fileToGenerativePart(filepath, mimeType);

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response;
        const text = response.text();

        return {
            description: text,
            metadata: {
                model: 'gemini-1.5-flash',
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
