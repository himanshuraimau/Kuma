import Supermemory from 'supermemory';

/**
 * Supermemory client instance
 */
export const supermemory = new Supermemory({
    apiKey: process.env.SUPERMEMORY_API_KEY!,
});

export default supermemory;
