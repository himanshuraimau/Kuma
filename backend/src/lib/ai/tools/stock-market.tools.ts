import { tool } from 'ai';
import { z } from 'zod';
import yahooFinance from 'yahoo-finance2';

/**
 * Get current stock price
 */
export const getStockPrice = tool({
    description: 'Get the current stock price and basic info for a given ticker symbol. Use this when users ask about stock prices, market performance, or trading info.',
    inputSchema: z.object({
        symbol: z.string().describe('Stock ticker symbol (e.g., AAPL, TSLA, GOOGL)'),
    }),
    execute: async ({ symbol }: { symbol: string }) => {
        try {
            // @ts-ignore
            const yf = new yahooFinance();
            const quote = await yf.quote(symbol) as any;

            if (!quote) {
                return `Stock symbol ${symbol} not found.`;
            }

            const price = quote.regularMarketPrice;
            const change = quote.regularMarketChange;
            const changePercent = quote.regularMarketChangePercent;
            const volume = quote.regularMarketVolume;
            const currency = quote.currency;
            const marketState = quote.marketState;

            const changeStr = change !== undefined ? change.toFixed(2) : 'N/A';
            const changePercentStr = changePercent !== undefined ? changePercent.toFixed(2) : 'N/A';
            const sign = (change || 0) >= 0 ? '+' : '';

            return `${symbol.toUpperCase()} is currently trading at ${price} ${currency}.
Change: ${sign}${changeStr} (${sign}${changePercentStr}%)
Volume: ${volume?.toLocaleString()}
Market State: ${marketState}`;
        } catch (error) {
            console.error('Error fetching stock price:', error);
            return `Error fetching data for ${symbol}. Please check the ticker symbol and try again.`;
        }
    },
});

/**
 * Get company fundamentals
 */
export const getCompanyInfo = tool({
    description: 'Get company fundamentals including P/E ratio, market cap, revenue, and other key metrics. Use this when users want detailed company information.',
    inputSchema: z.object({
        symbol: z.string().describe('Stock ticker symbol (e.g., AAPL, GOOGL)'),
    }),
    execute: async ({ symbol }: { symbol: string }) => {
        try {
            // @ts-ignore
            const yf = new yahooFinance();
            const summary = await yf.quoteSummary(symbol, {
                modules: ['summaryProfile', 'financialData', 'defaultKeyStatistics', 'price']
            });

            if (!summary) {
                return `Company information for ${symbol} not found.`;
            }

            const profile = summary.summaryProfile;
            const financials = summary.financialData;
            const price = summary.price;

            const marketCap = price?.marketCap?.toLocaleString() || 'N/A';
            const peRatio = summary.summaryDetail?.trailingPE?.toFixed(2) || 'N/A';
            const revenue = financials?.totalRevenue?.toLocaleString() || 'N/A';
            const profitMargin = financials?.profitMargins ? (financials.profitMargins * 100).toFixed(2) + '%' : 'N/A';
            const sector = profile?.sector || 'N/A';
            const industry = profile?.industry || 'N/A';
            const description = profile?.longBusinessSummary || 'N/A';
            const name = price?.longName || symbol;

            return `${name} (${symbol.toUpperCase()}):
- Sector: ${sector}
- Industry: ${industry}
- Market Cap: ${marketCap}
- P/E Ratio: ${peRatio}
- Revenue: ${revenue}
- Profit Margin: ${profitMargin}
- Description: ${description}`;
        } catch (error) {
            console.error('Error fetching company info:', error);
            return `Error fetching company info for ${symbol}.`;
        }
    },
});

/**
 * Get financial news
 */
export const getFinancialNews = tool({
    description: 'Search for recent financial news about a company, stock, or general market trends. Use this when users want news or updates about stocks/markets.',
    inputSchema: z.object({
        query: z.string().describe('Company name, stock symbol, or topic to search news for'),
        count: z.number().optional().default(5).describe('Number of news items to fetch (default: 5, max: 15)'),
    }),
    execute: async ({ query, count = 5 }: { query: string; count?: number }) => {
        const newsCount = Math.min(Math.max(count, 1), 15);

        try {
            // @ts-ignore
            const yf = new yahooFinance();
            const searchResult = await yf.search(query, { newsCount });

            if (!searchResult.news || searchResult.news.length === 0) {
                return `No recent news found for "${query}".`;
            }

            const newsText = searchResult.news.map((article: any, index: number) => {
                const date = article.providerPublishTime ? new Date(article.providerPublishTime).toLocaleString() : 'Unknown date';
                return `${index + 1}. "${article.title}" - ${article.publisher} (${date})
   Link: ${article.link}`;
            }).join('\n\n');

            return `Recent news for "${query}":\n\n${newsText}`;
        } catch (error) {
            console.error('Error fetching financial news:', error);
            return `Error fetching news for "${query}".`;
        }
    },
});

/**
 * Export all stock market tools
 */
export const stockMarketTools = {
    getStockPrice,
    getCompanyInfo,
    getFinancialNews,
};
