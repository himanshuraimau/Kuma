import { streamText, generateText, type CoreMessage, type Tool } from 'ai';
import { getModel, models } from '../client';
import { agentConfigs, type AgentName } from './configs';
import type { AgentConfig } from './types';
import { prisma } from '../../../db/prisma';

// Import all tools
import {
    getStockPrice,
    getCompanyInfo,
    getFinancialNews,
    webSearch,
    findSimilarPages,
    getPageContent,
    deepResearch,
    analyzeImageTool,
    extractTextTool,
    describeImageTool,
} from '../tools';
import { createMemoryTools } from '../tools/memory.tools';
import { loadUserAppTools } from '../tools/app.tools';

/**
 * Tool registry - maps tool names to tool implementations
 */
const baseToolRegistry: Record<string, Tool> = {
    // Stock market tools
    getStockPrice,
    getCompanyInfo,
    getFinancialNews,
    // Search tools
    webSearch,
    findSimilarPages,
    getPageContent,
    deepResearch,
    // Vision tools
    analyzeImage: analyzeImageTool,
    extractText: extractTextTool,
    describeImage: describeImageTool,
};

/**
 * Get tools for an agent, including user-specific tools
 */
async function getAgentTools(
    config: AgentConfig,
    userId: string
): Promise<Record<string, Tool>> {
    const tools: Record<string, Tool> = {};

    // Add base tools from config
    for (const toolName of config.tools) {
        if (baseToolRegistry[toolName]) {
            tools[toolName] = baseToolRegistry[toolName];
        }
    }

    // Add user-specific memory tools from Supermemory
    // createMemoryTools returns all memory tools (addMemory, searchMemories, etc.)
    const memoryTools = createMemoryTools(userId);
    Object.assign(tools, memoryTools);

    // Load user's connected app tools
    const appTools = await loadUserAppTools(userId);
    Object.assign(tools, appTools);

    return tools;
}

/**
 * Get the current date string for system prompt
 */
function getCurrentDateString(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Build system prompt with date
 */
function buildSystemPrompt(config: AgentConfig): string {
    const currentDate = getCurrentDateString();
    return `Current Date: ${currentDate}\n\n${config.systemPrompt}`;
}

/**
 * Get chat by threadId and load messages
 */
async function loadChatHistory(chatId: string): Promise<CoreMessage[]> {
    const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
    });

    return messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
    }));
}

/**
 * Save message to database
 */
async function saveMessage(
    chatId: string,
    role: 'user' | 'assistant',
    content: string,
    toolCalls?: unknown[]
): Promise<void> {
    await prisma.message.create({
        data: {
            chatId,
            role,
            content,
            toolCalls: toolCalls ? JSON.parse(JSON.stringify(toolCalls)) : undefined,
        },
    });
}

export interface StreamAgentOptions {
    agentName?: AgentName;
    userId: string;
    chatId: string;
    message: string;
    onChunk?: (chunk: string) => void;
    onToolCall?: (toolName: string, args: Record<string, unknown>) => void;
    onToolResult?: (toolName: string, result: unknown) => void;
    onFinish?: (fullResponse: string) => void;
}

/**
 * Stream a response from the agent
 */
export async function streamAgent(options: StreamAgentOptions) {
    const {
        agentName = 'router',
        userId,
        chatId,
        message,
        onChunk,
        onToolCall,
        onToolResult,
        onFinish,
    } = options;

    // Get agent config
    const config = agentConfigs[agentName];
    if (!config) {
        throw new Error(`Agent "${agentName}" not found`);
    }

    // Load tools for this agent
    const tools = await getAgentTools(config, userId);
    console.log(`🔧 Agent "${config.name}" loaded ${Object.keys(tools).length} tools:`,
        Object.keys(tools).join(', '));

    // Load chat history
    const history = await loadChatHistory(chatId);

    // Save user message
    await saveMessage(chatId, 'user', message);

    // Build messages array
    const messages: CoreMessage[] = [
        ...history,
        { role: 'user', content: message },
    ];

    // Get model based on config
    const model = getModel(config.modelType);

    // Track tool calls for saving
    const toolCallsForSave: unknown[] = [];

    // Stream the response
    const result = streamText({
        model,
        system: buildSystemPrompt(config),
        messages,
        tools,
        temperature: config.temperature ?? 0.7,
        onStepFinish: async (step) => {
            // Handle tool calls
            if (step.toolCalls && step.toolCalls.length > 0) {
                for (const toolCall of step.toolCalls) {
                    toolCallsForSave.push(toolCall);
                    if (onToolCall) {
                        onToolCall(toolCall.toolName, (toolCall as any).args ?? {});
                    }
                }
            }
            // Handle tool results
            if (step.toolResults && step.toolResults.length > 0) {
                for (const toolResult of step.toolResults) {
                    if (onToolResult) {
                        onToolResult(toolResult.toolName, (toolResult as any).result);
                    }
                }
            }
        },
    });

    // Collect full response
    let fullResponse = '';

    // Stream chunks
    for await (const chunk of result.textStream) {
        fullResponse += chunk;
        if (onChunk) {
            onChunk(chunk);
        }
    }

    // Save assistant response
    if (fullResponse) {
        await saveMessage(chatId, 'assistant', fullResponse, toolCallsForSave);
    }

    if (onFinish) {
        onFinish(fullResponse);
    }

    return {
        response: fullResponse,
        usage: await result.usage,
    };
}

export interface GenerateAgentOptions {
    agentName?: AgentName;
    userId: string;
    chatId: string;
    message: string;
}

/**
 * Generate a response from the agent (non-streaming)
 */
export async function generateAgent(options: GenerateAgentOptions) {
    const { agentName = 'router', userId, chatId, message } = options;

    // Get agent config
    const config = agentConfigs[agentName];
    if (!config) {
        throw new Error(`Agent "${agentName}" not found`);
    }

    // Load tools for this agent
    const tools = await getAgentTools(config, userId);

    // Load chat history
    const history = await loadChatHistory(chatId);

    // Save user message
    await saveMessage(chatId, 'user', message);

    // Build messages array
    const messages: CoreMessage[] = [
        ...history,
        { role: 'user', content: message },
    ];

    // Get model based on config
    const model = getModel(config.modelType);

    // Generate response
    const result = await generateText({
        model,
        system: buildSystemPrompt(config),
        messages,
        tools,
        temperature: config.temperature ?? 0.7,
    });

    // Save assistant response
    if (result.text) {
        await saveMessage(chatId, 'assistant', result.text);
    }

    return {
        response: result.text,
        usage: result.usage,
        toolCalls: result.toolCalls,
        toolResults: result.toolResults,
    };
}

/**
 * Get agent info
 */
export function getAgentInfo(agentName: AgentName) {
    const config = agentConfigs[agentName];
    if (!config) {
        return null;
    }
    return {
        name: config.name,
        displayName: config.displayName,
        description: config.description,
        tools: config.tools,
    };
}

/**
 * List all available agents
 */
export function listAgents() {
    return Object.entries(agentConfigs).map(([name, config]) => ({
        name,
        displayName: config.displayName,
        description: config.description,
    }));
}
