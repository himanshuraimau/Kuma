# Kuma — AI-Powered Personal Assistant

An intelligent personal assistant powered by Google Gemini and LangChain, with specialized agents for different tasks. This repository contains both the **backend** (TypeScript + Bun + Prisma + Express) and **frontend** (React + Vite + TypeScript).

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Backend Development](#backend-development)
- [Frontend Development](#frontend-development)
- [Database & Prisma](#database--prisma)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [API Keys Setup](#api-keys-setup)
- [Testing & Linting](#testing--linting)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [License](#license)

---

## 🎯 Project Overview

**Kuma** is a full-stack AI assistant application with:

- **Backend**: TypeScript + Bun runtime, Prisma ORM, Express-like API (see `backend/src/`). Manages chats, agents, tools, memory, and file uploads.
- **Frontend**: React + Vite + TypeScript, Zustand for state management, shadcn/ui components (see `frontend/src/`).
- **AI Integration**: LangChain agents with Google Gemini, web search (Exa), stock market tools, vision capabilities, and app integrations (Gmail, Calendar, Docs).

### Project Structure

```
Kuma/
├── backend/              # Backend API server
│   ├── src/
│   │   ├── apps/        # App integrations (Gmail, Calendar, Docs)
│   │   ├── controllers/ # Route controllers
│   │   ├── routes/      # API routes
│   │   ├── lib/         # Auth, AI, storage utilities
│   │   └── types/       # TypeScript types
│   ├── prisma/          # Database schema & migrations
│   └── package.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── stores/      # Zustand stores
│   │   ├── api/         # API client
│   │   └── types/       # TypeScript types
│   └── package.json
├── docss/               # Documentation
├── extension/           # Browser extension (if applicable)
└── package.json         # Root workspace scripts
```

---

## ✅ Requirements

- **[Bun](https://bun.sh/)** >= 1.0.0 (recommended runtime)
- **PostgreSQL** (or any Prisma-supported database)
- **Node.js** (optional, Bun can handle most tasks)
- **Google API Key** (for Gemini AI)

Optional:
- Docker (for local PostgreSQL)
- Alpha Vantage API key (for stock market features)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/himanshuraimau/Kuma.git
cd Kuma
```

### 2. Install All Dependencies

```bash
bun run install:all
```

This installs dependencies for both backend and frontend.

### 3. Set Up Environment Variables

#### Backend Environment (`backend/.env`)

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kuma"

# AI & Authentication
GOOGLE_API_KEY="your-google-gemini-api-key"
JWT_SECRET="your-secure-jwt-secret"

# CORS & Server
FRONTEND_URL="http://localhost:5173"
PORT=3001

# Optional API Keys
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
EXA_API_KEY="your-exa-search-key"
```

#### Frontend Environment (`frontend/.env`)

Create `frontend/.env`:

```env
VITE_API_URL="http://localhost:3001/api"
```

### 4. Set Up the Database

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database (development)
bun run db:push

# Optional: Seed the database with sample data
bun run db:seed
```

### 5. Start Development Servers

```bash
# Start both backend and frontend concurrently
bun run dev
```

Or start individually:

```bash
# Backend only (runs on http://localhost:3001)
bun run dev:backend

# Frontend only (runs on http://localhost:5173)
bun run dev:frontend
```

🎉 Open <http://localhost:5173> in your browser!

---

## 🔧 Backend Development

### Location
`backend/`

### Key Commands

```bash
# Development (hot reload)
bun run dev:backend

# Build for production
bun run build:backend

# Start production server
bun run start:backend
```

### Key Directories

- `backend/src/controllers/` — API route handlers (agents, chat, auth, memory, apps)
- `backend/src/lib/` — Utilities (auth, AI/LangChain, storage, OAuth)
- `backend/src/apps/` — App integrations (Gmail, Calendar, Google Docs)
- `backend/prisma/` — Database schema and seeds

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `GOOGLE_API_KEY` | Google Gemini API key | ✅ Yes |
| `JWT_SECRET` | Secret for JWT authentication | ✅ Yes |
| `FRONTEND_URL` | Frontend origin for CORS | ✅ Yes |
| `PORT` | Backend server port (default: 3001) | No |
| `ALPHA_VANTAGE_API_KEY` | Stock market data | No |
| `EXA_API_KEY` | Web search API | No |

---

## 💻 Frontend Development

### Location
`frontend/`

### Key Commands

```bash
# Development server (Vite)
bun run dev:frontend

# Build for production
bun run build:frontend

# Preview production build
bun run preview:frontend
```

### Key Directories

- `frontend/src/components/` — React components (chat, auth, dashboard, etc.)
- `frontend/src/stores/` — Zustand state management
- `frontend/src/api/` — API client wrappers
- `frontend/src/types/` — TypeScript type definitions

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | ✅ Yes |

---

## 🗄️ Database & Prisma

### Prisma Commands

```bash
# Generate Prisma client (after schema changes)
bun run db:generate

# Push schema to database (dev only, no migrations)
bun run db:push

# Create a new migration (production-ready)
bun run db:migrate

# Open Prisma Studio (database GUI)
bun run db:studio

# Seed the database
bun run db:seed
```

### Schema Location
`backend/prisma/schema.prisma`

### After Schema Changes

```bash
bun run db:generate
bun run db:push    # or create migration: bun run db:migrate
```

---

## 📜 Available Scripts

Run these from the **root directory**:

### Development

- `bun run dev` — Start both backend and frontend
- `bun run dev:backend` — Start only backend server
- `bun run dev:frontend` — Start only frontend dev server

### Build

- `bun run build` — Build both backend and frontend for production
- `bun run build:backend` — Build only backend
- `bun run build:frontend` — Build only frontend

### Database

- `bun run db:generate` — Generate Prisma client
- `bun run db:push` — Push schema changes to database
- `bun run db:migrate` — Create and run migrations
- `bun run db:studio` — Open Prisma Studio (database GUI)
- `bun run db:seed` — Seed database with sample data

### Installation

- `bun run install:all` — Install dependencies for both backend and frontend

---

## 🌟 Features

### 🤖 AI Agents

- **Kuma Assistant** — Main intelligent assistant with access to all tools
- **Research Agent** — Web research and information gathering
- **Financial Agent** — Personal finance management
- **Stock Market Agent** — Stock research and analysis

### 🛠️ Tools & Integrations

#### Web Search (Exa)
- Semantic web search
- Find similar pages
- Get page content

#### Stock Market Tools
- Real-time stock prices
- Company information
- Financial news

#### Vision Tools
- Image analysis
- Text extraction (OCR)
- Scene description

#### App Integrations
- **Gmail**: Send, read, search emails
- **Google Calendar**: Create, list, update events
- **Google Docs**: Create, read, update, list documents

### 💬 Chat Features

- ✅ Real-time chat with AI agents
- ✅ Image upload and analysis
- ✅ Web search capabilities
- ✅ Chat history and persistence
- ✅ Markdown support in responses
- ✅ Multiple specialized agents
- ✅ Tool calling capabilities
- ✅ Memory across conversations
- ✅ Connected apps management

---

## 🔑 API Keys Setup

### Google API Key (Gemini)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add it to `backend/.env` as `GOOGLE_API_KEY`

### Alpha Vantage (Stock Market Data)

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get a free API key
3. Add it to `backend/.env` as `ALPHA_VANTAGE_API_KEY`

### Exa Search API (Optional)

1. Visit [Exa](https://exa.ai/) for API access
2. Add to `backend/.env` as `EXA_API_KEY`

---

## 🧪 Testing & Linting

### Backend Tests

```bash
cd backend
bun test
```

### Frontend Tests

```bash
cd frontend
bun test
```

### Linting

```bash
# From root or specific directory
bun run lint
```

> **Note**: If test scripts don't exist yet, consider adding unit tests for core backend logic and integration tests for API endpoints.

---

## 🚢 Deployment

### Backend Deployment

1. **Build the backend**:
   ```bash
   cd backend
   bun run build
   ```

2. **Set environment variables** on your hosting platform (Railway, Render, Fly.io, etc.)

3. **Run database migrations**:
   ```bash
   bun run db:migrate
   ```

4. **Start the server**:
   ```bash
   bun run start
   ```

### Frontend Deployment

1. **Build the frontend**:
   ```bash
   cd frontend
   bun run build
   ```

2. **Deploy the `dist` folder** to a static hosting service:
   - [Vercel](https://vercel.com/)
   - [Netlify](https://www.netlify.com/)
   - AWS S3 + CloudFront
   - Cloudflare Pages

3. **Set environment variables**:
   - `VITE_API_URL` should point to your production backend URL

### Important Deployment Notes

- Use proper **database migrations** in production (not `db:push`)
- Set strong `JWT_SECRET` values
- Configure **CORS** properly via `FRONTEND_URL`
- Use HTTPS for both frontend and backend in production
- Consider database backups and monitoring

---

## 🔧 Troubleshooting

### Prisma Client Errors

**Error**: `PrismaClient` not found or binary issues

**Solution**:
```bash
bun run db:generate
```
Ensure this runs after schema changes. In some CI/container environments, set `PRISMA_QUERY_ENGINE_BINARY` or use the JavaScript query engine.

### Database Connection Failures

**Error**: Cannot connect to database

**Solutions**:
- Verify `DATABASE_URL` is correct (username, password, host, port)
- Ensure PostgreSQL is running (check with `docker ps` if using Docker)
- Confirm database exists: `createdb kuma` (or similar)
- Check firewall rules if using remote database

### Frontend Cannot Reach Backend

**Error**: API calls fail with CORS or network errors

**Solutions**:
- Verify `VITE_API_URL` in `frontend/.env` matches backend URL (including port)
- Check `FRONTEND_URL` in `backend/.env` includes correct origin
- Ensure backend is running: `curl http://localhost:3001/health`
- Check browser console for specific CORS errors

### Bun Installation Issues

If Bun commands fail, ensure Bun is installed:
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or ~/.zshrc
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feat/your-feature`
3. **Make your changes** and test locally
4. **Commit your changes**: `git commit -m "Add: your feature description"`
5. **Push to your fork**: `git push origin feat/your-feature`
6. **Open a Pull Request** against `main`

### Contribution Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- If making schema changes, note them in `MIGRATION_PLAN.md`
- Keep PRs focused on a single feature or fix

---

## 📚 Documentation

- [Backend Documentation](./docss/backend-docs.md)
- [Frontend Documentation](./docss/frontend-docs.md)
- [LangChain Integration](./docss/langchain-docs.md)
- [Agents & Tools](./docss/agents-tools-plan.md)
- [AI SDK Documentation](./docss/AISDK.MD)
- [Architecture Overview](./docss/arch.md)

---

## 📄 License

MIT License — see LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with [LangChain](https://langchain.com/)
- Powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Runtime: [Bun](https://bun.sh/)
- Database ORM: [Prisma](https://www.prisma.io/)

---

## 💡 Next Steps

After setup, you might want to:

- Explore the [backend documentation](./docss/backend-docs.md) to understand the API structure
- Check out [agents documentation](./docss/agents-tools-plan.md) to learn about AI capabilities
- Review the [frontend documentation](./docss/frontend-docs.md) for UI component details
- Connect your Google apps (Gmail, Calendar, Docs) through the settings

For more detailed development guides, see the `docss/` directory.

---

**Happy coding! 🚀**
