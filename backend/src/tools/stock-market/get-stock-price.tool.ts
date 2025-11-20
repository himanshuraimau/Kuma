import { z } from 'zod';
import type { BaseTool } from '../base.tool';

/**
 * Mock tool to get current stock price
 * In production, this would call Alpha Vantage or similar API
 */
export const getStockPriceTool: BaseTool = {
    name: 'get_stock_price',
    description: 'Get the current stock price and basic info for a given ticker symbol',
    category: 'stock-market',
    requiresAuth: false, // Will be true when using real API
    schema: z.object({
        symbol: z.string().describe('Stock ticker symbol (e.g., AAPL, TSLA, GOOGL)'),
    }),

    async execute(input) {
        const { symbol } = input;

        // Mock data - in production, call Alpha Vantage or similar
        const mockPrices: Record<string, any> = {
            AAPL: { price: 178.50, change: +2.30, changePercent: +1.31, volume: '52.3M' },
            TSLA: { price: 242.80, change: -5.20, changePercent: -2.10, volume: '98.1M' },
            GOOGL: { price: 142.65, change: +1.15, changePercent: +0.81, volume: '28.7M' },
            MSFT: { price: 378.91, change: +3.42, changePercent: +0.91, volume: '31.2M' },
            NVDA: { price: 495.22, change: +12.50, changePercent: +2.59, volume: '145.8M' },
        };

        const data = mockPrices[symbol.toUpperCase()];

        if (!data) {
            return `Stock symbol ${symbol} not found. Please use a valid ticker symbol like AAPL, TSLA, GOOGL, MSFT, or NVDA.`;
        }

        return `${symbol.toUpperCase()} is currently trading at $${data.price}, ${data.change >= 0 ? 'up' : 'down'} $${Math.abs(data.change)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent}%) with volume of ${data.volume}.`;
    },
};
