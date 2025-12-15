import { createOpenAI } from '@ai-sdk/openai';

/**
 * OpenAI client for Vercel AI SDK
 */
export const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Model configurations
 * - fast: For quick responses, general chat
 * - pro: For deep tasks, research, complex reasoning
 */
export const models = {
    fast: openai('gpt-4o-mini'),
    pro: openai('gpt-4o'),
};

/**
 * Get model by name
 */
export function getModel(name: 'fast' | 'pro' = 'fast') {
    return models[name];
}
