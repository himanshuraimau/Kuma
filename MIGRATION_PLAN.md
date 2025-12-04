# Migration Plan: LangChain → AI SDK + Supermemory

## Overview

Migrating Kuma from LangChain/LangGraph to Vercel AI SDK with Supermemory for intelligent memory management.

---

## Architecture Changes

### Before (LangChain)
```
User → Chat Controller → LangChain Agent → Tools → Response
                              ↓
                    LangGraph Checkpointer (PostgreSQL)
```

### After (AI SDK + Supermemory)
```
User → Chat Controller → AI SDK Agent → Tools + Memory Tools → Response
                              ↓                    ↓
                         PostgreSQL          Supermemory
                      (Chat History)      (Knowledge Graph)
```

---

## Tech Stack Changes

| Component | Before | After |
|-----------|--------|-------|
| AI Framework | LangChain + LangGraph | Vercel AI SDK |
| LLM Provider | @langchain/google-genai | @ai-sdk/google |
| Memory | LangGraph Checkpointer | Supermemory |
| Chat Persistence | PostgreSQL (Prisma) | PostgreSQL (Prisma) - Keep |
| Streaming | LangChain streaming | AI SDK streamText |

---

## New Dependencies

```json
{
  "dependencies": {
    "ai": "^4.0.0",
    "@ai-sdk/google": "^1.0.0",
    "supermemory": "^1.0.0",
    "@supermemory/tools": "^1.0.0"
  },
  "devDependencies": {
    // existing
  }
}
```

### Remove Dependencies
```json
{
  "@langchain/core": "remove",
  "@langchain/google-genai": "remove",
  "@langchain/langgraph": "remove",
  "@langchain/langgraph-checkpoint-postgres": "remove"
}
```

---

## File Changes

### 1. New Files to Create

```
backend/src/
├── lib/
│   ├── ai/
│   │   ├── client.ts           # AI SDK client setup
│   │   ├── agents.ts           # Agent definitions
│   │   └── tools.ts            # Tool registry (AI SDK format)
│   └── supermemory/
│       ├── client.ts           # Supermemory client
│       └── memory.service.ts   # Memory operations
├── controllers/
│   └── memory.controller.ts    # Memory CRUD operations
├── routes/
│   └── memory.routes.ts        # Memory API routes
```

### 2. Files to Modify

| File | Changes |
|------|---------|
| `backend/package.json` | Update dependencies |
| `backend/src/controllers/chat.controller.ts` | Replace LangChain with AI SDK |
| `backend/src/tools/*.ts` | Convert to AI SDK tool() format |
| `backend/src/agents/*.ts` | Convert to AI SDK Agent class |
| `backend/src/routes/index.ts` | Add memory routes |
| `backend/index.ts` | Remove LangChain initialization |

### 3. Files to Remove

| File | Reason |
|------|--------|
| `backend/src/lib/langchain/checkpointer.ts` | Replaced by Supermemory |
| `backend/src/lib/langchain/config.ts` | Replaced by AI SDK config |

---

## Implementation Details

### Phase 1: Core Setup

#### 1.1 AI SDK Client (`backend/src/lib/ai/client.ts`)
```typescript
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// Model configurations
export const models = {
  fast: google('gemini-2.0-flash-exp'),      // Quick responses
  pro: google('gemini-2.5-pro-preview'),     // Deep tasks, research
};
```

#### 1.2 Supermemory Client (`backend/src/lib/supermemory/client.ts`)
```typescript
import Supermemory from 'supermemory';

export const supermemory = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY!,
});
```

#### 1.3 Memory Service (`backend/src/lib/supermemory/memory.service.ts`)
```typescript
import { supermemory } from './client';

export class MemoryService {
  // Add memory for a user
  async addMemory(userId: string, content: string, metadata?: Record<string, any>) {
    return supermemory.memories.add({
      content,
      containerTag: `user-${userId}`,
      metadata: { ...metadata, userId },
    });
  }

  // Search user's memories
  async searchMemories(userId: string, query: string, limit = 10) {
    return supermemory.memories.search({
      query,
      containerTags: [`user-${userId}`],
      limit,
    });
  }

  // List user's memories
  async listMemories(userId: string, page = 1, limit = 20) {
    return supermemory.memories.list({
      containerTags: [`user-${userId}`],
      limit,
      offset: (page - 1) * limit,
    });
  }

  // Delete a memory
  async deleteMemory(memoryId: string) {
    return supermemory.memories.delete(memoryId);
  }
}

export const memoryService = new MemoryService();
```

---

### Phase 2: Tool Migration

#### Current LangChain Tool Format
```typescript
// OLD: LangChain format
export const getStockPriceTool: BaseTool = {
  name: 'get_stock_price',
  description: 'Get current stock price',
  category: 'stock-market',
  requiresAuth: false,
  schema: z.object({
    symbol: z.string(),
  }),
  async execute(input, context) {
    // implementation
  },
};
```

#### New AI SDK Tool Format
```typescript
// NEW: AI SDK format
import { tool } from 'ai';
import { z } from 'zod';

export const getStockPriceTool = tool({
  description: 'Get current stock price for a given symbol',
  parameters: z.object({
    symbol: z.string().describe('Stock ticker symbol (e.g., AAPL, GOOGL)'),
  }),
  execute: async ({ symbol }) => {
    // implementation - same logic
    return { price, change, percentChange };
  },
});
```

#### Tools Registry (`backend/src/lib/ai/tools.ts`)
```typescript
import { tool } from 'ai';
import { z } from 'zod';
import { supermemoryTools } from '@supermemory/tools/ai-sdk';

// Stock Market Tools
export const stockMarketTools = {
  getStockPrice: tool({ /* ... */ }),
  getCompanyInfo: tool({ /* ... */ }),
  getFinancialNews: tool({ /* ... */ }),
};

// Search Tools
export const searchTools = {
  webSearch: tool({ /* ... */ }),
  deepResearch: tool({ /* ... */ }),
  getPageContent: tool({ /* ... */ }),
};

// Vision Tools
export const visionTools = {
  analyzeImage: tool({ /* ... */ }),
  extractText: tool({ /* ... */ }),
  describeScene: tool({ /* ... */ }),
};

// App Tools (Gmail, Calendar, Docs) - loaded per user
export const createAppTools = (userId: string, credentials: any) => ({
  sendEmail: tool({ /* ... */ }),
  readEmails: tool({ /* ... */ }),
  createCalendarEvent: tool({ /* ... */ }),
  createGoogleDoc: tool({ /* ... */ }),
});

// Memory Tools - from Supermemory
export const createMemoryTools = (userId: string) => 
  supermemoryTools(process.env.SUPERMEMORY_API_KEY!, {
    containerTags: [`user-${userId}`],
  });
```

---

### Phase 3: Agent Migration

#### Current LangChain Agent
```typescript
// OLD: LangChain AgentConfig
export const routerAgentConfig: AgentConfig = {
  name: 'router',
  displayName: 'Kuma Assistant',
  description: '...',
  systemPrompt: '...',
  tools: ['deep_research', 'web_search', ...],
  modelName: 'gemini-2.0-flash',
};
```

#### New AI SDK Agent
```typescript
// NEW: AI SDK Agent
import { Experimental_Agent as Agent, stepCountIs } from 'ai';
import { models } from './client';
import { stockMarketTools, searchTools, visionTools, createMemoryTools } from './tools';

export const createRouterAgent = (userId: string, userAppTools: any = {}) => {
  return new Agent({
    model: models.fast,
    system: `You are Kuma, a versatile AI assistant with memory capabilities.

Your capabilities include:
1. **Web Research**: Use deep_research for comprehensive research, web_search for quick lookups
2. **Stock Market**: Check prices, company info, financial news
3. **Image Analysis**: Analyze uploaded images, extract text (OCR)
4. **Memory**: Remember important information, search past conversations
5. **Apps**: Send emails, create calendar events, save to Google Docs (if connected)

**Memory Guidelines**:
- When users share personal information, preferences, or important facts, save them using addMemory
- Before answering questions, search memories for relevant context
- Reference past conversations when relevant

Always be helpful, concise, and proactive about remembering useful information.`,
    tools: {
      ...stockMarketTools,
      ...searchTools,
      ...visionTools,
      ...createMemoryTools(userId),
      ...userAppTools,
    },
    stopWhen: stepCountIs(15),
  });
};

export const createResearchAgent = (userId: string) => {
  return new Agent({
    model: models.pro, // Use Pro for deep research
    system: `You are an expert research assistant...`,
    tools: {
      ...searchTools,
      ...createMemoryTools(userId),
    },
    stopWhen: stepCountIs(25), // More steps for research
  });
};
```

---

### Phase 4: Chat Controller Migration

#### New Chat Controller (`backend/src/controllers/chat.controller.ts`)
```typescript
import { streamText, generateText } from 'ai';
import { createRouterAgent, createResearchAgent } from '../lib/ai/agents';
import { loadUserAppTools } from '../lib/ai/tools';
import { memoryService } from '../lib/supermemory/memory.service';
import { prisma } from '../db/prisma';

export async function sendMessage(req: Request, res: Response) {
  const userId = req.user?.id;
  const { message, chatId, agentType = 'router' } = req.body;

  // Get or create chat
  let chat = chatId 
    ? await prisma.chat.findUnique({ where: { id: chatId, userId } })
    : await prisma.chat.create({
        data: { userId, agentType, title: message.substring(0, 50) },
      });

  // Save user message
  await prisma.message.create({
    data: { chatId: chat.id, role: 'user', content: message },
  });

  // Load user's connected app tools
  const userAppTools = await loadUserAppTools(userId);

  // Create appropriate agent
  const agent = agentType === 'research'
    ? createResearchAgent(userId)
    : createRouterAgent(userId, userAppTools);

  // Load previous messages for context
  const previousMessages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
    take: 20, // Last 20 messages
  });

  const messages = previousMessages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Stream response
  const result = await streamText({
    model: agent.model,
    system: agent.system,
    tools: agent.tools,
    messages: [...messages, { role: 'user', content: message }],
    maxSteps: 15,
  });

  // Set up streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let fullResponse = '';

  for await (const chunk of result.textStream) {
    fullResponse += chunk;
    res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
  }

  // Save assistant message
  await prisma.message.create({
    data: { chatId: chat.id, role: 'assistant', content: fullResponse },
  });

  // Auto-save important context to memory (optional)
  // This can be enhanced with smart detection
  
  res.write(`data: ${JSON.stringify({ type: 'done', chatId: chat.id })}\n\n`);
  res.end();
}
```

---

### Phase 5: Memory API

#### Memory Controller (`backend/src/controllers/memory.controller.ts`)
```typescript
import { memoryService } from '../lib/supermemory/memory.service';

export async function getMemories(req: Request, res: Response) {
  const userId = req.user?.id;
  const { page = 1, limit = 20 } = req.query;
  
  const memories = await memoryService.listMemories(userId, +page, +limit);
  res.json({ memories });
}

export async function searchMemories(req: Request, res: Response) {
  const userId = req.user?.id;
  const { query, limit = 10 } = req.query;
  
  const results = await memoryService.searchMemories(userId, query as string, +limit);
  res.json({ results });
}

export async function addMemory(req: Request, res: Response) {
  const userId = req.user?.id;
  const { content, metadata } = req.body;
  
  const memory = await memoryService.addMemory(userId, content, metadata);
  res.json({ memory });
}

export async function deleteMemory(req: Request, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;
  
  await memoryService.deleteMemory(id);
  res.json({ success: true });
}
```

#### Memory Routes (`backend/src/routes/memory.routes.ts`)
```typescript
import { Router } from 'express';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import * as memoryController from '../controllers/memory.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', memoryController.getMemories);
router.get('/search', memoryController.searchMemories);
router.post('/', memoryController.addMemory);
router.delete('/:id', memoryController.deleteMemory);

export default router;
```

---

### Phase 6: Frontend Updates

#### Chat API (`frontend/src/api/chat.api.ts`)
```typescript
// Update to handle streaming
export const sendMessageStream = async (
  data: SendMessageRequest,
  onChunk: (chunk: string) => void,
  onDone: (chatId: string) => void
) => {
  const response = await fetch(`${API_URL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const text = decoder.decode(value);
    const lines = text.split('\n').filter(line => line.startsWith('data: '));
    
    for (const line of lines) {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'text') {
        onChunk(data.content);
      } else if (data.type === 'done') {
        onDone(data.chatId);
      }
    }
  }
};
```

#### Memory API (`frontend/src/api/memory.api.ts`)
```typescript
import { apiClient } from './client';

export const getMemories = async (page = 1, limit = 20) => {
  const response = await apiClient.get('/memories', { params: { page, limit } });
  return response.data;
};

export const searchMemories = async (query: string, limit = 10) => {
  const response = await apiClient.get('/memories/search', { params: { query, limit } });
  return response.data;
};

export const addMemory = async (content: string, metadata?: Record<string, any>) => {
  const response = await apiClient.post('/memories', { content, metadata });
  return response.data;
};

export const deleteMemory = async (id: string) => {
  const response = await apiClient.delete(`/memories/${id}`);
  return response.data;
};
```

---

## Migration Steps (Order of Execution)

### Step 1: Install Dependencies
```bash
cd backend
npm install ai @ai-sdk/google supermemory @supermemory/tools
npm uninstall @langchain/core @langchain/google-genai @langchain/langgraph @langchain/langgraph-checkpoint-postgres
```

### Step 2: Create AI SDK Infrastructure
1. Create `backend/src/lib/ai/client.ts`
2. Create `backend/src/lib/supermemory/client.ts`
3. Create `backend/src/lib/supermemory/memory.service.ts`

### Step 3: Migrate Tools
1. Convert each tool in `backend/src/tools/` to AI SDK format
2. Create `backend/src/lib/ai/tools.ts` registry

### Step 4: Migrate Agents
1. Create `backend/src/lib/ai/agents.ts` with Agent classes
2. Remove old `backend/src/agents/` files

### Step 5: Update Chat Controller
1. Rewrite `chat.controller.ts` with AI SDK
2. Add streaming support

### Step 6: Add Memory API
1. Create `memory.controller.ts`
2. Create `memory.routes.ts`
3. Update `routes/index.ts`

### Step 7: Update Frontend
1. Update `chat.api.ts` for streaming
2. Create `memory.api.ts`
3. Update `chat.store.ts` for streaming
4. Create memories UI page

### Step 8: Cleanup
1. Remove `backend/src/lib/langchain/`
2. Remove old agent/tool files
3. Update `backend/index.ts` initialization

---

## Environment Variables

```env
# Existing
DATABASE_URL=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
EXA_API_KEY=...

# New/Updated
GOOGLE_API_KEY=...           # For AI SDK (Gemini)
SUPERMEMORY_API_KEY=...      # For Supermemory

# Remove (no longer needed)
# GOOGLE_GENERATIVE_AI_API_KEY (LangChain)
```

---

## Testing Checklist

- [ ] Chat messages work with streaming
- [ ] All tools execute correctly
- [ ] Memory is saved per user
- [ ] Memory search returns relevant results
- [ ] Apps (Gmail, Calendar, Docs) still work
- [ ] Research agent uses deep model
- [ ] Error handling works properly
- [ ] Frontend displays streaming text

---

## Rollback Plan

If issues occur:
1. Keep LangChain dependencies as devDependencies initially
2. Feature flag to switch between implementations
3. Backup chat history before migration
4. Test in staging environment first

---

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| Setup & Dependencies | 1 hour |
| Tool Migration | 2 hours |
| Agent Migration | 2 hours |
| Chat Controller | 2 hours |
| Memory API | 1 hour |
| Frontend Updates | 2 hours |
| Testing & Fixes | 2 hours |
| **Total** | **~12 hours** |
