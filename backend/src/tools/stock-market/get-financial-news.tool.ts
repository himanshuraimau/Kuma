import { z } from 'zod';
import type { BaseTool } from '../base.tool';

/**
 * Mock tool to get financial news
 */
export const getFinancialNewsTool: BaseTool = {
    name: 'get_financial_news',
    description: 'Search for recent financial news about a company or stock',
    category: 'stock-market',
    requiresAuth: false,
    schema: z.object({
        query: z.string().describe('Company name or stock symbol to search news for'),
    }),

    async execute(input) {
        const { query } = input;

        // Mock news data
        const mockNews = [
            {
                title: `${query} Reports Strong Q4 Earnings`,
                source: 'Financial Times',
                date: '2 hours ago',
                summary: 'Company beats analyst expectations with revenue growth of 15%',
            },
            {
                title: `Analysts Upgrade ${query} to Buy`,
                source: 'Bloomberg',
                date: '1 day ago',
                summary: 'Major investment firms raise price targets citing strong fundamentals',
            },
            {
                title: `${query} Announces New Product Launch`,
                source: 'Reuters',
                date: '3 days ago',
                summary: 'Company unveils innovative product line expected to drive growth',
            },
        ];

        const newsText = mockNews.map((article, index) =>
            `${index + 1}. "${article.title}" - ${article.source} (${article.date})
   ${article.summary}`
        ).join('\n\n');

        return `Recent news for ${query}:\n\n${newsText}`;
    },
};
