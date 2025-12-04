// Main AI library exports

// Client and models
export { google, models, getModel } from './client';

// Agents
export {
    streamAgent,
    generateAgent,
    getAgentInfo,
    listAgents,
    agentConfigs,
    type AgentName,
    type StreamAgentOptions,
    type GenerateAgentOptions,
    type AgentConfig,
} from './agents';

// Tools
export * from './tools';
