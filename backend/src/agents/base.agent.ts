import { createReactAgent } from '@langchain/langgraph/prebuilt';
import type { BaseTool } from '../tools/base.tool';
import { createTool } from '../tools/base.tool';
import { getCheckpointer } from '../lib/langchain/checkpointer';
import { initChatModel } from '../lib/langchain/config';
import type { AgentConfig } from '../types/langchain.types';

/**
 * Create a LangChain agent with the given configuration
 */
export async function createAgent(config: AgentConfig) {
    const checkpointer = await getCheckpointer();
    const model = initChatModel(config.modelName);

    // Get tools for this agent
    const { toolRegistry } = await import('../tools');
    const agentTools = config.tools
        .map((toolName) => toolRegistry.get(toolName))
        .filter((tool): tool is BaseTool => tool !== undefined)
        .map((tool) => createTool(tool));

    if (agentTools.length === 0) {
        console.warn(`⚠️  Agent "${config.name}" has no tools configured`);
    }

    // Create the agent with system prompt
    const agent = createReactAgent({
        llm: model,
        tools: agentTools,
        checkpointSaver: checkpointer,
        messageModifier: config.systemPrompt,
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
