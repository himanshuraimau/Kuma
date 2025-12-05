import { streamText, generateText, stepCountIs, type CoreMessage, type Tool } from 'ai';
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

// Constants for hybrid memory
const MAX_RECENT_MESSAGES = 15; // Always keep last 15 messages
const SUMMARIZE_THRESHOLD = 30; // Summarize when total messages exceed this
const MESSAGES_TO_SUMMARIZE = 20; // Number of older messages to summarize at once

/**
 * Summarize a batch of messages using AI
 */
async function summarizeMessages(messages: CoreMessage[]): Promise<string> {
    const model = getModel('fast');
    
    const conversationText = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n\n');
    
    const result = await generateText({
        model,
        messages: [
            {
                role: 'user',
                content: `Summarize the following conversation concisely, capturing key topics discussed, decisions made, important information shared (names, preferences, requests), and any pending tasks or context that would be important for continuing the conversation. Keep it under 500 words.

Conversation:
${conversationText}

Summary:`
            }
        ],
        temperature: 0.3,
    });
    
    return result.text;
}

/**
 * Load chat history with hybrid memory (summary + recent messages)
 */
async function loadChatHistory(chatId: string): Promise<{ messages: CoreMessage[], contextSummary: string | null }> {
    // Get chat with summary info
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { summary: true, summarizedUpTo: true }
    });
    
    // Get all messages
    const allMessages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
    });
    
    const totalMessages = allMessages.length;
    console.log(`📜 Chat has ${totalMessages} total messages, summarizedUpTo: ${chat?.summarizedUpTo || 0}`);
    
    // Check if we need to create/update summary
    if (totalMessages > SUMMARIZE_THRESHOLD && totalMessages - (chat?.summarizedUpTo || 0) > MESSAGES_TO_SUMMARIZE) {
        console.log(`📝 Creating summary for older messages...`);
        
        // Get messages to summarize (older ones that haven't been summarized)
        const messagesToSummarize = allMessages.slice(0, totalMessages - MAX_RECENT_MESSAGES);
        
        // Create new summary (include previous summary if exists)
        let contentToSummarize: CoreMessage[] = [];
        
        if (chat?.summary) {
            // Include previous summary as context
            contentToSummarize.push({
                role: 'assistant',
                content: `Previous conversation summary: ${chat.summary}`
            });
        }
        
        // Add messages to summarize
        contentToSummarize.push(...messagesToSummarize.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        })));
        
        const newSummary = await summarizeMessages(contentToSummarize);
        
        // Update chat with new summary
        await prisma.chat.update({
            where: { id: chatId },
            data: {
                summary: newSummary,
                summarizedUpTo: totalMessages - MAX_RECENT_MESSAGES,
            }
        });
        
        console.log(`✅ Summary updated, now covers ${totalMessages - MAX_RECENT_MESSAGES} messages`);
        
        // Return recent messages with new summary
        const recentMessages = allMessages.slice(-MAX_RECENT_MESSAGES).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        }));
        
        return { messages: recentMessages, contextSummary: newSummary };
    }
    
    // If we have an existing summary but don't need to update it
    if (chat?.summary && totalMessages > MAX_RECENT_MESSAGES) {
        const recentMessages = allMessages.slice(-MAX_RECENT_MESSAGES).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        }));
        
        console.log(`📜 Using existing summary + ${recentMessages.length} recent messages`);
        return { messages: recentMessages, contextSummary: chat.summary };
    }
    
    // No summarization needed - return all messages
    console.log(`📜 Loaded ${totalMessages} messages (no summarization needed)`);
    return {
        messages: allMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        })),
        contextSummary: null
    };
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

    // Load chat history with hybrid memory
    const { messages: historyMessages, contextSummary } = await loadChatHistory(chatId);

    // Save user message
    await saveMessage(chatId, 'user', message);

    // Build messages array with context summary if available
    const messages: CoreMessage[] = [];
    
    // Add context summary as a system-like message if available
    if (contextSummary) {
        messages.push({
            role: 'assistant',
            content: `[Previous conversation context summary: ${contextSummary}]`
        });
    }
    
    // Add history and new message
    messages.push(...historyMessages);
    messages.push({ role: 'user', content: message });

    console.log(`📨 Sending ${messages.length} messages to model (${historyMessages.length} from history + ${contextSummary ? '1 summary + ' : ''}1 new)`);
    // Log last few messages for debugging
    if (messages.length > 1) {
        console.log('📨 Recent conversation context:');
        messages.slice(-4).forEach((m) => {
            console.log(`  ${m.role}: ${String(m.content).substring(0, 100)}...`);
        });
    }

    // Get model based on config
    const model = getModel(config.modelType);

    // Track tool calls for saving
    const toolCallsForSave: unknown[] = [];

    // Stream the response
    console.log('🤖 Starting streamText with model:', config.modelType);
    console.log('📝 Message:', message);
    
    const result = streamText({
        model,
        system: buildSystemPrompt(config),
        messages,
        tools,
        stopWhen: stepCountIs(10), // Allow multiple steps for tool calls and responses
        temperature: config.temperature ?? 0.7,
        onStepFinish: async (step) => {
            console.log('📊 Step finished:', {
                hasToolCalls: step.toolCalls?.length ?? 0,
                hasToolResults: step.toolResults?.length ?? 0,
                textLength: step.text?.length ?? 0,
            });
            // Handle tool calls
            if (step.toolCalls && step.toolCalls.length > 0) {
                for (const toolCall of step.toolCalls) {
                    const args = (toolCall as any).args ?? {};
                    console.log('🔧 Tool call:', toolCall.toolName, JSON.stringify(args).substring(0, 200));
                    toolCallsForSave.push(toolCall);
                    if (onToolCall) {
                        onToolCall(toolCall.toolName, args);
                    }
                }
            }
            // Handle tool results
            if (step.toolResults && step.toolResults.length > 0) {
                for (const toolResult of step.toolResults) {
                    console.log('✅ Tool result:', toolResult.toolName);
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

    // Load chat history with hybrid memory
    const { messages: historyMessages, contextSummary } = await loadChatHistory(chatId);

    // Save user message
    await saveMessage(chatId, 'user', message);

    // Build messages array with context summary if available
    const messages: CoreMessage[] = [];
    
    if (contextSummary) {
        messages.push({
            role: 'assistant',
            content: `[Previous conversation context summary: ${contextSummary}]`
        });
    }
    
    messages.push(...historyMessages);
    messages.push({ role: 'user', content: message });

    // Get model based on config
    const model = getModel(config.modelType);

    // Generate response
    const result = await generateText({
        model,
        system: buildSystemPrompt(config),
        messages,
        tools,
        stopWhen: stepCountIs(10), // Allow multiple steps for tool calls and responses
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
