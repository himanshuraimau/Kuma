import { apiClient } from './client';
import type {
    SendMessageRequest,
    SendMessageResponse,
    GetChatsResponse,
    GetChatResponse,
    UpdateChatTitleRequest,
    UpdateChatTitleResponse,
} from '@/types/api.types';

/**
 * Send a message to the chat agent
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
