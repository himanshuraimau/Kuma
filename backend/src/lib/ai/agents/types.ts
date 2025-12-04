import type { Tool } from 'ai';

/**
 * Agent configuration for AI SDK agents
 */
export interface AgentConfig {
    name: string;
    displayName: string;
    description: string;
    systemPrompt: string;
    tools: string[];  // Tool names to include
    modelType: 'fast' | 'pro';  // Which model to use
    temperature?: number;
}

/**
 * Agent context passed during execution
 */
export interface AgentContext {
    userId: string;
    threadId: string;
    tools: Record<string, Tool>;
}

/**
 * Message format for agent conversations
 */
export interface AgentMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    toolInvocations?: Array<{
        toolName: string;
        args: Record<string, unknown>;
        result?: unknown;
    }>;
}
