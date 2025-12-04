# Kuma - Current Features

## Overview

Kuma is an AI-powered personal assistant application with a multi-agent architecture. It combines a React frontend with an Express/Node.js backend, utilizing LangChain and Google Gemini for AI capabilities.

---

## 🔐 Authentication System

### Backend
- **User Registration** (`POST /api/auth/signup`)
  - Email/password signup with Zod validation
  - Password hashing with bcrypt
  - JWT token generation

- **User Login** (`POST /api/auth/login`)
  - Email/password authentication
  - JWT token-based session management

- **Session Management**
  - JWT middleware for protected routes
  - User session validation (`GET /api/auth/me`)
  - Logout functionality

### Frontend
- **Login Page** - Email/password authentication form
- **Signup Page** - User registration form
- **Protected Routes** - Route guard for authenticated access
- **Auth State Management** - Zustand store for auth state

---

## 🤖 AI Agents System

### Router Agent (Default)
- **Name**: `router` (Kuma Assistant)
- **Model**: `gemini-2.0-flash`
- **Capabilities**:
  - Web research & information retrieval
  - Stock market & finance queries
  - Image analysis
  - General knowledge Q&A
  - Intelligent routing to appropriate tools

### Research Agent
- **Name**: `research` (Deep Research Assistant)
- **Capabilities**:
  - Comprehensive multi-source research
  - Multi-depth research modes (quick/standard/comprehensive)
  - Report generation with proper structure
  - Google Docs integration for saving reports

### Financial Agent
- **Name**: `financial` (Financial Agent)
- **Model**: `gemini-2.5-pro`
- **Capabilities**:
  - Personal finance advice
  - Budgeting strategies
  - Expense tracking guidance
  - Financial concepts explanation

### Stock Market Agent
- **Name**: `stock-market`
- **Capabilities**:
  - Stock price queries
  - Company fundamentals
  - Market news analysis

---

## 🛠️ Tools System

### Stock Market Tools
1. **get_stock_price** - Get current stock prices
2. **get_company_info** - Get company fundamentals and information
3. **get_financial_news** - Fetch financial and market news

### Vision Tools
1. **analyze_image** - Custom image analysis with prompts
2. **extract_text_from_image** - OCR text extraction
3. **describe_image** - Scene and image descriptions

### Search Tools (Exa Integration)
1. **web_search** - Quick web search queries
2. **find_similar_pages** - Find related content
3. **get_page_content** - Read full article content
4. **deep_research** - Comprehensive multi-source research
   - Quick mode: 3 searches, 5-10 sources
   - Standard mode: 5 searches, 10-15 sources
   - Comprehensive mode: 8 searches, 15-20 sources

---

## 📱 Connected Apps (OAuth2 Integrations)

### Gmail Integration
- **OAuth2 Authentication** with Google
- **Tools Available**:
  - `send_email` - Send emails via Gmail
  - `read_emails` - Read inbox messages
  - `search_emails` - Search emails with queries

### Google Calendar Integration
- **OAuth2 Authentication** with Google
- **Tools Available**:
  - `create_calendar_event` - Create calendar events
  - `list_calendar_events` - List upcoming events

### Google Docs Integration
- **OAuth2 Authentication** with Google
- **Tools Available**:
  - `create_google_doc` - Create new documents
  - `read_google_doc` - Read document content

---

## 💬 Chat System

### Backend Features
- **Chat Creation** - Automatic thread creation with LangGraph
- **Message Persistence** - PostgreSQL storage via Prisma
- **Agent Selection** - Route to appropriate agent based on type
- **Memory Management** - LangGraph checkpointer for conversation history
- **Tool Execution** - Dynamic tool calling with user context

### Frontend Features
- **Chat Interface** - Modern chat UI with message bubbles
- **Message History** - Scrollable message list with auto-scroll
- **Typing Indicators** - Loading states during AI response
- **Image Upload** - Upload and analyze images in chat
- **Keyboard Shortcuts** - Enter to send, Shift+Enter for newline
- **Error Handling** - Toast notifications for errors

### Chat Management
- **Chat History** - Sidebar with all user chats
- **Chat Deletion** - Delete individual conversations
- **Chat Title Update** - Rename conversations
- **New Chat Creation** - Start fresh conversations

---

## 📂 File Upload System

### Image Upload & Analysis
- **Upload and Analyze** (`POST /api/upload/analyze`)
  - Custom prompt-based image analysis
  
- **Upload and Extract Text** (`POST /api/upload/extract-text`)
  - OCR text extraction from images
  
- **Upload and Describe** (`POST /api/upload/describe`)
  - Automatic scene description

---

## 🎨 Frontend UI/UX

### Landing Page
- Navigation bar with logo
- Hero section
- Features showcase
- Experience section
- Technology stack display
- Call-to-action section
- Footer

### Dashboard Layout
- **Collapsible Sidebar**
  - Kuma logo and branding
  - New chat button
  - Search functionality
  - Chat history list
  - Navigation menu (Apps, Prompts, Drive, Memories)
  - User profile dropdown with logout

- **Main Content Area**
  - Chat interface
  - Apps management page
  - Placeholder sections for future features

### Apps Page
- Available apps grid display
- Connected apps list
- OAuth connection flow
- App status indicators
- Disconnect functionality

### UI Components (shadcn/ui)
- Buttons, Badges, Cards
- Dropdown menus
- Sidebar components
- Toast notifications (Sonner)
- Form inputs and textareas

---

## 🗄️ Database Schema (PostgreSQL + Prisma)

### Models
1. **User** - User accounts with email/password
2. **Chat** - Chat conversations with thread IDs
3. **Message** - Individual messages with role/content
4. **Agent** - Agent configurations (metadata)
5. **Tool** - Tool definitions (metadata)
6. **UserTool** - User-specific tool credentials
7. **App** - Available app integrations
8. **UserApp** - User-connected app credentials

---

## 🔧 Technical Stack

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **AI Framework**: LangChain with LangGraph
- **LLM**: Google Gemini (2.0-flash, 2.5-pro)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt
- **Encryption**: AES-256 for credential storage
- **Search API**: Exa.js for web search

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast)
- **Icons**: Lucide React

---

## 📍 API Endpoints Summary

### Auth Routes (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - Authenticate user
- `GET /me` - Get current user
- `POST /logout` - Logout user

### Chat Routes (`/api/chat`)
- `POST /` - Send message
- `GET /` - Get all chats
- `GET /:id` - Get specific chat
- `DELETE /:id` - Delete chat
- `PATCH /:id` - Update chat title

### Apps Routes (`/api/apps`)
- `GET /` - Get available apps
- `GET /connected` - Get connected apps
- `GET /:appName/connect` - Initiate OAuth
- `GET /:appName/callback` - OAuth callback
- `DELETE /:appName` - Disconnect app

### Upload Routes (`/api/upload`)
- `POST /analyze` - Upload and analyze image
- `POST /extract-text` - Upload and OCR
- `POST /describe` - Upload and describe

### Agents Routes (`/api/agents`)
- Agent management endpoints

### Health Check
- `GET /api/health` - Server health status

---

## 🚧 Placeholder/Future Features

These sections exist in the UI but are not yet implemented:
- **Prompts** - Prompt library management
- **Drive** - File and document storage
- **Memories** - Conversation memory management
