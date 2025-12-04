import type { Request, Response } from 'express';
import { listAgents, getAgentInfo } from '../lib/ai/agents/agent';

/**
 * Get all available agents
 * GET /api/agents
 */
export async function getAgents(req: Request, res: Response) {
    try {
        const agents = listAgents();
        return res.json({ agents });
    } catch (error) {
        console.error('Error in getAgents:', error);
        return res.status(500).json({ error: 'Failed to fetch agents' });
    }
}

/**
 * Get specific agent details
 * GET /api/agents/:name
 */
export async function getAgent(req: Request, res: Response) {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).json({ error: 'Agent name is required' });
        }

        const info = getAgentInfo(name as any);
        if (!info) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        return res.json({ agent: info });
    } catch (error) {
        console.error('Error in getAgent:', error);
        return res.status(500).json({ error: 'Failed to fetch agent' });
    }
}
