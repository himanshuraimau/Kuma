import { tool as createLangChainTool } from '@langchain/core/tools';
import type { z } from 'zod';
import type { ToolContext } from '../types/langchain.types';

/**
 * Base tool interface
 */
export interface BaseTool {
    name: string;
    description: string;
    category: string;
    requiresAuth: boolean;
    schema: z.ZodObject<any>;
    execute: (input: any, context?: ToolContext) => Promise<string>;
}

/**
 * Create a LangChain tool from our base tool definition
 */
export function createTool(toolDef: BaseTool) {
    return createLangChainTool(
        async (input, config) => {
            const context: ToolContext = {
                userId: config?.configurable?.userId || '',
                credentials: config?.configurable?.credentials || {},
                ...config?.configurable,
            };

            return await toolDef.execute(input, context);
        },
        {
            name: toolDef.name,
            description: toolDef.description,
            schema: toolDef.schema,
        }
    );
}

/**
 * Tool registry to manage all available tools
 */
class ToolRegistry {
    private tools: Map<string, BaseTool> = new Map();

    register(tool: BaseTool) {
        this.tools.set(tool.name, tool);
    }

    get(name: string): BaseTool | undefined {
        return this.tools.get(name);
    }

    getByCategory(category: string): BaseTool[] {
        return Array.from(this.tools.values()).filter(
            (tool) => tool.category === category
        );
    }

    getAll(): BaseTool[] {
        return Array.from(this.tools.values());
    }

    getAllActive(): BaseTool[] {
        // In future, we can filter by isActive from database
        return this.getAll();
    }
}

export const toolRegistry = new ToolRegistry();
