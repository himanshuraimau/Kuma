import { z } from 'zod';
import type { BaseTool } from '../base.tool';

/**
 * Mock tool to get company fundamentals
 */
export const getCompanyInfoTool: BaseTool = {
    name: 'get_company_info',
    description: 'Get company fundamentals including P/E ratio, market cap, revenue, and other key metrics',
    category: 'stock-market',
    requiresAuth: false,
    schema: z.object({
        symbol: z.string().describe('Stock ticker symbol'),
    }),

    async execute(input) {
        const { symbol } = input;

        // Mock company data
        const mockData: Record<string, any> = {
            AAPL: {
                name: 'Apple Inc.',
                sector: 'Technology',
                marketCap: '2.8T',
                peRatio: 29.5,
                revenue: '383.3B',
                profitMargin: '25.3%',
                description: 'Designs and manufactures consumer electronics, software, and online services',
            },
            TSLA: {
                name: 'Tesla Inc.',
                sector: 'Automotive',
                marketCap: '770B',
                peRatio: 65.2,
                revenue: '96.8B',
                profitMargin: '15.5%',
                description: 'Electric vehicle and clean energy company',
            },
            GOOGL: {
                name: 'Alphabet Inc.',
                sector: 'Technology',
                marketCap: '1.8T',
                peRatio: 26.8,
                revenue: '307.4B',
                profitMargin: '26.2%',
                description: 'Technology company specializing in internet services and products',
            },
        };

        const data = mockData[symbol.toUpperCase()];

        if (!data) {
            return `Company information for ${symbol} not found.`;
        }

        return `${data.name} (${symbol.toUpperCase()}):
- Sector: ${data.sector}
- Market Cap: $${data.marketCap}
- P/E Ratio: ${data.peRatio}
- Revenue: $${data.revenue}
- Profit Margin: ${data.profitMargin}
- Description: ${data.description}`;
    },
};
