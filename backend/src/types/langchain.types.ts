import type { BaseMessage } from '@langchain/core/messages';

/**
 * Runtime context for agents and tools
 */
export interface AgentContext {
    userId: string;
    chatId?: string;
    threadId: string;
    userEmail?: string;
    userName?: string;
    connectedServices?: Record<string, any>;
}

/**
 * Agent state structure
 */
export interface AgentState {
    messages: BaseMessage[];
    userId?: string;
    chatId?: string;
    [key: string]: any;
}

/**
 * Tool execution context
 */
export interface ToolContext {
    userId: string;
    credentials?: Record<string, any>;
    [key: string]: any;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
    name: string;
    displayName: string;
    description: string;
    systemPrompt: string;
    tools: string[]; // Tool names
    modelName?: string;
    temperature?: number;
}

/**
 * Tool definition
 */
export interface ToolDefinition {
    name: string;
    category: string;
    displayName: string;
    description: string;
    requiresAuth: boolean;
    schema?: Record<string, any>;
}

/**
 * Chat message type
 */
export interface ChatMessage {
    id: string;
    chatId: string;
    role: 'user' | 'assistant' | 'tool' | 'system';
    content: string;
    toolCalls?: any;
    createdAt: Date;
}

/**
 * Chat thread type
 */
export interface ChatThread {
    id: string;
    userId: string;
    title?: string;
    agentType: string;
    threadId: string;
    createdAt: Date;
    updatedAt: Date;
    messages?: ChatMessage[];
}
