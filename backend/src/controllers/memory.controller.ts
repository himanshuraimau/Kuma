import type { Request, Response } from 'express';
import { MemoryService } from '../lib/supermemory/memory.service';

const memoryService = new MemoryService();

/**
 * Add a new memory
 * POST /api/memories
 */
export async function addMemory(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { content, metadata } = req.body;

        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
        }

        const memory = await memoryService.addMemory(userId, content.trim(), metadata);

        return res.status(201).json({
            success: true,
            memory,
        });
    } catch (error) {
        console.error('Error in addMemory:', error);
        return res.status(500).json({
            error: 'Failed to add memory',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Search memories
 * GET /api/memories/search?q=query&limit=10
 */
export async function searchMemories(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { q: query, limit } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const memories = await memoryService.searchMemories(
            userId,
            query,
            limit ? parseInt(limit as string, 10) : 10
        );

        return res.json({
            success: true,
            memories,
            count: memories.length,
        });
    } catch (error) {
        console.error('Error in searchMemories:', error);
        return res.status(500).json({
            error: 'Failed to search memories',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * List all memories for user
 * GET /api/memories?page=1&limit=20
 */
export async function listMemories(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { page, limit } = req.query;

        const result = await memoryService.listMemories(
            userId,
            page ? parseInt(page as string, 10) : 1,
            limit ? parseInt(limit as string, 10) : 20
        );

        return res.json({
            success: true,
            memories: result.memories,
            total: result.total,
            page: page ? parseInt(page as string, 10) : 1,
        });
    } catch (error) {
        console.error('Error in listMemories:', error);
        return res.status(500).json({
            error: 'Failed to list memories',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Get a specific memory
 * GET /api/memories/:id
 */
export async function getMemory(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Memory ID is required' });
        }

        const memory = await memoryService.getMemory(id);

        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        return res.json({
            success: true,
            memory,
        });
    } catch (error) {
        console.error('Error in getMemory:', error);
        return res.status(500).json({
            error: 'Failed to get memory',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Update a memory
 * PUT /api/memories/:id
 */
export async function updateMemory(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Memory ID is required' });
        }

        const { content } = req.body;

        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
        }

        const memory = await memoryService.updateMemory(id, content.trim());

        return res.json({
            success: true,
            memory,
        });
    } catch (error) {
        console.error('Error in updateMemory:', error);
        return res.status(500).json({
            error: 'Failed to update memory',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Delete a memory
 * DELETE /api/memories/:id
 */
export async function deleteMemory(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Memory ID is required' });
        }

        await memoryService.deleteMemory(id);

        return res.json({
            success: true,
            message: 'Memory deleted successfully',
        });
    } catch (error) {
        console.error('Error in deleteMemory:', error);
        return res.status(500).json({
            error: 'Failed to delete memory',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Get relevant context for a query (used by agent internally)
 * POST /api/memories/context
 */
export async function getRelevantContext(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { query, limit } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query is required' });
        }

        const context = await memoryService.getRelevantContext(
            userId,
            query,
            limit || 5
        );

        return res.json({
            success: true,
            context,
        });
    } catch (error) {
        console.error('Error in getRelevantContext:', error);
        return res.status(500).json({
            error: 'Failed to get context',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
