import { z } from 'zod';
import type { BaseTool } from '../base.tool';
import yahooFinance from 'yahoo-finance2';

/**
 * Tool to get company fundamentals
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
            const stats = summary.defaultKeyStatistics;
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
};
