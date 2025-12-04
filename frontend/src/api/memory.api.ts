import { apiClient } from './client';
import type {
    AddMemoryRequest,
    AddMemoryResponse,
    ListMemoriesResponse,
    SearchMemoriesResponse,
    GetMemoryResponse,
    UpdateMemoryRequest,
    UpdateMemoryResponse,
    DeleteMemoryResponse,
} from '@/types/memory.types';

/**
 * Add a new memory
 * POST /api/memories
 */
export const addMemory = async (data: AddMemoryRequest): Promise<AddMemoryResponse> => {
    const response = await apiClient.post('/memories', data);
    return response.data;
};

/**
 * List all memories
 * GET /api/memories
 */
export const listMemories = async (limit?: number, offset?: number): Promise<ListMemoriesResponse> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await apiClient.get(`/memories?${params.toString()}`);
    return response.data;
};

/**
 * Search memories
 * GET /api/memories/search
 */
export const searchMemories = async (query: string, limit?: number): Promise<SearchMemoriesResponse> => {
    const params = new URLSearchParams({ query });
    if (limit) params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/memories/search?${params.toString()}`);
    return response.data;
};

/**
 * Get a specific memory
 * GET /api/memories/:id
 */
export const getMemory = async (memoryId: string): Promise<GetMemoryResponse> => {
    const response = await apiClient.get(`/memories/${memoryId}`);
    return response.data;
};

/**
 * Update a memory
 * PUT /api/memories/:id
 */
export const updateMemory = async (memoryId: string, data: UpdateMemoryRequest): Promise<UpdateMemoryResponse> => {
    const response = await apiClient.put(`/memories/${memoryId}`, data);
    return response.data;
};

/**
 * Delete a memory
 * DELETE /api/memories/:id
 */
export const deleteMemory = async (memoryId: string): Promise<DeleteMemoryResponse> => {
    const response = await apiClient.delete(`/memories/${memoryId}`);
    return response.data;
};
