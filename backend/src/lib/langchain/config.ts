import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

/**
 * LangChain configuration constants
 */
export const LANGCHAIN_CONFIG = {
    // Default model for agents
    DEFAULT_MODEL: 'gemini-2.5-pro',

    // Model parameters
    MODEL_PARAMS: {
        temperature: 0.7,
        maxOutputTokens: 2000,
    },

    // Memory settings
    MEMORY: {
        maxTokensBeforeTrim: 4000,
        messagesToKeep: 20,
    },

    // Agent types
    AGENT_TYPES: {
        ROUTER: 'router',
        FINANCIAL: 'financial',
        STOCK_MARKET: 'stock-market',
        PRODUCTIVITY: 'productivity',
        DEVELOPER: 'developer',
        COMMUNICATION: 'communication',
    },
} as const;

/**
 * Initialize Google Gemini chat model
 */
export function initChatModel(modelName?: string, params?: Record<string, any>) {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        throw new Error('GOOGLE_API_KEY environment variable is not set');
    }

    return new ChatGoogleGenerativeAI({
        modelName: modelName || LANGCHAIN_CONFIG.DEFAULT_MODEL,
        temperature: params?.temperature ?? LANGCHAIN_CONFIG.MODEL_PARAMS.temperature,
        maxOutputTokens: params?.maxOutputTokens ?? LANGCHAIN_CONFIG.MODEL_PARAMS.maxOutputTokens,
        apiKey: apiKey,
    });
}
