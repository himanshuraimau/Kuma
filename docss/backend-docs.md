# Backend Documentation

Complete guide to the Kuma backend architecture, API endpoints, and development.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [AI Agents & Tools](#ai-agents--tools)
- [App Integrations](#app-integrations)
- [Development Guide](#development-guide)

## Architecture Overview

The Kuma backend is built as a RESTful API server with real-time streaming capabilities. It follows a modular architecture with clear separation of concerns.

### Key Components

1. **Express Server** - HTTP server handling REST API requests
2. **Prisma ORM** - Type-safe database access layer
3. **AI Agents** - Specialized AI models for different tasks (powered by Google Gemini)
4. **App Registry** - Manages third-party app integrations (Gmail, GitHub, etc.)
5. **Memory Service** - Long-term memory using Supermemory vector database
6. **Authentication** - JWT-based auth with bcrypt password hashing

### Request Flow

```
Client Request → Middleware (Auth/CORS) → Route → Controller → Service/AI Agent → Database/External API → Response
```

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Bun | >= 1.0 | Runtime & package manager |
| Express | 4.18.2 | Web framework |
| Prisma | 7.1.0 | ORM for PostgreSQL |
| TypeScript | 5.x | Type safety |
| Google Gemini AI | Latest | AI model provider |
| Vercel AI SDK | 5.0.106 | AI streaming & tool calling |
| bcrypt | 5.1.1 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT authentication |
| Multer | 2.0.2 | File uploads |
| Supermemory | 3.10.0 | Vector database for memories |

## Project Structure

```
backend/
├── index.ts                 # Entry point - Express server setup
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeding
│   └── migrations/          # Database migrations
├── src/
│   ├── apps/                # App integrations
│   │   ├── base.app.ts      # App registry
│   │   ├── gmail/           # Gmail integration
│   │   ├── calendar/        # Google Calendar
│   │   ├── github/          # GitHub integration
│   │   └── ...
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── agents.controller.ts
│   │   ├── apps.controller.ts
│   │   ├── documents.controller.ts
│   │   ├── memory.controller.ts
│   │   └── upload.controller.ts
│   ├── routes/              # Route definitions
│   │   └── index.ts         # Main router
│   ├── lib/                 # Core libraries
│   │   ├── ai/              # AI agents & tools
│   │   ├── oauth/           # OAuth helpers
│   │   ├── middleware/      # Express middleware
│   │   ├── supermemory/     # Memory service
│   │   ├── auth.ts          # Auth utilities
│   │   ├── storage.ts       # File storage
│   │   ├── documents.ts     # Document processing
│   │   ├── vision.ts        # Image analysis
│   │   └── encryption.ts    # Credential encryption
│   ├── db/
│   │   └── prisma.ts        # Prisma client instance
│   └── types/               # TypeScript types
└── uploads/                 # File storage (gitignored)
```

## Database Schema

### Core Models

#### User
Stores user account information.

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Chat
Represents a conversation thread.

```prisma
model Chat {
  id             String   @id @default(uuid())
  userId         String
  title          String?
  agentType      String   @default("router")  // router, financial, etc.
  threadId       String   @unique             // LangGraph thread_id
  summary        String?  @db.Text            // Summarized context
  summarizedUpTo Int      @default(0)         // Message count summarized
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

#### Message
Individual messages in a chat.

```prisma
model Message {
  id                  String   @id @default(uuid())
  chatId              String
  role                String   // user, assistant, tool, system
  content             String   @db.Text
  toolCalls           Json?    // Tool invocations
  imageAttachments    Json?    // [{filename, url, mimetype, size}]
  documentAttachments Json?    // [{id, displayName, geminiFileUri}]
  createdAt           DateTime @default(now())
}
```

#### Document
Uploaded PDF documents (for RAG).

```prisma
model Document {
  id              String   @id @default(uuid())
  userId          String
  chatId          String?
  displayName     String
  filename        String
  mimeType        String
  sizeBytes       BigInt
  geminiFileUri   String?  // Gemini File API URI
  geminiFileState String?  // PROCESSING, ACTIVE, FAILED
  createdAt       DateTime @default(now())
}
```

#### UserApp
Stores user's connected app credentials (OAuth tokens).

```prisma
model UserApp {
  id          String   @id @default(uuid())
  userId      String
  appName     String   // gmail, github, calendar, etc.
  credentials Json     // Encrypted OAuth tokens
  isConnected Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

#### POST `/api/auth/login`
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Chat (`/api/chat`)

All chat endpoints require authentication via `Authorization: Bearer <token>` header.

#### POST `/api/chat/stream`
Send a message and get streaming response.

**Request (multipart/form-data):**
```
message: "What's the weather today?"
chatId: "optional-existing-chat-id"
agentType: "router" (optional: router, financial)
files: [image files] (optional)
documentIds: ["doc-id-1", "doc-id-2"] (optional, JSON string)
```

**Response:** Server-Sent Events (SSE)
```
event: start
data: {"chatId": "uuid", "messageId": "uuid"}

event: text
data: {"text": "The weather today is..."}

event: tool_call
data: {"name": "search_web", "args": {...}}

event: tool_result
data: {"result": "..."}

event: end
data: {"done": true}
```

#### POST `/api/chat`
Send message (non-streaming version).

**Response:**
```json
{
  "chatId": "uuid",
  "messageId": "uuid",
  "response": "AI response text"
}
```

#### GET `/api/chat`
Get all user's chats.

**Response:**
```json
{
  "chats": [
    {
      "id": "uuid",
      "title": "Chat title",
      "agentType": "router",
      "messageCount": 5,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T01:00:00Z"
    }
  ]
}
```

#### GET `/api/chat/:id`
Get specific chat with messages.

**Response:**
```json
{
  "chat": {
    "id": "uuid",
    "title": "Chat title",
    "agentType": "router",
    "createdAt": "...",
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "Hello",
        "imageAttachments": [...],
        "documentAttachments": [...],
        "createdAt": "..."
      }
    ]
  }
}
```

#### DELETE `/api/chat/:id`
Delete a chat and all its messages.

#### PATCH `/api/chat/:id/title`
Update chat title.

**Request Body:**
```json
{
  "title": "New chat title"
}
```

### Documents (`/api/documents`)

#### POST `/api/documents/upload`
Upload PDF documents for RAG.

**Request (multipart/form-data):**
```
files: [PDF files]
chatId: "optional-chat-id"
```

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "displayName": "document.pdf",
      "filename": "...",
      "sizeBytes": 12345,
      "geminiFileUri": "https://...",
      "geminiFileState": "ACTIVE"
    }
  ]
}
```

#### GET `/api/documents`
Get all user's documents.

#### DELETE `/api/documents/:id`
Delete a document.

### Apps (`/api/apps`)

#### GET `/api/apps`
Get all available apps for integration.

**Response:**
```json
{
  "apps": [
    {
      "name": "gmail",
      "displayName": "Gmail",
      "category": "communication",
      "description": "Read and send emails",
      "requiresAuth": true,
      "icon": "📧",
      "isConnected": false
    }
  ]
}
```

#### GET `/api/apps/connected`
Get user's connected apps with credentials.

#### POST `/api/apps/connect`
Initiate OAuth flow for an app.

**Request Body:**
```json
{
  "appName": "gmail"
}
```

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/..."
}
```

#### GET `/api/apps/callback?code=...&state=...`
OAuth callback handler (redirects to frontend).

#### DELETE `/api/apps/:appName`
Disconnect an app.

### Memory (`/api/memories`)

#### POST `/api/memories`
Add a memory to the vector database.

**Request Body:**
```json
{
  "content": "Remember that I prefer dark mode",
  "metadata": {
    "category": "preferences"
  }
}
```

#### GET `/api/memories/search?query=...&limit=5`
Search memories by similarity.

**Response:**
```json
{
  "memories": [
    {
      "content": "I prefer dark mode",
      "score": 0.95,
      "metadata": {...}
    }
  ]
}
```

#### GET `/api/memories`
List all memories.

### Upload (`/api/upload`)

#### POST `/api/upload/analyze`
Upload and analyze image with AI.

#### POST `/api/upload/extract-text`
Extract text from image (OCR).

#### POST `/api/upload/describe`
Get AI description of image.

## AI Agents & Tools

### Agent System

The backend uses specialized AI agents powered by Google Gemini models.

**Available Agents:**

1. **Router Agent** (`gemini-2.0-flash-exp`)
   - General-purpose conversational AI
   - Routes to appropriate tools
   - Handles most user queries

2. **Financial Agent** (`gemini-2.0-flash-exp`)
   - Stock market analysis
   - Financial data retrieval
   - Portfolio insights

3. **Productivity Agent** (planned)
   - Task management
   - Email/calendar assistance
   - Document processing

### Tool System

Tools are automatically available to agents based on user's connected apps.

**Tool Categories:**

- **Gmail Tools**: `read_emails`, `send_email`, `search_emails`
- **Calendar Tools**: `list_events`, `create_event`, `update_event`
- **GitHub Tools**: `list_repos`, `create_issue`, `list_prs`
- **Drive Tools**: `list_files`, `upload_file`, `share_file`
- **Search Tools**: `web_search`, `exa_search`
- **Stock Tools**: `get_stock_price`, `get_stock_history`

**Tool Execution Flow:**

```
User Message → Agent decides to use tool → Tool called with args → 
External API/Service → Result returned → Agent incorporates in response
```

## App Integrations

### Architecture

Apps are registered in the `AppRegistry` and implement the `BaseApp` interface.

```typescript
interface BaseApp {
  name: string;              // Unique identifier (e.g., 'gmail')
  displayName: string;       // User-facing name
  category: string;          // Category (communication, productivity, etc.)
  description: string;       // Short description
  requiresAuth: boolean;     // Needs OAuth?
  icon: string;              // Emoji or icon
  scopes: string[];          // OAuth scopes
  tools: ToolDefinition[];   // Available tools
  oauthConfig?: OAuthConfig; // OAuth configuration
}
```

### OAuth Flow

1. User clicks "Connect" on app
2. Backend generates OAuth URL with state token
3. User authorizes on provider's page
4. Provider redirects to `/api/apps/callback`
5. Backend exchanges code for tokens
6. Tokens encrypted and stored in `UserApp` table
7. Frontend redirected with success/error

### Adding New Apps

Create a new file in `backend/src/apps/`:

```typescript
import { BaseApp } from '../types/apps.types';

export class MyApp implements BaseApp {
  name = 'myapp';
  displayName = 'My App';
  category = 'productivity';
  description = 'Description of my app';
  requiresAuth = true;
  icon = '🚀';
  scopes = ['scope1', 'scope2'];
  
  tools = [
    {
      name: 'my_tool',
      description: 'What this tool does',
      parameters: zodSchema,
      execute: async (args, credentials) => {
        // Tool logic here
      }
    }
  ];
  
  oauthConfig = {
    authUrl: 'https://...',
    tokenUrl: 'https://...',
    clientId: process.env.MY_APP_CLIENT_ID,
    clientSecret: process.env.MY_APP_CLIENT_SECRET,
  };
}
```

Register in `backend/src/apps/index.ts`:

```typescript
import { MyApp } from './myapp/myapp.app';
appRegistry.register(new MyApp());
```

## Development Guide

### Setup

```bash
cd backend
bun install
```

### Environment Variables

Required variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/kuma"

# Auth
JWT_SECRET="your-super-secret-key-change-in-production"
PORT=3001
FRONTEND_URL="http://localhost:5173"

# AI
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:3001/api/apps/callback"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GITHUB_REDIRECT_URI="http://localhost:3001/api/apps/callback"

# Supermemory (optional)
SUPERMEMORY_API_KEY="..."
SUPERMEMORY_BASE_URL="https://api.supermemory.ai"
```

### Database Commands

```bash
# Generate Prisma client after schema changes
bun db:generate

# Push schema to database (development)
bun db:push

# Create migration (production)
bun db:migrate

# Open Prisma Studio (GUI)
bun db:studio

# Seed database
bun db:seed
```

### Running the Server

```bash
# Development with hot reload
bun dev

# Production
bun start
```

### Adding New Endpoints

1. **Create controller** in `src/controllers/`:

```typescript
export async function myHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    // Handler logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

2. **Create route** in `src/routes/`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../lib/middleware/auth.middleware';
import { myHandler } from '../controllers/my.controller';

const router = Router();
router.post('/', authMiddleware, myHandler);

export default router;
```

3. **Register route** in `src/routes/index.ts`:

```typescript
import myRoutes from './my.routes';
router.use('/my-endpoint', myRoutes);
```

### Testing

```bash
# Test endpoints with curl
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'

# Test authenticated endpoints
curl http://localhost:3001/api/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Debugging

Enable detailed logging:

```typescript
// In controllers
console.log('📝 Debug info:', data);

// Prisma query logging (prisma.ts)
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Error Handling

All errors are caught by the global error handler middleware:

```typescript
// src/lib/middleware/error.middleware.ts
export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}
```

### Security Best Practices

1. **Never commit sensitive data** - Use `.env` for secrets
2. **Hash passwords** - Using bcrypt with salt rounds
3. **Validate input** - Use Zod schemas for validation
4. **Encrypt credentials** - OAuth tokens are encrypted before storage
5. **Use HTTPS in production** - Configure SSL/TLS
6. **Rate limiting** - Add rate limiting middleware
7. **CORS configuration** - Restrict allowed origins

### Performance Tips

1. **Database indexing** - Add indexes for frequently queried fields
2. **Connection pooling** - Prisma handles this automatically
3. **Streaming responses** - Use SSE for large AI responses
4. **File size limits** - Configure multer limits
5. **Caching** - Cache frequently accessed data

---

**Need help?** Check the main README or open an issue on GitHub.
