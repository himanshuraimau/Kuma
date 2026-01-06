# 🐻 Kuma AI - Intelligent Personal Assistant

<div align="center">

**Your AI-Powered Personal Assistant with Memory, Vision, and App Integrations**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Documentation](#-api-reference)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Overview

**Kuma AI** is a next-generation AI personal assistant that combines the power of multiple Large Language Models (LLMs) with advanced features like long-term memory, vision capabilities, document intelligence, and seamless integration with your favorite productivity apps.

### 🎯 Key Highlights

- **🤖 Multi-Agent Architecture**: Specialized AI agents for different domains (general, finance, research)
- **🧠 Persistent Memory**: Remembers your preferences, past conversations, and personal context
- **👁️ Vision AI**: Analyze images, extract text (OCR), identify objects and scenes
- **📄 Document Intelligence**: Upload PDFs, ask questions, and get intelligent summaries
- **🔗 Native Integrations**: Gmail, Google Calendar, Drive, Docs, Sheets, GitHub, and more
- **⚡ Real-time Streaming**: Fast, responsive AI interactions with Server-Sent Events
- **🔐 Enterprise Security**: JWT authentication, encrypted credentials, secure by design
- **🐳 Production Ready**: Dockerized deployment with Redis queue, worker processes

---

## ✨ Features

### 🤖 AI Capabilities

#### **Multi-Agent System**
- **Router Agent**: Main intelligent assistant handling all queries
- **Research Agent**: Deep web research with multi-source synthesis
- **Finance Agent**: Real-time stock data, company info, market news
- **Vision Agent**: Image analysis powered by OpenAI GPT-4o

#### **Long-term Memory (Supermemory)**
```typescript
- Personal preferences and context retention
- Automatic memory creation from conversations
- Semantic search across past interactions
- Context-aware responses based on history
```

#### **Vision & Multimodal AI**
- 📸 **Image Analysis**: Describe images, answer questions about visuals
- 📝 **OCR**: Extract text from images and scanned documents
- 🎨 **Scene Understanding**: Identify objects, colors, settings
- 🖼️ **Multi-image Support**: Process multiple images simultaneously

#### **Document Intelligence**
- 📄 **PDF Processing**: Native Gemini PDF understanding (up to 1000 pages)
- 🔍 **Document Q&A**: Ask questions about uploaded documents
- 📊 **Smart Summarization**: AI-generated document summaries
- 📚 **Multi-document Analysis**: Compare and synthesize across documents

### 🔗 App Integrations

#### **Google Workspace**
- **Gmail**: Send/read emails, search inbox, compose with AI
- **Calendar**: Create events, check schedule, manage meetings
- **Drive**: Browse files, search documents, manage storage
- **Docs**: Create/edit documents with AI assistance
- **Sheets**: Analyze data, generate reports
- **Slides**: Create presentations with AI content

#### **GitHub**
- Repository management and code search
- Issue tracking and pull request management
- Code analysis and documentation generation

### 💬 Chat & Communication

- **Real-time Streaming**: Instant AI responses with SSE
- **Rich Media Support**: Images, PDFs, text in one conversation
- **Chat History**: Persistent conversation threads
- **Context-Aware**: Remembers entire conversation context
- **Tool Calling**: AI autonomously uses tools and APIs

### 🔧 Developer Features

- **RESTful API**: Well-documented endpoints
- **WebSocket Support**: Real-time bidirectional communication
- **Redis Queue**: Scalable background job processing
- **Worker Architecture**: Distributed processing for heavy tasks
- **Rate Limiting**: Built-in API protection
- **Comprehensive Logging**: Detailed request/response tracking

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                 React + Vite + TailwindCSS                   │
│           (Real-time Chat, Document Upload, Apps)            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/SSE
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│                   Express + TypeScript                       │
│              (Auth, Routing, Rate Limiting)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ↓           ↓           ↓
    ┌────────┐  ┌────────┐  ┌────────┐
    │  Auth  │  │  Chat  │  │  Apps  │
    │ Module │  │ Module │  │ Module │
    └────────┘  └────────┘  └────────┘
         │           │           │
         └───────────┼───────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                      AI Agent Layer                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Router  │  │ Research │  │ Finance  │  │  Vision  │   │
│  │  Agent   │  │  Agent   │  │  Agent   │  │  Agent   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Tool Registry                          │    │
│  │  (Web Search, Stock Data, Vision, Memory, Apps)    │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ↓           ↓           ↓
    ┌─────────┐ ┌─────────┐ ┌──────────┐
    │ OpenAI  │ │ Gemini  │ │  Other   │
    │ GPT-4o  │ │ 2.0 Flash│ │   APIs   │
    └─────────┘ └─────────┘ └──────────┘
         │           │           │
         └───────────┼───────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│                                                              │
│  ┌────────────┐  ┌─────────┐  ┌────────────┐  ┌─────────┐ │
│  │ PostgreSQL │  │  Redis  │  │ Supermemory│  │  File   │ │
│  │   (Main)   │  │ (Queue) │  │  (Memory)  │  │ Storage │ │
│  └────────────┘  └─────────┘  └────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### **Frontend Layer**
- **React 18**: Modern UI with hooks and context
- **Vite**: Lightning-fast development and builds
- **TailwindCSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing
- **Radix UI**: Accessible component primitives

#### **Backend Layer**
- **Express**: Node.js web framework
- **Bun**: Fast JavaScript runtime and package manager
- **Prisma**: Type-safe database ORM
- **JWT**: Stateless authentication
- **Multer**: Multipart form data handling

#### **AI Layer**
- **Vercel AI SDK**: Unified interface for LLMs
- **OpenAI GPT-4o**: Vision and general intelligence
- **Google Gemini 2.0**: Document processing and vision
- **Supermemory**: Long-term memory storage

#### **Infrastructure**
- **Docker**: Containerized deployment
- **Redis**: Message queue and caching
- **PostgreSQL**: Relational database
- **Nginx**: Reverse proxy (production)

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Bun** | JavaScript runtime | 1.3+ |
| **Express** | Web framework | 4.18+ |
| **TypeScript** | Type safety | 5.3+ |
| **Prisma** | Database ORM | 6.0+ |
| **PostgreSQL** | Primary database | 15+ |
| **Redis** | Queue & cache | 7+ |
| **ioredis** | Redis client | 5.8+ |
| **JWT** | Authentication | 9.0+ |

### AI & ML

| Service | Purpose |
|---------|---------|
| **Vercel AI SDK** | Unified LLM interface |
| **OpenAI GPT-4o** | Vision, chat completion |
| **Google Gemini 2.0** | PDF processing, vision |
| **Supermemory** | Long-term memory |
| **Exa AI** | Web search |

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | 18.3+ |
| **Vite** | Build tool | 5.0+ |
| **TypeScript** | Type safety | 5.3+ |
| **TailwindCSS** | Styling | 4.1+ |
| **Zustand** | State management | 5.0+ |
| **React Router** | Routing | 7.0+ |
| **Radix UI** | Components | Latest |
| **Lucide Icons** | Icon system | Latest |

### DevOps & Tools

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy |
| **Prisma Studio** | Database GUI |

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Bun** >= 1.0.0 ([Install](https://bun.sh))
- **Docker** & Docker Compose ([Install](https://docs.docker.com/get-docker/))
- **PostgreSQL** database (or use Docker)
- **Redis** (optional, for queue features)

### 1. Clone Repository

```bash
git clone https://github.com/himanshuraimau/Kuma.git
cd Kuma
```

### 2. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
bun run install:all
```

### 3. Configure Environment

Create `.env` files in both backend and frontend directories:

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kuma"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-secure-random-secret-key-here"

# Server
PORT=3001
NODE_ENV=development

# AI Services
OPENAI_API_KEY="sk-..."
GOOGLE_GENERATIVE_AI_API_KEY="..."

# Optional: Memory & Search
SUPERMEMORY_API_KEY="..."
EXA_API_KEY="..."

# Optional: Google OAuth (for app integrations)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Optional: GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Optional: LiveKit (for voice features)
LIVEKIT_API_KEY="..."
LIVEKIT_API_SECRET="..."
LIVEKIT_URL="wss://..."

# Optional: Redis Queue
USE_REDIS_QUEUE=false
REDIS_URL="redis://localhost:6379"
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Database Setup

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# (Optional) Seed database with sample data
cd backend && bun run db:seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend concurrently
bun run dev
```

Or start individually:
```bash
# Backend only
bun run dev:backend

# Frontend only
bun run dev:frontend
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `bun run db:studio` (http://localhost:5555)

---

## 📦 Installation

### Development Mode

```bash
# Clone repository
git clone https://github.com/himanshuraimau/Kuma.git
cd Kuma

# Install dependencies
bun run install:all

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your API keys

# Setup database
bun run db:generate
bun run db:push

# Start development
bun run dev
```

### Production with Docker

```bash
# Clone repository
git clone https://github.com/himanshuraimau/Kuma.git
cd Kuma

# Configure environment
cp .env.example .env
# Edit .env with production values

# Start with Docker Compose
docker compose up -d

# With worker (for background processing)
docker compose --profile with-worker up -d
```

### Docker Services

| Service | Description | Port |
|---------|-------------|------|
| `backend` | API server | 3001 |
| `frontend` | React app | 3000 |
| `redis` | Message queue | 6380 |
| `worker` | Background jobs | - |

---

## ⚙️ Configuration

### Environment Variables

#### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT signing | `random-64-char-string` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |

#### Optional - AI Services

| Variable | Description |
|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key |
| `SUPERMEMORY_API_KEY` | Long-term memory service |
| `EXA_API_KEY` | Web search API |
| `SARVAM_API_KEY` | Voice synthesis API |

#### Optional - OAuth Integrations

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |

#### Optional - Infrastructure

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_REDIS_QUEUE` | Enable Redis queue | `false` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |

### Database Schema

The application uses PostgreSQL with Prisma ORM. Main models:

- **users**: User accounts and authentication
- **chats**: Conversation threads
- **messages**: Individual chat messages
- **documents**: Uploaded PDF documents
- **apps**: Available app integrations
- **user_apps**: User-connected apps with OAuth tokens
- **memories**: Long-term memory entries

---

## 📖 Usage

### Basic Chat

1. **Sign up** or **log in** to your account
2. Click **"New Chat"** to start a conversation
3. Type your message and press Enter
4. AI responds in real-time with streaming

### Image Analysis

1. In chat, click the **image icon** (📎)
2. Upload an image (JPG, PNG, WebP)
3. Ask questions about the image:
   - "What do you see in this image?"
   - "Extract text from this document"
   - "Describe the scene in detail"

### Document Processing

1. Navigate to **Chat** page
2. Click **document icon** (📄)
3. Upload a PDF (up to 50MB, 1000 pages)
4. Ask questions:
   - "Summarize this document"
   - "What are the key findings?"
   - "Compare sections 3 and 5"

### Web Research

Just ask naturally:
```
"Research the latest developments in quantum computing"
"What are the top AI startups in 2024?"
"Deep research on climate change solutions"
```

The AI will automatically use tools like:
- `deepResearch` for comprehensive analysis
- `webSearch` for quick lookups
- `findSimilarPages` for related content

### App Integrations

#### Connect Apps

1. Go to **Apps** page
2. Click **"Connect"** on desired app (Gmail, Calendar, etc.)
3. Authorize via OAuth
4. Apps are now available to AI

#### Use Connected Apps

```
"Send an email to john@example.com about tomorrow's meeting"
"What's on my calendar today?"
"Create a document with the research findings"
"Search my drive for budget spreadsheet"
```

### Memory System

The AI remembers your preferences automatically:

```
User: "My birthday is August 3rd"
AI: [Stores to memory] "I'll remember that!"

User: "Plan my birthday party" (weeks later)
AI: [Retrieves from memory] "Sure! For your August 3rd birthday..."
```

---

## 🔌 API Reference

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}

Response:
{
  "token": "jwt-token",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

### Chat

#### Stream Message
```http
POST /api/chat/stream
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "message": "Hello, how are you?",
  "chatId": "optional-chat-id",
  "agentType": "router",
  "files": [/* optional image files */],
  "documentIds": ["doc-id-1", "doc-id-2"]
}

Response: Server-Sent Events (SSE)
data: {"type":"chunk","content":"Hello"}
data: {"type":"chunk","content":" there"}
data: {"type":"done","fullResponse":"Hello there!"}
```

#### Get Chat History
```http
GET /api/chat/history
Authorization: Bearer <token>

Response:
{
  "chats": [
    {
      "id": "chat-id",
      "title": "Chat Title",
      "agentType": "router",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Documents

#### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <pdf-file>,
  "chatId": "optional-chat-id"
}

Response:
{
  "document": {
    "id": "doc-id",
    "filename": "document.pdf",
    "displayName": "document",
    "status": "ready",
    "pageCount": 42,
    "fileSize": 1024000
  }
}
```

#### Query Document
```http
POST /api/documents/:id/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "What is the main topic?"
}

Response:
{
  "answer": "The main topic is...",
  "documentName": "document.pdf"
}
```

### Apps

#### List Available Apps
```http
GET /api/apps
Authorization: Bearer <token>

Response:
{
  "apps": [
    {
      "id": "gmail",
      "name": "Gmail",
      "category": "email",
      "isConnected": false
    }
  ]
}
```

---

## 💻 Development

### Project Structure

```
Kuma/
├── backend/              # Express API server
│   ├── src/
│   │   ├── apps/         # App integrations (Gmail, GitHub, etc.)
│   │   ├── controllers/  # Route handlers
│   │   ├── lib/          # AI agents, tools, utilities
│   │   │   ├── ai/       # AI agents & tools
│   │   │   ├── redis/    # Queue implementation
│   │   │   └── workers/  # Background jobs
│   │   └── routes/       # API endpoints
│   ├── prisma/           # Database schema & migrations
│   └── uploads/          # File storage
│
├── frontend/             # React app
│   └── src/
│       ├── api/          # API client
│       ├── components/   # UI components
│       ├── stores/       # State management
│       └── types/        # TypeScript types
│
├── docker-compose.yml    # Production
├── docker-compose.dev.yml # Development
└── README.md
```

### Running Tests

```bash
# Backend tests
cd backend
bun test

# Frontend tests
cd frontend
bun test
```

### Database Migrations

```bash
# Create migration
cd backend
bunx prisma migrate dev --name migration_name

# Apply migrations
bunx prisma migrate deploy

# Reset database
bunx prisma migrate reset
```

---

## 🐳 Deployment

### Docker Production Deployment

#### 1. Prepare Environment

```bash
git clone https://github.com/himanshuraimau/Kuma.git
cd Kuma
cp .env.example .env
nano .env  # Edit with production values
```

#### 2. Build and Start

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# With worker
docker compose --profile with-worker up -d
```

#### 3. Verify Deployment

```bash
# Check containers
docker compose ps

# View logs
docker compose logs -f backend

# Health check
curl http://localhost:3001/health
```

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check PostgreSQL is running
docker compose ps

# Verify DATABASE_URL format
# postgresql://username:password@host:port/database

# Test connection
docker exec backend bunx prisma db push
```

#### Redis Connection Error

```bash
# Ensure Redis is running
docker compose ps redis

# Check REDIS_URL
echo $REDIS_URL
```

#### Image Upload Fails

```bash
# Ensure volume is shared
docker compose down
docker compose --profile with-worker up -d

# Check volume mount
docker inspect kuma-backend | grep Mounts
docker inspect kuma-worker | grep Mounts
```

#### PDF Processing Error

- Ensure GOOGLE_GENERATIVE_AI_API_KEY is set
- Check API key has Gemini API access
- Verify PDF is under 50MB and 1000 pages

### Debug Mode

```env
# backend/.env
DEBUG=true
LOG_LEVEL=debug
```

```bash
docker compose logs -f --tail=100 backend
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for GPT-4o API
- [Google](https://ai.google.dev) for Gemini API
- [Vercel](https://vercel.com) for AI SDK
- [Supermemory](https://supermemory.ai) for memory management
- All open-source contributors

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/himanshuraimau/Kuma/issues)
- **Email**: himanshuraimau@gmail.com

---

<div align="center">

**Built with ❤️ by [Himanshu Raimau](https://github.com/himanshuraimau)**

⭐ Star us on GitHub — it motivates us a lot!

</div>
