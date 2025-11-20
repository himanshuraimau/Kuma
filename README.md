# Kuma - AI-Powered Personal Assistant

An intelligent personal assistant powered by Google Gemini and LangChain, with specialized agents for different tasks.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- PostgreSQL database
- Google API Key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Kuma
   ```

2. **Install dependencies**
   ```bash
   bun run install:all
   ```

3. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```bash
   # Copy example file
   cp backend/.env.example backend/.env
   
   # Edit and add your values
   DATABASE_URL="postgresql://user:password@localhost:5432/kuma"
   GOOGLE_API_KEY="your-google-api-key"
   JWT_SECRET="your-super-secret-jwt-key"
   FRONTEND_URL="http://localhost:5173"
   ```

   **Frontend** (`frontend/.env`):
   ```bash
   VITE_API_URL="http://localhost:3001/api"
   ```

4. **Set up database**
   ```bash
   bun run db:push
   ```

5. **Start development servers**
   ```bash
   bun run dev
   ```

   This will start both backend (port 3001) and frontend (port 5173).

## 📜 Available Scripts

Run these from the **root directory**:

### Development

- `bun run dev` - Start both backend and frontend
- `bun run dev:backend` - Start only backend server
- `bun run dev:frontend` - Start only frontend dev server

### Build

- `bun run build` - Build both backend and frontend for production
- `bun run build:backend` - Build only backend
- `bun run build:frontend` - Build only frontend

### Database

- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Prisma Studio (database GUI)

### Installation

- `bun run install:all` - Install dependencies for both backend and frontend

## 🏗️ Project Structure

```
Kuma/
├── backend/              # Express + Prisma backend
│   ├── src/
│   │   ├── agents/      # LangChain agents
│   │   ├── controllers/ # Route controllers
│   │   ├── routes/      # API routes
│   │   ├── tools/       # LangChain tools
│   │   └── lib/         # Utilities
│   ├── prisma/          # Database schema
│   └── package.json
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── stores/      # Zustand stores
│   │   ├── api/         # API client
│   │   └── types/       # TypeScript types
│   └── package.json
├── docss/               # Documentation
└── package.json         # Root package.json
```

## 🤖 Features

### Agents

- **Router Agent** - Intelligent routing to specialized agents
- **Financial Agent** - Personal finance management
- **Stock Market Agent** - Stock research and analysis
- **Productivity Agent** - Task and project management (coming soon)
- **Developer Agent** - Code assistance (coming soon)
- **Communication Agent** - Email and messaging (coming soon)

### Tools

- **Stock Market Tools**
  - Get stock prices
  - Company information
  - Financial news

- **More tools coming soon:**
  - Gmail integration
  - GitHub integration
  - Calendar management

### Chat Features

- ✅ Real-time chat with AI agents
- ✅ Chat history and persistence
- ✅ Markdown support in responses
- ✅ Multiple specialized agents
- ✅ Tool calling capabilities
- ✅ Memory across conversations

## 🔑 Getting API Keys

### Google API Key (Gemini)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add it to `backend/.env` as `GOOGLE_API_KEY`

### Alpha Vantage (Stock Market Data)

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get a free API key
3. Add it to `backend/.env` as `ALPHA_VANTAGE_API_KEY`

## 🛠️ Development

### Backend Development

```bash
cd backend
bun run dev
```

Backend runs on `http://localhost:3001`

### Frontend Development

```bash
cd frontend
bun run dev
```

Frontend runs on `http://localhost:5173`

### Database Management

```bash
# View/edit database in browser
bun run db:studio

# After schema changes
bun run db:push
```

## 📝 Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GOOGLE_API_KEY` | Google Gemini API key | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `PORT` | Backend port (default: 3001) | No |
| `ALPHA_VANTAGE_API_KEY` | Stock market data API key | No |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

## 🚢 Deployment

### Backend

1. Build: `cd backend && bun run build`
2. Set environment variables on your hosting platform
3. Run database migrations: `bun run db:push`
4. Start: `bun run start`

### Frontend

1. Build: `cd frontend && bun run build`
2. Deploy the `dist` folder to your static hosting (Vercel, Netlify, etc.)
3. Set `VITE_API_URL` to your backend URL

## 📚 Documentation

- [Backend Documentation](./docss/backend-docs.md)
- [Frontend Documentation](./docss/frontend-docs.md)
- [LangChain Integration](./docss/langchain-docs.md)
- [Agents Documentation](./docss/agents-docs.md)
- [Tools Documentation](./docss/tools-docs.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [LangChain](https://langchain.com/)
- Powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
