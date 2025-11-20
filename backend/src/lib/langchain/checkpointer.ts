import { Pool } from 'pg';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

let checkpointer: PostgresSaver | null = null;

/**
 * Get or create PostgreSQL checkpointer for LangGraph memory persistence
 */
export async function getCheckpointer(): Promise<PostgresSaver> {
    if (checkpointer) {
        return checkpointer;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create PostgreSQL connection pool
    const pool = new Pool({
        connectionString: databaseUrl,
    });

    // Initialize checkpointer
    checkpointer = new PostgresSaver(pool);

    // Setup database tables for checkpoints
    await checkpointer.setup();

    console.log('✅ LangGraph checkpointer initialized with PostgreSQL');

    return checkpointer;
}

/**
 * Close checkpointer connection (for graceful shutdown)
 */
export async function closeCheckpointer(): Promise<void> {
    if (checkpointer) {
        // PostgresSaver doesn't have a close method, but we can access the pool
        // The pool will be closed when the process exits
        checkpointer = null;
    }
}
