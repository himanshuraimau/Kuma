import { apiClient } from './client';
import type {
    SendMessageRequest,
    SendMessageResponse,
    GetChatsResponse,
    GetChatResponse,
    UpdateChatTitleRequest,
    UpdateChatTitleResponse,
} from '@/types/api.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Stream message callback types
 */
export interface StreamCallbacks {
    onChatId?: (chatId: string) => void;
    onChunk?: (content: string) => void;
    onToolCall?: (toolName: string, args: Record<string, unknown>) => void;
    onToolResult?: (toolName: string, success: boolean) => void;
    onDone?: (fullResponse: string) => void;
    onError?: (error: string) => void;
}

/**
 * Send a message with streaming response (SSE)
 * POST /api/chat/stream
 */
export const streamMessage = async (
    data: SendMessageRequest,
    callbacks: StreamCallbacks
): Promise<void> => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Stream failed' }));
        throw new Error(errorData.error || 'Failed to stream message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        switch (data.type) {
                            case 'chat_id':
                                callbacks.onChatId?.(data.chatId);
                                break;
                            case 'chunk':
                                callbacks.onChunk?.(data.content);
                                break;
                            case 'tool_call':
                                callbacks.onToolCall?.(data.toolName, data.args);
                                break;
                            case 'tool_result':
                                callbacks.onToolResult?.(data.toolName, data.success);
                                break;
                            case 'done':
                                callbacks.onDone?.(data.fullResponse);
                                break;
                            case 'error':
                                callbacks.onError?.(data.error);
                                break;
                        }
                    } catch {
                        // Skip malformed JSON
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
};

/**
 * Send a message to the chat agent (non-streaming)
 * POST /api/chat
 */
export const sendMessage = async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await apiClient.post('/chat', data);
    return response.data;
};

/**
 * Get all chats for the current user
 * GET /api/chat
 */
export const getChats = async (): Promise<GetChatsResponse> => {
    const response = await apiClient.get('/chat');
    return response.data;
};

/**
 * Get a specific chat with all messages
 * GET /api/chat/:id
 */
export const getChat = async (chatId: string): Promise<GetChatResponse> => {
    const response = await apiClient.get(`/chat/${chatId}`);
    return response.data;
};

/**
 * Delete a chat
 * DELETE /api/chat/:id
 */
export const deleteChat = async (chatId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/chat/${chatId}`);
    return response.data;
};

/**
 * Update chat title
 * PATCH /api/chat/:id
 */
export const updateChatTitle = async (
    chatId: string,
    data: UpdateChatTitleRequest
): Promise<UpdateChatTitleResponse> => {
    const response = await apiClient.patch(`/chat/${chatId}`, data);
    return response.data;
};
