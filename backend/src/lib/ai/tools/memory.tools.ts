import { tool } from 'ai';
import { z } from 'zod';
import { supermemoryTools, searchMemoriesTool, addMemoryTool } from '@supermemory/tools/ai-sdk';

/**
 * Get the Supermemory API key
 */
function getApiKey(): string {
    const apiKey = process.env.SUPERMEMORY_API_KEY;
    if (!apiKey) {
        throw new Error('SUPERMEMORY_API_KEY is not set');
    }
    return apiKey;
}

/**
 * Create memory tools for a specific user using Supermemory's AI SDK integration
 * Each user gets isolated memories via containerTags
 */
export function createMemoryTools(userId: string) {
    const apiKey = getApiKey();
    const containerTag = `user-${userId}`;

    // Use the official supermemoryTools with user-specific container
    const tools = supermemoryTools(apiKey, {
        containerTags: [containerTag],
    });

    return tools;
}

/**
 * Create individual memory tools for more control
 */
export function createIndividualMemoryTools(userId: string) {
    const apiKey = getApiKey();
    const containerTag = `user-${userId}`;

    return {
        /**
         * Search memories using Supermemory's official tool
         */
        searchMemories: searchMemoriesTool(apiKey, {
            containerTags: [containerTag],
        }),

        /**
         * Add memory using Supermemory's official tool
         */
        addMemory: addMemoryTool(apiKey, {
            containerTags: [containerTag],
        }),
    };
}

/**
 * Export type for memory tools
 */
export type MemoryTools = ReturnType<typeof createMemoryTools>;

