import { z } from 'zod';
import Exa from 'exa-js';
import type { BaseTool } from '../base.tool';

const exa = new Exa(process.env.EXA_API_KEY || '');

/**
 * Generate multiple search queries for comprehensive research
 */
function generateSearchQueries(topic: string, depth: 'quick' | 'standard' | 'comprehensive'): string[] {
    const numQueries = depth === 'quick' ? 3 : depth === 'standard' ? 5 : 8;

    // Generate diverse search queries to cover different aspects
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
 * Synthesize information from multiple sources
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

    // Combine all information
    const combinedInfo = information.join('\n\n---\n\n');

    return `RESEARCH SOURCES (${sources.length} sources):
${sources.map((url, i) => `${i + 1}. ${url}`).join('\n')}

GATHERED INFORMATION:
${combinedInfo}`;
}

/**
 * Deep research tool - conducts comprehensive multi-source research
 */
export const deepResearchTool: BaseTool = {
    name: 'deep_research',
    description:
        'Conduct comprehensive, in-depth research on any topic by executing multiple searches and gathering information from many sources. Use this for research tasks that require detailed, well-sourced information. Returns extensive information from 10-20 sources.',
    category: 'search',
    requiresAuth: false,
    schema: z.object({
        topic: z.string().describe('The topic to research in depth'),
        depth: z
            .enum(['quick', 'standard', 'comprehensive'])
            .default('standard')
            .describe(
                'Research depth: quick (3 searches), standard (5 searches), comprehensive (8 searches)'
            ),
    }),

    async execute(input) {
        try {
            console.log(`🔍 Starting deep research on: ${input.topic} (${input.depth} mode)`);

            // Generate search queries
            const queries = generateSearchQueries(input.topic, input.depth);
            console.log(`📝 Generated ${queries.length} search queries`);

            const allResults: any[] = [];
            const resultsPerQuery = input.depth === 'comprehensive' ? 5 : 3;

            // Execute all searches
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

                    // Small delay to avoid rate limiting
                    await new Promise((resolve) => setTimeout(resolve, 500));
                } catch (error: any) {
                    console.error(`Error in search ${i + 1}:`, error.message);
                    // Continue with other searches
                }
            }

            console.log(`✅ Completed ${allResults.length} searches`);

            // Synthesize all information
            const synthesized = synthesizeResearch(allResults);

            console.log(`📊 Research complete! Gathered information from multiple sources`);

            return synthesized;
        } catch (error: any) {
            throw new Error(`Deep research failed: ${error.message}`);
        }
    },
};
