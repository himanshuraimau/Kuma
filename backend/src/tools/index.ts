import { toolRegistry } from './base.tool';

// Stock Market Tools
import { getStockPriceTool } from './stock-market/get-stock-price.tool';
import { getCompanyInfoTool } from './stock-market/get-company-info.tool';
import { getFinancialNewsTool } from './stock-market/get-financial-news.tool';

// Vision Tools
import { analyzeImageTool, extractTextTool, describeSceneTool } from './vision/vision.tools';

// Search Tools
import { webSearchTool, findSimilarTool, getPageContentTool } from './search/exa.tools';
import { deepResearchTool } from './search/deep-research.tool';

// Register all tools
export function registerAllTools() {
    // Stock Market Tools
    toolRegistry.register(getStockPriceTool);
    toolRegistry.register(getCompanyInfoTool);
    toolRegistry.register(getFinancialNewsTool);

    // Vision Tools
    toolRegistry.register(analyzeImageTool);
    toolRegistry.register(extractTextTool);
    toolRegistry.register(describeSceneTool);

    // Search Tools
    toolRegistry.register(webSearchTool);
    toolRegistry.register(findSimilarTool);
    toolRegistry.register(getPageContentTool);
    toolRegistry.register(deepResearchTool);

    console.log(`✅ Registered ${toolRegistry.getAll().length} tools`);
}

// Export tool registry
export { toolRegistry };

// Export individual tools for direct access
export {
    getStockPriceTool,
    getCompanyInfoTool,
    getFinancialNewsTool,
    analyzeImageTool,
    extractTextTool,
    describeSceneTool,
    webSearchTool,
    findSimilarTool,
    getPageContentTool,
    deepResearchTool,
};
