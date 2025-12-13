# Kuma 🐻

> Your AI-powered personal assistant with memory, vision, and app integrations

Kuma is a modern AI assistant that understands context, remembers conversations, analyzes documents and images, and integrates with your favorite apps like Gmail, Google Calendar, GitHub, and more.

## ✨ Key Features

- 🤖 **Multi-Agent System** - Specialized AI agents for different tasks (general, financial, productivity)
- 🧠 **Long-term Memory** - Remembers conversations and learns from your interactions
- 👁️ **Vision AI** - Analyze images, extract text, describe scenes using Gemini 2.0 Flash
- 📄 **Document Intelligence** - Upload, query, and compare PDFs with RAG
- 🔗 **App Integrations** - Gmail, Calendar, Drive, Docs, Sheets, Slides, GitHub
- 💬 **Real-time Chat** - Streaming responses with Server-Sent Events
- 🔐 **Secure by Default** - JWT authentication with encrypted credentials

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/himanshuraimau/Kuma.git
cd Kuma
```

2. **Install dependencies**
```bash
bun install:all
```

3. **Configure environment variables**

Backend (`.env` in `backend/`):
```env
DATABASE_URL="postgresql://user:pass@host:5432/kuma"
JWT_SECRET="your-secret-key"
PORT=3001

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# App Integrations (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Supermemory (optional)
SUPERMEMORY_API_KEY="..."
```

Frontend (`.env` in `frontend/`):
```env
VITE_API_URL="http://localhost:3001"
```

4. **Set up database**
```bash
bun db:generate
bun db:push
```

5. **Start development servers**
```bash
bun dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Project Structure

```
Kuma/
├── backend/          # Express + Prisma API server
│   ├── src/
│   │   ├── apps/     # App integrations (Gmail, GitHub, etc.)
│   │   ├── controllers/  # Route handlers
│   │   ├── lib/      # AI agents, tools, utilities
│   │   └── routes/   # API endpoints
│   └── prisma/       # Database schema & migrations
│
├── frontend/         # React + Vite client
│   └── src/
│       ├── api/      # API client functions
│       ├── components/  # UI components
│       └── stores/   # Zustand state management
│
└── docss/           # Documentation
```

## 🎯 Core Technologies

**Backend**
- Bun + Express + TypeScript
- Prisma ORM + PostgreSQL
- Google Gemini AI (Vercel AI SDK + native API)
- Supermemory for long-term memory

**Frontend**
- React 19 + Vite
- TailwindCSS + Radix UI
- Zustand for state management
- Axios for API calls

## 📖 Documentation

- [Backend Documentation](./docss/backend-docs.md) - API endpoints, architecture, and development guide
- [Frontend Documentation](./docss/frontend-docs.md) - Components, routing, and state management

## 🔑 Main Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/signup` | Create new account |
| `POST /api/auth/login` | Login to account |
| `POST /api/chat/stream` | Send message (streaming) |
| `GET /api/chat` | Get all user chats |
| `POST /api/documents/upload` | Upload PDF documents |
| `GET /api/apps` | List available apps |
| `POST /api/apps/connect` | Connect to app (OAuth) |
| `POST /api/memories` | Add memory |
| `GET /api/memories/search` | Search memories |

## 🤖 Available Agents

- **Router** - General-purpose conversational AI
- **Financial** - Stock analysis, market data, portfolio insights
- **Productivity** - Task management, scheduling, email assistance

## 🔌 Supported Integrations

- **Google Workspace** - Gmail, Calendar, Drive, Docs, Sheets, Slides
- **GitHub** - Repository management, issues, pull requests
- **Supermemory** - Long-term memory and context storage

## 🛠️ Development Commands

```bash
# Development
bun dev              # Start both frontend & backend
bun dev:backend      # Backend only
bun dev:frontend     # Frontend only

# Database
bun db:generate      # Generate Prisma client
bun db:push          # Push schema changes
bun db:studio        # Open Prisma Studio

# Build
bun build            # Build both
bun build:backend    # Build backend
bun build:frontend   # Build frontend
```

## 🤝 Contributing

Contributions are welcome! Please check out the documentation in the `docss/` folder for development guidelines.

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini for powerful AI capabilities
- Vercel AI SDK for streamlined AI integration
- Supermemory for vector storage and retrieval

---

Built with ❤️ by [Himanshu Rai](https://github.com/himanshuraimau)
