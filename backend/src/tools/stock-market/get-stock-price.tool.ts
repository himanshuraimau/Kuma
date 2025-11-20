import { z } from 'zod';
import type { BaseTool } from '../base.tool';
import yahooFinance from 'yahoo-finance2';

/**
 * Tool to get current stock price using Yahoo Finance
 */
export const getStockPriceTool: BaseTool = {
    name: 'get_stock_price',
    description: 'Get the current stock price and basic info for a given ticker symbol',
    category: 'stock-market',
    requiresAuth: false,
    schema: z.object({
        symbol: z.string().describe('Stock ticker symbol (e.g., AAPL, TSLA, GOOGL)'),
    }),

    async execute(input) {
        const { symbol } = input;

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
            const direction = (change || 0) >= 0 ? 'up' : 'down';
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
};
