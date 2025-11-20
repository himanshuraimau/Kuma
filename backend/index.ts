import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './src/routes';
import { errorHandler } from './src/lib/middleware/error.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Initialize LangChain components
async function initializeLangChain() {
    try {
        const { registerAllTools } = await import('./src/tools');
        const { registerAllAgents } = await import('./src/agents');
        const { getCheckpointer } = await import('./src/lib/langchain/checkpointer');

        // Register tools and agents
        registerAllTools();
        registerAllAgents();

        // Initialize checkpointer (sets up database tables)
        await getCheckpointer();

        console.log('✅ LangChain initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize LangChain:', error);
        process.exit(1);
    }
}

// Start server
async function startServer() {
    await initializeLangChain();

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
    });
}

startServer();