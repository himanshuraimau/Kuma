# Kuma Backend Documentation

## Overview

Kuma is an AI-powered assistant backend built with **Express.js**, **Vercel AI SDK**, and **Supermemory** for intelligent memory management. It uses **Google Gemini** models for AI capabilities and **PostgreSQL** (via Prisma) for data persistence.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun / Node.js |
| Framework | Express.js |
| AI SDK | Vercel AI SDK (`ai`, `@ai-sdk/google`) |
| Models | Google Gemini 2.0 Flash (fast), Gemini 2.5 Pro (deep tasks) |
| Memory | Supermemory (`supermemory`, `@supermemory/tools`) |
| Database | PostgreSQL + Prisma ORM |
| Search | Exa.js |
| Finance | Yahoo Finance API |
| OAuth | Google OAuth 2.0 (Gmail, Calendar, Docs) |

---

## Project Structure

```
backend/
├── index.ts                    # Entry point
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
└── src/
    ├── controllers/           # Request handlers
    ├── routes/                # API route definitions
    ├── lib/                   # Core libraries
    │   ├── ai/               # AI SDK integration
    │   │   ├── agents/       # Agent configs & executor
    │   │   ├── tools/        # AI SDK tools
    │   │   └── client.ts     # Gemini client setup
    │   ├── supermemory/      # Memory service
    │   ├── middleware/       # Auth & error middleware
    │   └── oauth/            # OAuth providers
    ├── apps/                  # App integrations (Gmail, Calendar, Docs)
    ├── db/                    # Prisma client
    └── types/                 # TypeScript types
```

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| GET | `/me` | Get current user |
| POST | `/logout` | Logout |

### Chat (`/api/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Send message (non-streaming) |
| POST | `/stream` | Send message (SSE streaming) |
| GET | `/` | Get all user chats |
| GET | `/:id` | Get specific chat with messages |
| DELETE | `/:id` | Delete chat |
| PATCH | `/:id` | Update chat title |

### Memory (`/api/memories`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Add new memory |
| GET | `/` | List all memories |
| GET | `/search` | Search memories |
| GET | `/:id` | Get specific memory |
| PUT | `/:id` | Update memory |
| DELETE | `/:id` | Delete memory |

### Apps (`/api/apps`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get available apps |
| GET | `/connected` | Get user's connected apps |
| GET | `/:appName/connect` | Start OAuth flow |
| GET | `/:appName/callback` | OAuth callback |
| POST | `/:appName/disconnect` | Disconnect app |
| GET | `/tools` | Get available tools |

### Agents (`/api/agents`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all agents |
| GET | `/:name` | Get agent details |

### Upload (`/api/upload`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/image` | Upload image for vision analysis |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

---

## AI Agents

### Router Agent (Main)
The primary agent that handles all user requests.

**Name:** `router` / "Kuma Assistant"  
**Model:** Gemini 2.0 Flash (fast responses)

**Capabilities:**
- Web research & information lookup
- Stock market & financial data
- Image analysis (OCR, scene description)
- Memory management (save/recall info)
- General knowledge tasks

### Research Agent
Specialized for in-depth research tasks.

**Name:** `research` / "Research Specialist"  
**Model:** Gemini 2.5 Pro (deep analysis)

### Financial Agent
Specialized for financial analysis.

**Name:** `financial` / "Financial Analyst"  
**Model:** Gemini 2.5 Pro (detailed analysis)

### Stock Market Agent
Quick stock lookups and market data.

**Name:** `stock-market` / "Stock Market Expert"  
**Model:** Gemini 2.0 Flash (fast data)

---

## AI Tools

### Search Tools (`search.tools.ts`)
| Tool | Description |
|------|-------------|
| `webSearch` | Quick web search via Exa |
| `findSimilarPages` | Find related content |
| `getPageContent` | Retrieve full page content |
| `deepResearch` | Comprehensive multi-source research |

### Stock Market Tools (`stock-market.tools.ts`)
| Tool | Description |
|------|-------------|
| `getStockPrice` | Current stock price & change |
| `getCompanyInfo` | Company fundamentals |
| `getFinancialNews` | Market news |

### Vision Tools (`vision.tools.ts`)
| Tool | Description |
|------|-------------|
| `analyzeImage` | Custom image analysis |
| `extractText` | OCR text extraction |
| `describeImage` | Scene description |

### Memory Tools (`memory.tools.ts`)
Powered by **@supermemory/tools/ai-sdk**
| Tool | Description |
|------|-------------|
| `addMemory` | Save information |
| `searchMemories` | Find saved memories |
| `getMemory` | Retrieve specific memory |

### App Tools (`app.tools.ts`)
Dynamically loaded based on connected apps:

**Gmail Tools:**
- `sendEmail` - Send emails
- `readEmails` - Read inbox
- `searchEmails` - Search emails

**Calendar Tools:**
- `createCalendarEvent` - Create events
- `listCalendarEvents` - List upcoming events

**Google Docs Tools:**
- `createGoogleDoc` - Create documents
- `readGoogleDoc` - Read document content

---

## Supermemory Integration

Supermemory provides intelligent, searchable memory for each user.

### Services (`lib/supermemory/memory.service.ts`)

```typescript
// Add memory
addMemory(userId, content, metadata?)

// Search memories
searchMemories(userId, query, options?)

// List all memories
listMemories(userId, options?)

// Get specific memory
getMemory(userId, memoryId)

// Update memory
updateMemory(userId, memoryId, content)

// Delete memory
deleteMemory(userId, memoryId)

// Get relevant context for AI
getRelevantContext(userId, query, limit?)
```

### How It Works
- Each user has isolated memories via `containerTag: userId`
- Memories are automatically searchable with semantic search
- AI agents use memory tools to save/recall user information

---

## Environment Variables

```env
# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://...

# AI
GOOGLE_GENERATIVE_AI_API_KEY=...

# Supermemory
SUPERMEMORY_API_KEY=...

# Search
EXA_API_KEY=...

# OAuth (Google Apps)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Security
JWT_SECRET=...
ENCRYPTION_KEY=...
```

---

## Database Schema (Prisma)

### Core Models
- **User** - User accounts
- **Chat** - Conversation threads
- **Message** - Chat messages (with tool calls)
- **App** - Available app integrations
- **UserApp** - User's connected apps with credentials

---

## Running the Server

```bash
# Install dependencies
bun install

# Run database migrations
bunx prisma migrate dev

# Seed database (adds app definitions)
bunx prisma db seed

# Start development server
bun run dev

# Or with tsx
bunx tsx index.ts
```

---

## Streaming Response Format

The `/api/chat/stream` endpoint uses Server-Sent Events (SSE):

```
event: chunk
data: {"type":"text","content":"Hello"}

event: chunk
data: {"type":"tool_call","name":"webSearch","args":{...}}

event: chunk
data: {"type":"tool_result","name":"webSearch","result":{...}}

event: done
data: {"response":"Full response text","usage":{...}}
```

---

## Architecture Flow

```
User Request
     │
     ▼
┌─────────────┐
│   Express   │
│   Router    │
└─────┬───────┘
      │
      ▼
┌─────────────┐     ┌──────────────┐
│    Chat     │────▶│   AI Agent   │
│ Controller  │     │  (AI SDK)    │
└─────────────┘     └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │  Tools  │  │ Memory  │  │  Apps   │
        │ (Search,│  │(Super-  │  │ (Gmail, │
        │ Finance)│  │ memory) │  │Calendar)│
        └─────────┘  └─────────┘  └─────────┘
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │  Exa    │  │Supermem │  │ Google  │
        │ Yahoo   │  │   API   │  │  APIs   │
        └─────────┘  └─────────┘  └─────────┘
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `index.ts` | Server entry point |
| `src/lib/ai/client.ts` | Gemini model configuration |
| `src/lib/ai/agents/agent.ts` | Agent executor (stream/generate) |
| `src/lib/ai/agents/configs.ts` | Agent system prompts |
| `src/lib/ai/tools/index.ts` | Tool exports |
| `src/lib/supermemory/memory.service.ts` | Memory operations |
| `src/controllers/chat.controller.ts` | Chat API handlers |
| `src/controllers/memory.controller.ts` | Memory API handlers |

---

*Last updated: December 2025*
