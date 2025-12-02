import { toolRegistry } from './base.tool';

// Stock Market Tools
import { getStockPriceTool } from './stock-market/get-stock-price.tool';
import { getCompanyInfoTool } from './stock-market/get-company-info.tool';
import { getFinancialNewsTool } from './stock-market/get-financial-news.tool';

// Vision Tools
import { analyzeImageTool, extractTextTool, describeSceneTool } from './vision/vision.tools';

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
};
