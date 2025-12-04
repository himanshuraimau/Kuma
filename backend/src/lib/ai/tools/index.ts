// Stock Market Tools
export { stockMarketTools, getStockPrice, getCompanyInfo, getFinancialNews } from './stock-market.tools';

// Search Tools
export { searchTools, webSearch, findSimilarPages, getPageContent, deepResearch } from './search.tools';

// Vision Tools
export { visionTools, analyzeImageTool, extractTextTool, describeImageTool } from './vision.tools';

// Memory Tools
export { createMemoryTools, type MemoryTools } from './memory.tools';

// App Tools (Gmail, Calendar, Docs)
export {
    createGmailTools,
    createCalendarTools,
    createDocsTools,
    loadUserAppTools,
} from './app.tools';

/**
 * Get all base tools (available to all users)
 */
export function getBaseTools() {
    return {
        // Stock Market
        getStockPrice: require('./stock-market.tools').getStockPrice,
        getCompanyInfo: require('./stock-market.tools').getCompanyInfo,
        getFinancialNews: require('./stock-market.tools').getFinancialNews,

        // Search
        webSearch: require('./search.tools').webSearch,
        findSimilarPages: require('./search.tools').findSimilarPages,
        getPageContent: require('./search.tools').getPageContent,
        deepResearch: require('./search.tools').deepResearch,

        // Vision
        analyzeImage: require('./vision.tools').analyzeImageTool,
        extractText: require('./vision.tools').extractTextTool,
        describeImage: require('./vision.tools').describeImageTool,
    };
}
