import { z } from 'zod';
import type { BaseTool } from '../base.tool';
import yahooFinance from 'yahoo-finance2';

/**
 * Tool to get financial news
 */
export const getFinancialNewsTool: BaseTool = {
    name: 'get_financial_news',
    description: 'Search for recent financial news about a company, stock, or general market trends',
    category: 'stock-market',
    requiresAuth: false,
    schema: z.object({
        query: z.string().describe('Company name, stock symbol, or topic to search news for'),
        count: z.number().optional().describe('Number of news items to fetch (default: 5, max: 15)'),
    }),

    async execute(input) {
        const { query, count = 5 } = input;
        const newsCount = Math.min(Math.max(count, 1), 15); // Clamp between 1 and 15

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
};
