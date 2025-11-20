import { agentRegistry } from './base.agent';
import { stockMarketAgentConfig } from './stock-market.agent';
import { financialAgentConfig } from './financial.agent';
import { routerAgentConfig } from './router.agent';

/**
 * Register all agents
 */
export function registerAllAgents() {
    agentRegistry.register(routerAgentConfig);
    agentRegistry.register(stockMarketAgentConfig);
    agentRegistry.register(financialAgentConfig);

    console.log(`✅ Registered ${agentRegistry.getAll().length} agents`);
}

// Export agent registry and configs
export { agentRegistry };
export { stockMarketAgentConfig, financialAgentConfig, routerAgentConfig };
