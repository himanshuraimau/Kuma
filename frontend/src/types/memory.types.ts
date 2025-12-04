// Memory types for Supermemory integration

export interface Memory {
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
}

export interface AddMemoryRequest {
    content: string;
    metadata?: Record<string, unknown>;
}

export interface AddMemoryResponse {
    message: string;
    memory: Memory;
}

export interface ListMemoriesResponse {
    memories: Memory[];
    total: number;
}

export interface SearchMemoriesRequest {
    query: string;
    limit?: number;
}

export interface SearchMemoriesResponse {
    memories: Memory[];
    query: string;
}

export interface GetMemoryResponse {
    memory: Memory;
}

export interface UpdateMemoryRequest {
    content: string;
}

export interface UpdateMemoryResponse {
    message: string;
    memory: Memory;
}

export interface DeleteMemoryResponse {
    message: string;
}
