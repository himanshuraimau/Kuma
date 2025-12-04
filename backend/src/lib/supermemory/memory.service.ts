import { supermemory } from './client';

/**
 * Memory Service
 * Handles all memory operations with Supermemory
 * Each user has their own container for isolated memories
 */
export class MemoryService {
    /**
     * Get container tag for a user
     */
    private getContainerTag(userId: string): string {
        return `user-${userId}`;
    }

    /**
     * Add a memory for a user
     * @param userId - The user's ID
     * @param content - The content to remember
     * @param metadata - Optional metadata (tags, category, etc.)
     */
    async addMemory(
        userId: string,
        content: string,
        metadata?: Record<string, any>
    ): Promise<{ id: string; status: string }> {
        try {
            const result = await supermemory.memories.add({
                content,
                containerTag: this.getContainerTag(userId),
                metadata: {
                    ...metadata,
                    userId,
                    createdAt: new Date().toISOString(),
                },
            });

            console.log(`📝 Memory added for user ${userId}:`, result.id);
            return { id: result.id || '', status: 'success' };
        } catch (error: any) {
            console.error('Failed to add memory:', error);
            throw new Error(`Failed to add memory: ${error.message}`);
        }
    }

    /**
     * Search memories for a user using the search.memories endpoint
     * @param userId - The user's ID
     * @param query - Search query
     * @param limit - Maximum results (default: 10)
     */
    async searchMemories(
        userId: string,
        query: string,
        limit: number = 10
    ): Promise<any[]> {
        try {
            const result = await supermemory.search.memories({
                q: query,
                containerTag: this.getContainerTag(userId),
                limit,
            });

            const memories = result.results || [];
            console.log(`🔍 Found ${memories.length} memories for query: "${query}"`);
            return memories;
        } catch (error: any) {
            console.error('Failed to search memories:', error);
            throw new Error(`Failed to search memories: ${error.message}`);
        }
    }

    /**
     * List all memories for a user with pagination
     * @param userId - The user's ID
     * @param page - Page number (default: 1)
     * @param limit - Items per page (default: 20)
     */
    async listMemories(
        userId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ memories: any[]; total: number }> {
        try {
            const result = await supermemory.memories.list({
                containerTags: [this.getContainerTag(userId)],
                limit,
                page,
            });

            return {
                memories: result.memories || [],
                total: result.memories?.length || 0,
            };
        } catch (error: any) {
            console.error('Failed to list memories:', error);
            throw new Error(`Failed to list memories: ${error.message}`);
        }
    }

    /**
     * Get a specific memory by ID
     * @param memoryId - The memory ID
     */
    async getMemory(memoryId: string): Promise<any> {
        try {
            const result = await supermemory.memories.get(memoryId);
            return result;
        } catch (error: any) {
            console.error('Failed to get memory:', error);
            throw new Error(`Failed to get memory: ${error.message}`);
        }
    }

    /**
     * Delete a memory
     * @param memoryId - The memory ID to delete
     */
    async deleteMemory(memoryId: string): Promise<void> {
        try {
            await supermemory.memories.delete(memoryId);
            console.log(`🗑️ Memory deleted: ${memoryId}`);
        } catch (error: any) {
            console.error('Failed to delete memory:', error);
            throw new Error(`Failed to delete memory: ${error.message}`);
        }
    }

    /**
     * Update a memory's content
     * @param memoryId - The memory ID
     * @param content - New content
     */
    async updateMemory(memoryId: string, content: string): Promise<any> {
        try {
            const result = await supermemory.memories.update(memoryId, {
                content,
            });
            console.log(`📝 Memory updated: ${memoryId}`);
            return result;
        } catch (error: any) {
            console.error('Failed to update memory:', error);
            throw new Error(`Failed to update memory: ${error.message}`);
        }
    }

    /**
     * Get relevant context for a conversation
     * Searches memories and returns formatted context string
     * @param userId - The user's ID
     * @param query - The user's message/query
     * @param limit - Maximum memories to include
     */
    async getRelevantContext(
        userId: string,
        query: string,
        limit: number = 5
    ): Promise<string> {
        try {
            const memories = await this.searchMemories(userId, query, limit);

            if (memories.length === 0) {
                return '';
            }

            // The search.memories response has 'memory' field, not 'content'
            const contextParts = memories.map((memory, index) => {
                return `[Memory ${index + 1}]: ${memory.memory}`;
            });

            return `\n--- Relevant memories from past conversations ---\n${contextParts.join('\n')}\n--- End of memories ---\n`;
        } catch (error) {
            console.error('Failed to get relevant context:', error);
            return ''; // Return empty string on error, don't block the conversation
        }
    }
}

// Export singleton instance
export const memoryService = new MemoryService();
