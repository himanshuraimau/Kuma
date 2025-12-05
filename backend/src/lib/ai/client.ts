import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Google Generative AI client for Vercel AI SDK
 */
export const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
});

/**
 * Model configurations
 * - fast: For quick responses, general chat
 * - pro: For deep tasks, research, complex reasoning
 */
export const models = {
    fast: google('gemini-2.5-flash'),
    pro: google('gemini-2.5-pro'),
};

/**
 * Get model by name
 */
export function getModel(name: 'fast' | 'pro' = 'fast') {
    return models[name];
}
