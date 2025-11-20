// API response types

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export interface AuthResponse {
    message: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
    token: string;
}

// Chat types
export interface Message {
    id: string;
    chatId: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    toolCalls?: any;
    createdAt: string;
}

export interface Chat {
    id: string;
    userId: string;
    title: string | null;
    agentType: string;
    threadId: string;
    createdAt: string;
    updatedAt: string;
    messages?: Message[];
}

export interface SendMessageRequest {
    message: string;
    chatId?: string;
    agentType?: string;
}

export interface SendMessageResponse {
    chatId: string;
    message: string;
    agentType: string;
}

export interface GetChatsResponse {
    chats: Chat[];
}

export interface GetChatResponse {
    chat: Chat;
}

export interface UpdateChatTitleRequest {
    title: string;
}

export interface UpdateChatTitleResponse {
    chat: Chat;
}

