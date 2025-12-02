import { createReactAgent } from '@langchain/langgraph/prebuilt';
import type { BaseTool } from '../tools/base.tool';
import { createTool } from '../tools/base.tool';
import { getCheckpointer } from '../lib/langchain/checkpointer';
import { initChatModel } from '../lib/langchain/config';
import type { AgentConfig } from '../types/langchain.types';
import { prisma } from '../db/prisma';
import { appRegistry } from '../apps';

/**
 * Get user's app tools based on connected apps
 */
async function getUserAppTools(userId: string): Promise<BaseTool[]> {
    const userApps = await prisma.userApp.findMany({
        where: { userId, isConnected: true },
        include: { app: true },
    });

    const tools: BaseTool[] = [];

    for (const userApp of userApps) {
        const app = appRegistry.get(userApp.app.name);
        if (app) {
            const appTools = app.getTools();
            tools.push(...appTools);
        }
    }

    return tools;
}

/**
 * Create a LangChain agent with the given configuration
 */
export async function createAgent(config: AgentConfig, userId?: string) {
    const checkpointer = await getCheckpointer();
    const model = initChatModel(config.modelName);

    // Get default tools for this agent
    const { toolRegistry } = await import('../tools');
    const defaultTools = config.tools
        .map((toolName) => toolRegistry.get(toolName))
        .filter((tool): tool is BaseTool => tool !== undefined);

    // Get user's app tools if userId provided
    let userAppTools: BaseTool[] = [];
    if (userId) {
        userAppTools = await getUserAppTools(userId);
        if (userAppTools.length > 0) {
            console.log(
                `📱 Loaded ${userAppTools.length} app tools for user:`,
                userAppTools.map((t) => t.name).join(', ')
            );
        }
    }

    // Combine all tools
    const allTools = [...defaultTools, ...userAppTools].map((tool) =>
        createTool(tool)
    );

    if (allTools.length === 0) {
        console.warn(`⚠️  Agent "${config.name}" has no tools configured`);
    }

    // Create the agent with system prompt
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const systemPromptWithDate = `Current Date: ${currentDate}\n\n${config.systemPrompt}`;

    const agent = createReactAgent({
        llm: model,
        tools: allTools,
        checkpointSaver: checkpointer,
        messageModifier: systemPromptWithDate,
    });

    return agent;
}

/**
 * Agent registry to manage all available agents
 */
class AgentRegistry {
    private agents: Map<string, AgentConfig> = new Map();

    register(config: AgentConfig) {
        this.agents.set(config.name, config);
    }

    get(name: string): AgentConfig | undefined {
        return this.agents.get(name);
    }

    getAll(): AgentConfig[] {
        return Array.from(this.agents.values());
    }
}

export const agentRegistry = new AgentRegistry();
