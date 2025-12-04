import { tool } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY || '');

/**
 * Web search using Exa's semantic search
 */
export const webSearch = tool({
    description: 'Search the internet for information using natural language queries. Use this when you need current information, facts, news, or research on any topic. Returns relevant web pages with titles, URLs, and content summaries.',
    inputSchema: z.object({
        query: z.string().describe('Natural language search query'),
        numResults: z.number().min(1).max(10).default(5).describe('Number of results to return (1-10)'),
        type: z.enum(['neural', 'keyword', 'auto']).default('auto').describe('Search type: neural (semantic), keyword (traditional), or auto'),
    }),
    execute: async ({ query, numResults = 5, type = 'auto' }: { query: string; numResults?: number; type?: 'neural' | 'keyword' | 'auto' }) => {
        try {
            const result = await exa.searchAndContents(query, {
                numResults,
                type,
                text: { maxCharacters: 1000 },
                highlights: true,
            });

            if (!result.results || result.results.length === 0) {
                return 'No results found for your query.';
            }

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
});

/**
 * Find similar web pages
 */
export const findSimilarPages = tool({
    description: 'Find web pages similar to a given URL. Useful for finding related content, competitors, or alternative sources on the same topic.',
    inputSchema: z.object({
        url: z.string().url().describe('URL to find similar pages for'),
        numResults: z.number().min(1).max(10).default(5).describe('Number of similar pages to return (1-10)'),
    }),
    execute: async ({ url, numResults = 5 }: { url: string; numResults?: number }) => {
        try {
            const result = await exa.findSimilarAndContents(url, {
                numResults,
                text: { maxCharacters: 500 },
            });

            if (!result.results || result.results.length === 0) {
                return 'No similar pages found.';
            }

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
});

/**
 * Get page content
 */
export const getPageContent = tool({
    description: 'Retrieve cleaned, readable content from a specific web page URL. Use this to get the full text content of an article or page.',
    inputSchema: z.object({
        url: z.string().url().describe('URL of the page to retrieve content from'),
    }),
    execute: async ({ url }: { url: string }) => {
        try {
            const result = await exa.getContents([url], {
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
});

/**
 * Generate search queries for research
 */
function generateSearchQueries(topic: string, depth: 'quick' | 'standard' | 'comprehensive'): string[] {
    const numQueries = depth === 'quick' ? 3 : depth === 'standard' ? 5 : 8;

    const queries = [
        `${topic} overview introduction`,
        `${topic} history timeline evolution`,
        `${topic} latest developments updates 2024`,
        `${topic} technical details features`,
        `${topic} comparison alternatives`,
        `${topic} expert analysis review`,
        `${topic} future trends predictions`,
        `${topic} use cases applications examples`,
    ];

    return queries.slice(0, numQueries);
}

/**
 * Synthesize research results
 */
function synthesizeResearch(allResults: any[]): string {
    const sources: string[] = [];
    const information: string[] = [];

    for (const resultSet of allResults) {
        if (resultSet.results) {
            for (const result of resultSet.results) {
                if (result.url && !sources.includes(result.url)) {
                    sources.push(result.url);
                }
                if (result.text) {
                    information.push(result.text);
                }
            }
        }
    }

    const combinedInfo = information.join('\n\n---\n\n');

    return `RESEARCH SOURCES (${sources.length} sources):
${sources.map((url, i) => `${i + 1}. ${url}`).join('\n')}

GATHERED INFORMATION:
${combinedInfo}`;
}

/**
 * Deep research tool
 */
export const deepResearch = tool({
    description: 'Conduct comprehensive, in-depth research on any topic by executing multiple searches and gathering information from many sources. Use this for research tasks that require detailed, well-sourced information. Returns extensive information from 10-20 sources.',
    inputSchema: z.object({
        topic: z.string().describe('The topic to research in depth'),
        depth: z.enum(['quick', 'standard', 'comprehensive']).default('standard').describe('Research depth: quick (3 searches), standard (5 searches), comprehensive (8 searches)'),
    }),
    execute: async ({ topic, depth = 'standard' }: { topic: string; depth?: 'quick' | 'standard' | 'comprehensive' }) => {
        try {
            console.log(`🔍 Starting deep research on: ${topic} (${depth} mode)`);

            const queries = generateSearchQueries(topic, depth);
            console.log(`📝 Generated ${queries.length} search queries`);

            const allResults: any[] = [];
            const resultsPerQuery = depth === 'comprehensive' ? 5 : 3;

            for (let i = 0; i < queries.length; i++) {
                const query = queries[i];
                if (!query) continue;
                console.log(`🔎 Search ${i + 1}/${queries.length}: ${query}`);

                try {
                    const searchResults = await exa.searchAndContents(query, {
                        numResults: resultsPerQuery,
                        type: 'auto',
                        text: { maxCharacters: 2000 },
                        highlights: true,
                    });

                    allResults.push(searchResults);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                } catch (error: any) {
                    console.error(`Error in search ${i + 1}:`, error.message);
                }
            }

            console.log(`✅ Completed ${allResults.length} searches`);
            const synthesized = synthesizeResearch(allResults);
            console.log(`📊 Research complete! Gathered information from multiple sources`);

            return synthesized;
        } catch (error: any) {
            throw new Error(`Deep research failed: ${error.message}`);
        }
    },
});

/**
 * Export all search tools
 */
export const searchTools = {
    webSearch,
    findSimilarPages,
    getPageContent,
    deepResearch,
};
