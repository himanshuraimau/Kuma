# Kuma AI - Backend Documentation

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Controllers](#controllers)
7. [Core Libraries](#core-libraries)
8. [AI/Agent System](#aiagent-system)
9. [Tools System](#tools-system)
10. [App Integrations](#app-integrations)
11. [Redis Queue System](#redis-queue-system)
12. [Authentication](#authentication)
13. [Document Processing (RAG)](#document-processing-rag)
14. [Memory System (Supermemory)](#memory-system-supermemory)
15. [Voice Processing](#voice-processing)
16. [Environment Variables](#environment-variables)
17. [Running the Backend](#running-the-backend)

---

## Overview

Kuma AI Backend is a Node.js/Express server built with TypeScript that powers an intelligent AI assistant. It provides:

- **Multi-agent AI system** with specialized agents for different tasks
- **Real-time chat** with streaming responses (SSE)
- **Tool calling** for external integrations (Gmail, Calendar, Drive, GitHub, etc.)
- **Document processing** with PDF analysis (RAG - Retrieval Augmented Generation)
- **Long-term memory** using Supermemory for personalized conversations
- **Voice processing** with speech-to-text and text-to-speech
- **OAuth integrations** for Google Workspace and GitHub

---

## Project Structure

```
backend/
├── index.ts                 # Main Express server entry point
├── worker.ts                # Redis message worker entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeding
│   └── migrations/          # Database migrations
├── src/
│   ├── controllers/         # Route handlers (business logic)
│   │   ├── admin.controller.ts
│   │   ├── agents.controller.ts
│   │   ├── apps.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── documents.controller.ts
│   │   ├── memory.controller.ts
│   │   ├── upload.controller.ts
│   │   ├── voice.controller.ts
│   │   └── voice-process.controller.ts
│   ├── routes/              # Express route definitions
│   │   ├── index.ts         # Route aggregator
│   │   ├── admin.routes.ts
│   │   ├── agents.routes.ts
│   │   ├── apps.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── documents.routes.ts
│   │   ├── memory.routes.ts
│   │   ├── upload.routes.ts
│   │   ├── voice.routes.ts
│   │   └── voice-process.routes.ts
│   ├── db/
│   │   └── prisma.ts        # Prisma client singleton
│   ├── apps/                # App registry (integrations metadata)
│   │   ├── index.ts
│   │   ├── base.app.ts
│   │   ├── gmail/
│   │   ├── calendar/
│   │   ├── docs/
│   │   ├── drive/
│   │   ├── sheets/
│   │   ├── slides/
│   │   └── github/
│   ├── lib/
│   │   ├── auth.ts          # Authentication logic
│   │   ├── storage.ts       # File storage utilities
│   │   ├── documents.ts     # Document processing (PDF)
│   │   ├── encryption.ts    # Credential encryption
│   │   ├── formatters.ts    # Response formatters
│   │   ├── vision.ts        # Image processing
│   │   ├── ai/              # AI/Agent system
│   │   │   ├── client.ts    # OpenAI client
│   │   │   ├── agents/      # Agent definitions
│   │   │   │   ├── index.ts
│   │   │   │   ├── agent.ts     # Main agent logic
│   │   │   │   ├── configs.ts   # Agent configurations
│   │   │   │   └── types.ts     # Agent types
│   │   │   └── tools/       # AI tool definitions
│   │   │       ├── index.ts
│   │   │       ├── app.tools.ts
│   │   │       ├── search.tools.ts
│   │   │       ├── stock-market.tools.ts
│   │   │       ├── vision.tools.ts
│   │   │       ├── memory.tools.ts
│   │   │       └── document.tools.ts
│   │   ├── middleware/      # Express middleware
│   │   │   ├── index.ts
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── oauth/           # OAuth handling
│   │   │   ├── oauth.service.ts
│   │   │   ├── google.provider.ts
│   │   │   └── github.provider.ts
│   │   ├── redis/           # Redis queue system
│   │   │   ├── client.ts
│   │   │   ├── producer.ts
│   │   │   ├── streams.ts
│   │   │   ├── status.ts
│   │   │   └── types.ts
│   │   ├── supermemory/     # Long-term memory
│   │   │   ├── client.ts
│   │   │   └── memory.service.ts
│   │   ├── voice/           # Voice processing
│   │   │   └── sarvam.ts
│   │   └── workers/         # Background workers
│   │       └── message-worker.ts
│   └── types/               # TypeScript type definitions
│       ├── apps.types.ts
│       ├── auth.types.ts
│       └── langchain.types.ts
└── uploads/                 # File upload storage
    ├── temp/
    └── chats/
```

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun / Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| AI SDK | Vercel AI SDK |
| LLM | OpenAI GPT-4o / GPT-4o-mini |
| Search | Exa (semantic search) |
| Memory | Supermemory |
| Queue | Redis Streams |
| Auth | JWT |
| OAuth | Google, GitHub |
| Voice STT/TTS | Sarvam AI |
| PDF Parsing | pdf-parse |

### Key Dependencies

```json
{
  "@ai-sdk/openai": "AI SDK OpenAI provider",
  "ai": "Vercel AI SDK for streaming",
  "prisma": "Database ORM",
  "express": "Web framework",
  "ioredis": "Redis client",
  "googleapis": "Google API client",
  "supermemory": "Long-term memory",
  "exa-js": "Semantic web search",
  "bcrypt": "Password hashing",
  "jsonwebtoken": "JWT auth",
  "multer": "File uploads",
  "pdf-parse": "PDF text extraction",
  "livekit-server-sdk": "Voice rooms"
}
```

---

## Database Schema

The database uses PostgreSQL with Prisma ORM. Here are the main models:

### Users

```prisma
model users {
  id         String       @id @default(uuid())
  email      String       @unique
  name       String
  password   String       // bcrypt hashed
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  chats      chats[]
  documents  documents[]
  user_apps  user_apps[]
  user_tools user_tools[]
}
```

### Chats & Messages

```prisma
model chats {
  id             String      @id @default(uuid())
  userId         String
  title          String?
  agentType      String      @default("router")
  threadId       String      @unique
  summary        String?     // Hybrid memory: conversation summary
  summarizedUpTo Int         @default(0)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  messages       messages[]
  documents      documents[]
}

model messages {
  id                  String   @id @default(uuid())
  chatId              String
  role                String   // 'user' | 'assistant'
  content             String
  toolCalls           Json?    // AI tool calls
  imageAttachments    Json?    // Attached images
  documentAttachments Json?    // Attached PDFs
  createdAt           DateTime @default(now())
}
```

### Apps & User Apps

```prisma
model apps {
  id          String      @id @default(uuid())
  name        String      @unique
  category    String
  displayName String
  description String
  icon        String?
  authType    String      // 'oauth' | 'api_key'
  isActive    Boolean     @default(true)
  config      Json        @default("{}")
  user_apps   user_apps[]
}

model user_apps {
  id          String    @id @default(uuid())
  userId      String
  appId       String
  credentials Json      // Encrypted OAuth tokens
  metadata    Json?
  isConnected Boolean   @default(true)
  lastSyncAt  DateTime?
  @@unique([userId, appId])
}
```

### Documents (RAG)

```prisma
model documents {
  id             String    @id @default(uuid())
  userId         String
  chatId         String?
  filename       String
  displayName    String
  mimeType       String    @default("application/pdf")
  fileSize       Int
  pageCount      Int?
  extractedText  String?   @db.Text
  status         String    @default("processing")
  summary        String?
  metadata       Json?
  expiresAt      DateTime?
  createdAt      DateTime  @default(now())
}
```

### Message Jobs (Redis Queue)

```prisma
model message_jobs {
  id          String    @id @default(uuid())
  jobId       String    @unique
  chatId      String
  userId      String
  status      String
  message     String
  agentType   String
  result      Json?
  error       String?
  retryCount  Int       @default(0)
  createdAt   DateTime  @default(now())
  completedAt DateTime?
}
```

### Agents & Tools

```prisma
model agents {
  id           String   @id @default(uuid())
  name         String   @unique
  displayName  String
  description  String
  systemPrompt String
  isActive     Boolean  @default(true)
}

model tools {
  id           String   @id @default(uuid())
  name         String   @unique
  category     String
  displayName  String
  description  String
  requiresAuth Boolean  @default(false)
  isActive     Boolean  @default(true)
}
```

---

## API Routes

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| POST | `/logout` | Logout user | Yes |

### Chat Routes (`/api/chat`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Send message (non-streaming) | Yes |
| POST | `/stream` | Send message (streaming SSE) | Yes |
| GET | `/` | Get all user chats | Yes |
| GET | `/:id` | Get specific chat with messages | Yes |
| PATCH | `/:id` | Update chat title | Yes |
| DELETE | `/:id` | Delete chat | Yes |

### Agents Routes (`/api/agents`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all available agents | Yes |
| GET | `/:name` | Get specific agent info | Yes |

### Apps Routes (`/api/apps`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all available apps | Yes |
| GET | `/connected` | Get user's connected apps | Yes |
| GET | `/tools` | Get available tools | Yes |
| GET | `/:appName/connect` | Start OAuth flow | Yes |
| GET | `/:appName/callback` | OAuth callback | No |
| DELETE | `/:appName/disconnect` | Disconnect app | Yes |

### Documents Routes (`/api/documents`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/upload` | Upload PDF document | Yes |
| GET | `/` | List user documents | Yes |
| GET | `/:id` | Get specific document | Yes |
| DELETE | `/:id` | Delete document | Yes |
| POST | `/:id/query` | Query document with question | Yes |
| POST | `/:id/summarize` | Summarize document | Yes |
| POST | `/compare` | Compare multiple documents | Yes |
| POST | `/:id/extract` | Extract text from document | Yes |

### Memory Routes (`/api/memories`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Add new memory | Yes |
| GET | `/` | List all memories | Yes |
| GET | `/search` | Search memories | Yes |
| GET | `/:id` | Get specific memory | Yes |
| PUT | `/:id` | Update memory | Yes |
| DELETE | `/:id` | Delete memory | Yes |
| POST | `/context` | Get relevant context | Yes |

### Upload Routes (`/api/upload`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/analyze` | Upload and analyze image | Yes |
| POST | `/extract-text` | Upload and OCR image | Yes |
| POST | `/describe` | Upload and describe image | Yes |

### Voice Routes (`/api/voice`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/token` | Get LiveKit token | Yes |
| POST | `/webhook` | LiveKit webhook | No |
| POST | `/transcribe` | Transcribe audio | Yes |
| POST | `/process` | Full voice flow (STT+AI+TTS) | Yes |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/redis/health` | Redis health check | Yes |
| GET | `/redis/metrics` | Stream metrics | Yes |
| GET | `/jobs/:jobId` | Get job status | Yes |
| GET | `/dlq` | Get DLQ messages | Yes |
| POST | `/dlq/:messageId/retry` | Retry DLQ message | Yes |
| POST | `/stream/trim` | Trim stream | Yes |

---

## Controllers

### AuthController

Handles user authentication:

- **signup**: Creates new user with bcrypt-hashed password
- **login**: Validates credentials, returns JWT token
- **me**: Returns current authenticated user
- **logout**: Stateless logout (client removes token)

### ChatController

Manages chat conversations:

- **streamMessage**: Main endpoint for AI chat
  - Supports multimodal input (text + images + documents)
  - Uses SSE (Server-Sent Events) for streaming
  - Supports Redis queue for async processing
- **sendMessage**: Non-streaming alternative
- **getChats/getChat**: Fetch chat history
- **deleteChat/updateChatTitle**: Chat management

### AppsController

Manages OAuth app integrations:

- **getApps**: Lists all available apps with connection status
- **connectApp**: Initiates OAuth flow
- **handleCallback**: Processes OAuth callback
- **disconnectApp**: Removes app connection
- **getAvailableTools**: Lists tools from connected apps

### DocumentsController

Handles PDF document processing:

- **uploadDocument**: Uploads PDF, extracts text
- **queryDocument**: Answers questions about document
- **summarizeDocument**: Generates AI summary
- **compareDocuments**: Compares multiple documents

### MemoryController

Manages long-term memory (Supermemory):

- **addMemory**: Stores new memory
- **searchMemories**: Semantic search across memories
- **listMemories**: Paginated memory list
- **getRelevantContext**: Gets context for AI

---

## Core Libraries

### `lib/auth.ts`

Authentication functions:

```typescript
signUp(data: SignupRequest): Promise<AuthResponse>
signIn(data: LoginRequest): Promise<AuthResponse>
verifyToken(token: string): { userId: string; email: string }
getUser(userId: string): Promise<User>
signOut(): Promise<void>
```

### `lib/storage.ts`

File storage utilities:

```typescript
upload                    // Multer instance for file uploads
deleteFile(filepath)      // Delete file from filesystem
saveChatImage(chatId, file) // Save image to chat folder
getChatImageBase64(chatId, filename) // Get image as base64
cleanupOldFiles()         // Clean temp files (hourly)
```

### `lib/documents.ts`

PDF document processing:

```typescript
uploadDocument(userId, filePath, filename, chatId?)
queryDocument(documentId, question)
summarizeDocument(documentId)
compareDocuments(documentIds, prompt)
extractDocumentText(documentId)
getDocumentAttachments(documentIds, userId)
buildDocumentContext(message, attachments)
```

### `lib/encryption.ts`

Credential encryption for OAuth tokens:

```typescript
encryptCredentials(credentials: object): string
decryptCredentials(encrypted: string): object
```

---

## AI/Agent System

### Agent Architecture

The AI system uses Vercel AI SDK with OpenAI models. Agents are configured with:

- **System prompt**: Instructions for the AI
- **Tools**: Available functions the AI can call
- **Model type**: 'fast' (GPT-4o-mini) or 'pro' (GPT-4o)

### Agent Configurations (`lib/ai/agents/configs.ts`)

| Agent | Description | Model | Key Tools |
|-------|-------------|-------|-----------|
| `router` | Main assistant, handles all requests | fast | All tools |
| `research` | Deep research specialist | pro | deepResearch, webSearch |
| `stock-market` | Financial analysis | pro | getStockPrice, getCompanyInfo |
| `financial` | Personal finance advisor | pro | Gmail, Calendar tools |

### Main Agent Flow (`lib/ai/agents/agent.ts`)

```typescript
streamAgent({
  agentName,      // Agent to use
  userId,         // For user-specific tools
  chatId,         // Chat context
  message,        // User message
  imageAttachments?,    // Optional images
  documentAttachments?, // Optional PDFs
  onChunk,        // Streaming callback
  onToolCall,     // Tool call callback
  onToolResult,   // Tool result callback
  onFinish,       // Completion callback
})
```

### Hybrid Memory System

To handle long conversations without exceeding context limits:

1. **Recent Messages**: Last 15 messages kept in full
2. **Summary**: Older messages are summarized using AI
3. **Threshold**: Summarization triggers at 30+ messages

```typescript
const MAX_RECENT_MESSAGES = 15;
const SUMMARIZE_THRESHOLD = 30;
const MESSAGES_TO_SUMMARIZE = 20;
```

### Tool Loading

Tools are loaded dynamically per user:

1. **Base tools**: Always available (search, stock market, vision)
2. **Memory tools**: Per-user Supermemory integration
3. **App tools**: Based on user's connected apps

---

## Tools System

### Base Tools (`lib/ai/tools/`)

#### Search Tools (`search.tools.ts`)

| Tool | Description |
|------|-------------|
| `webSearch` | Semantic web search using Exa |
| `findSimilarPages` | Find similar web pages |
| `getPageContent` | Retrieve full page content |
| `deepResearch` | Multi-query comprehensive research |

#### Stock Market Tools (`stock-market.tools.ts`)

| Tool | Description |
|------|-------------|
| `getStockPrice` | Real-time stock quotes |
| `getCompanyInfo` | Company fundamentals |
| `getFinancialNews` | Financial news search |

#### Vision Tools (`vision.tools.ts`)

| Tool | Description |
|------|-------------|
| `analyzeImage` | Custom image analysis |
| `extractText` | OCR text extraction |
| `describeImage` | Scene description |

#### Memory Tools (`memory.tools.ts`)

| Tool | Description |
|------|-------------|
| `addMemory` | Store new memory |
| `searchMemories` | Search past memories |
| `getMemory` | Retrieve specific memory |

### App Tools (`lib/ai/tools/app.tools.ts`)

#### Gmail Tools

| Tool | Description |
|------|-------------|
| `sendEmail` | Send email |
| `readEmails` | Read recent emails |
| `searchEmails` | Search emails |

#### Calendar Tools

| Tool | Description |
|------|-------------|
| `createCalendarEvent` | Schedule events |
| `listCalendarEvents` | View upcoming events |

#### Google Docs Tools

| Tool | Description |
|------|-------------|
| `createGoogleDoc` | Create new document |
| `readGoogleDoc` | Read document content |

#### Google Drive Tools

| Tool | Description |
|------|-------------|
| `listDriveFiles` | Browse files |
| `searchDriveFiles` | Search files |
| `createDriveFolder` | Create folders |
| `uploadToDrive` | Upload files |
| `downloadFromDrive` | Download files |
| `getDriveFileInfo` | Get file metadata |
| `deleteDriveFile` | Delete files |
| `moveDriveFile` | Move files |
| `shareDriveFile` | Share files |

#### Google Sheets Tools

| Tool | Description |
|------|-------------|
| `createSpreadsheet` | Create spreadsheet |
| `readSpreadsheet` | Read data |
| `updateSpreadsheet` | Update cells |
| `appendToSpreadsheet` | Append rows |
| `createSheet` | Add new sheet/tab |
| `listSpreadsheets` | List spreadsheets |

#### Google Slides Tools

| Tool | Description |
|------|-------------|
| `createPresentation` | Create presentation |
| `readPresentation` | Read slides |
| `addSlide` | Add new slide |
| `listPresentations` | List presentations |

#### GitHub Tools

| Tool | Description |
|------|-------------|
| `listRepositories` | List user repos |
| `getRepository` | Get repo details |
| `listIssues` | View issues |
| `createIssue` | Create issue |
| `getIssue` | Get issue details |
| `listPullRequests` | View PRs |
| `searchCode` | Search code |
| `getFileContent` | Read file content |

---

## App Integrations

### OAuth Flow

1. **User clicks Connect** → Frontend calls `/api/apps/:appName/connect`
2. **Server generates auth URL** → Returns OAuth provider URL
3. **User authorizes** → Redirected to provider consent screen
4. **Callback** → Provider redirects to `/api/apps/:appName/callback`
5. **Token exchange** → Server exchanges code for tokens
6. **Store encrypted** → Tokens encrypted and stored in `user_apps`
7. **Redirect** → User redirected to frontend with success

### Supported Apps

| App | Provider | Scopes |
|-----|----------|--------|
| Gmail | Google | gmail.send, gmail.readonly |
| Calendar | Google | calendar.events |
| Docs | Google | documents, drive.file |
| Drive | Google | drive.file |
| Sheets | Google | spreadsheets |
| Slides | Google | presentations |
| GitHub | GitHub | repo, user |

---

## Redis Queue System

### Architecture

The backend supports two modes:

1. **Direct Processing** (default): Synchronous AI processing
2. **Redis Queue**: Async processing for scalability

### Components

#### Producer (`lib/redis/producer.ts`)

```typescript
publishMessage({
  userId,
  chatId,
  message,
  agentType,
  imageAttachments?,
  documentAttachments?,
}): Promise<string>  // Returns jobId
```

#### Worker (`worker.ts`)

Separate process that:
1. Listens to Redis stream
2. Processes messages using AI
3. Publishes results via pub/sub
4. Handles retries and DLQ

#### Status Updates (`lib/redis/status.ts`)

```typescript
subscribeToJobStatus(jobId, callback)
subscribeToChatMessages(chatId, callback)
publishJobStatus(jobId, status, message?)
```

### Job States

| Status | Description |
|--------|-------------|
| PENDING | Job queued |
| PROCESSING | Worker processing |
| COMPLETED | Successfully finished |
| FAILED | Error occurred |
| DEAD | Moved to DLQ after max retries |

---

## Authentication

### JWT Flow

1. **Signup/Login**: Server generates JWT with user ID
2. **Token storage**: Client stores in localStorage
3. **Request auth**: Client sends `Authorization: Bearer <token>`
4. **Validation**: Middleware verifies and attaches user to request

### Middleware (`lib/middleware/auth.middleware.ts`)

```typescript
authenticate(req, res, next) {
  // Extract Bearer token
  // Verify JWT
  // Load user from DB
  // Attach to req.user
}
```

### Password Security

- Hashed with bcrypt (10 salt rounds)
- Never stored in plain text
- Verified on login with bcrypt.compare

---

## Document Processing (RAG)

### Upload Flow

1. **File upload** via multer
2. **PDF parsing** with pdf-parse library
3. **Text extraction** stored in database
4. **Status tracking** (processing → ready)

### Query Flow

1. **User question** + document ID
2. **Load extracted text** from database
3. **Send to OpenAI** with context
4. **Return answer**

### Supported Operations

- **Query**: Ask questions about content
- **Summarize**: Generate comprehensive summary
- **Compare**: Compare multiple documents
- **Extract**: Get raw text

---

## Memory System (Supermemory)

### Integration

Uses Supermemory SDK for vector-based memory storage:

```typescript
const supermemory = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY,
});
```

### Container Strategy

Each user has isolated memories via container tags:

```typescript
containerTag: `user-${userId}`
```

### Memory Operations

```typescript
memoryService.addMemory(userId, content, metadata?)
memoryService.searchMemories(userId, query, limit?)
memoryService.listMemories(userId, page?, limit?)
memoryService.getMemory(memoryId)
memoryService.updateMemory(memoryId, content)
memoryService.deleteMemory(memoryId)
memoryService.getRelevantContext(userId, query, limit?)
```

---

## Voice Processing

### Sarvam AI Integration

For Indian language support:

- **STT**: Speech-to-text transcription
- **TTS**: Text-to-speech synthesis

### Voice Flow

1. **Audio upload** (WebM/MP3)
2. **Transcription** via Sarvam
3. **AI processing** via chat agent
4. **TTS synthesis** of response
5. **Audio response** returned

### LiveKit Integration

For real-time voice chat:

- Token generation for room access
- Webhook handling for events

---

## Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key

# OpenAI
OPENAI_API_KEY=sk-...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# GitHub OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Redis (optional)
USE_REDIS_QUEUE=false
REDIS_URL=redis://localhost:6379

# Supermemory
SUPERMEMORY_API_KEY=...

# Exa Search
EXA_API_KEY=...

# Sarvam Voice
SARVAM_API_KEY=...

# LiveKit
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://...

# Frontend URL (for OAuth callbacks)
FRONTEND_URL=http://localhost:5173
```

---

## Running the Backend

### Development

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Run development server
bun run dev

# Run worker (if using Redis queue)
bun run worker:dev
```

### Production

```bash
# Build
bun run build

# Start server
bun run start

# Start worker
bun run worker
```

### Database Commands

```bash
# Run migrations
bun run db:migrate

# Open Prisma Studio
bun run db:studio

# Seed database
bun run db:seed
```

---

## Docker Deployment

### Dockerfile Overview

The backend uses a multi-stage Dockerfile for optimized production builds:

```dockerfile
# Stage 1: Dependencies
FROM oven/bun:1.1-alpine AS deps
# Install all dependencies

# Stage 2: Builder  
FROM oven/bun:1.1-alpine AS builder
# Generate Prisma client, build if needed

# Stage 3: Production
FROM oven/bun:1.1-alpine AS production
# Copy only necessary files, run as non-root user
```

### Dockerfile Location

- **API Server**: `backend/Dockerfile`
- **Worker**: `backend/Dockerfile.worker`

### Building the Backend Image

```bash
# Build the backend image
docker build -t kuma-backend ./backend

# Build the worker image
docker build -f backend/Dockerfile.worker -t kuma-worker ./backend
```

### Running with Docker

```bash
# Run backend container
docker run -d \
  --name kuma-backend \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  -e OPENAI_API_KEY="sk-..." \
  kuma-backend

# Run worker container
docker run -d \
  --name kuma-worker \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e REDIS_URL="redis://host:6379" \
  -e OPENAI_API_KEY="sk-..." \
  kuma-worker
```

### Docker Compose

The recommended way is using Docker Compose (see root `docker-compose.yml`):

```bash
# Start all services
docker-compose up -d

# Start with worker (Redis queue mode)
docker-compose --profile with-worker up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

### Health Checks

The Dockerfile includes health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1
```

### Security Features

1. **Non-root user**: Runs as `kuma` user (UID 1001)
2. **Alpine base**: Minimal attack surface
3. **Multi-stage build**: No dev dependencies in production
4. **Health checks**: Container health monitoring

### Volume Mounts

```yaml
volumes:
  - backend_uploads:/app/uploads  # Persistent file storage
```

---

## Error Handling

The backend uses a centralized error handler (`lib/middleware/error.middleware.ts`):

```typescript
errorHandler(err, req, res, next) {
  // Log error
  // Format response
  // Return appropriate status code
}
```

Common error patterns:
- **400**: Validation errors (Zod)
- **401**: Authentication required
- **403**: Permission denied
- **404**: Resource not found
- **500**: Internal server error

---

## Logging

Console logging with emoji indicators:

- 📝 Signup/creation
- 🔐 Authentication
- 🔧 Tool calls
- 📨 Messages
- ✅ Success
- ❌ Errors
- 🔄 Retry/reconnection
- 🗑️ Deletion

---

This documentation covers the core backend functionality. For specific implementation details, refer to the source code in the respective files.

