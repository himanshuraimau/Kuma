import { z } from 'zod';
import Exa from 'exa-js';
import type { BaseTool } from '../base.tool';

const exa = new Exa(process.env.EXA_API_KEY);

/**
 * Search the web using Exa's semantic search
 */
export const webSearchTool: BaseTool = {
    name: 'web_search',
    description:
        'Search the internet for information using natural language queries. Use this when you need current information, facts, news, or research on any topic. Returns relevant web pages with titles, URLs, and content summaries.',
    category: 'search',
    requiresAuth: false,
    schema: z.object({
        query: z.string().describe('Natural language search query'),
        numResults: z
            .number()
            .min(1)
            .max(10)
            .default(5)
            .describe('Number of results to return (1-10)'),
        type: z
            .enum(['neural', 'keyword', 'auto'])
            .default('auto')
            .describe('Search type: neural (semantic), keyword (traditional), or auto'),
    }),

    async execute(input) {
        try {
            const result = await exa.searchAndContents(input.query, {
                numResults: input.numResults,
                type: input.type,
                text: { maxCharacters: 1000 },
                highlights: true,
            });

            if (!result.results || result.results.length === 0) {
                return 'No results found for your query.';
            }

            // Format results
            const formattedResults = result.results
                .map((item: any, index: number) => {
                    const parts = [
                        `${index + 1}. **${item.title}**`,
                        `   URL: ${item.url}`,
                    ];

                    if (item.text) {
                        parts.push(`   Summary: ${item.text.substring(0, 300)}...`);
                    }

                    if (item.highlights && item.highlights.length > 0) {
                        parts.push(`   Key Points: ${item.highlights.slice(0, 2).join(' | ')}`);
                    }

                    return parts.join('\n');
                })
                .join('\n\n');

            return `Found ${result.results.length} results:\n\n${formattedResults}`;
        } catch (error: any) {
            throw new Error(`Web search failed: ${error.message}`);
        }
    },
};

/**
 * Find similar web pages to a given URL
 */
export const findSimilarTool: BaseTool = {
    name: 'find_similar_pages',
    description:
        'Find web pages similar to a given URL. Useful for finding related content, competitors, or alternative sources on the same topic.',
    category: 'search',
    requiresAuth: false,
    schema: z.object({
        url: z.string().url().describe('URL to find similar pages for'),
        numResults: z
            .number()
            .min(1)
            .max(10)
            .default(5)
            .describe('Number of similar pages to return (1-10)'),
    }),

    async execute(input) {
        try {
            const result = await exa.findSimilarAndContents(input.url, {
                numResults: input.numResults,
                text: { maxCharacters: 500 },
            });

            if (!result.results || result.results.length === 0) {
                return 'No similar pages found.';
            }

            // Format results
            const formattedResults = result.results
                .map((item: any, index: number) => {
                    return [
                        `${index + 1}. **${item.title}**`,
                        `   URL: ${item.url}`,
                        item.text ? `   Summary: ${item.text.substring(0, 200)}...` : '',
                    ]
                        .filter(Boolean)
                        .join('\n');
                })
                .join('\n\n');

            return `Found ${result.results.length} similar pages:\n\n${formattedResults}`;
        } catch (error: any) {
            throw new Error(`Find similar failed: ${error.message}`);
        }
    },
};

/**
 * Get detailed content from a specific URL
 */
export const getPageContentTool: BaseTool = {
    name: 'get_page_content',
    description:
        'Retrieve cleaned, readable content from a specific web page URL. Use this to get the full text content of an article or page.',
    category: 'search',
    requiresAuth: false,
    schema: z.object({
        url: z.string().url().describe('URL of the page to retrieve content from'),
    }),

    async execute(input) {
        try {
            const result = await exa.getContents([input.url], {
                text: { maxCharacters: 5000 },
            });

            if (!result.results || result.results.length === 0) {
                return 'Could not retrieve content from this URL.';
            }

            const page = result.results[0];

            if (!page) {
                return 'Could not retrieve content from this URL.';
            }

            return [
                `**${page.title}**`,
                `URL: ${page.url}`,
                `\nContent:\n${page.text || 'No text content available'}`,
            ].join('\n');
        } catch (error: any) {
            throw new Error(`Failed to get page content: ${error.message}`);
        }
    },
};
