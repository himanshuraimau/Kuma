# Kuma AI - Frontend Documentation

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Routing](#routing)
5. [State Management](#state-management)
6. [API Layer](#api-layer)
7. [Components](#components)
8. [Authentication](#authentication)
9. [Chat Interface](#chat-interface)
10. [App Integrations](#app-integrations)
11. [Documents (RAG)](#documents-rag)
12. [Memories](#memories)
13. [Voice Features](#voice-features)
14. [UI Components](#ui-components)
15. [Styling](#styling)
16. [Environment Variables](#environment-variables)
17. [Running the Frontend](#running-the-frontend)

---

## Overview

Kuma AI Frontend is a modern React application built with TypeScript and Vite. It provides:

- **Beautiful landing page** with modern design
- **Chat interface** with real-time streaming
- **Multimodal support** (text, images, documents)
- **App integrations** management (Google, GitHub)
- **Document upload** and RAG querying
- **Memory management** UI
- **Voice input/output** capabilities
- **Dark theme** with orange accent colors

---

## Project Structure

```
frontend/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── components.json         # shadcn/ui configuration
├── public/                 # Static assets
│   ├── hero.png
│   ├── kuma Logo.png
│   ├── landing1.png
│   ├── landing2.png
│   ├── landing3.png
│   └── opengraph.png
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Main app with routing
│   ├── index.css           # Global styles
│   ├── api/                # API client layer
│   │   ├── client.ts       # Axios instance
│   │   ├── auth.api.ts     # Auth endpoints
│   │   ├── chat.api.ts     # Chat endpoints
│   │   ├── apps.api.ts     # Apps endpoints
│   │   ├── documents.api.ts # Documents endpoints
│   │   ├── memory.api.ts   # Memory endpoints
│   │   └── upload.api.ts   # Upload endpoints
│   ├── stores/             # Zustand state stores
│   │   ├── auth.store.ts   # Authentication state
│   │   ├── chat.store.ts   # Chat state
│   │   ├── apps.store.ts   # Apps state
│   │   ├── documents.store.ts # Documents state
│   │   ├── memory.store.ts # Memory state
│   │   └── user.store.ts   # User state
│   ├── components/
│   │   ├── landing/        # Landing page components
│   │   │   ├── Navigation.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── TechnologySection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   └── Footer.tsx
│   │   ├── auth/           # Authentication components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AuthForm.tsx
│   │   ├── dashboard/      # Dashboard components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatHistory.tsx
│   │   │   └── PlaceholderSection.tsx
│   │   ├── chat/           # Chat components
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── MessageContent.tsx
│   │   │   └── ToolCallIndicator.tsx
│   │   ├── apps/           # Apps components
│   │   │   ├── AppsPage.tsx
│   │   │   ├── AppCard.tsx
│   │   │   └── ConnectedAppsList.tsx
│   │   ├── documents/      # Documents components
│   │   │   ├── DocumentsPage.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   └── DocumentCard.tsx
│   │   ├── memories/       # Memories components
│   │   │   ├── MemoriesPage.tsx
│   │   │   ├── MemoryCard.tsx
│   │   │   ├── AddMemoryDialog.tsx
│   │   │   └── types.ts
│   │   ├── voice/          # Voice components
│   │   │   ├── VoiceControl.tsx
│   │   │   ├── LiveVoiceModal.tsx
│   │   │   └── VoiceButton.tsx
│   │   └── ui/             # UI primitives (shadcn)
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── separator.tsx
│   │       ├── sidebar.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── tooltip.tsx
│   │       └── ...
│   ├── hooks/              # Custom React hooks
│   │   └── use-mobile.ts   # Mobile detection hook
│   ├── lib/                # Utility libraries
│   │   ├── utils.ts        # General utilities (cn)
│   │   ├── livekit.ts      # LiveKit configuration
│   │   ├── password.ts     # Password utilities
│   │   └── validation.ts   # Validation schemas
│   └── types/              # TypeScript types
│       ├── api.types.ts    # API response types
│       ├── apps.types.ts   # Apps types
│       ├── auth.types.ts   # Auth types
│       ├── memory.types.ts # Memory types
│       └── user.types.ts   # User types
└── dist/                   # Build output
```

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Build Tool | Vite |
| Language | TypeScript |
| Routing | React Router v7 |
| State Management | Zustand |
| HTTP Client | Axios |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Markdown | react-markdown |
| Toasts | Sonner |
| Voice | VAD (Voice Activity Detection), LiveKit |

### Key Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.9.6",
  "zustand": "^5.0.8",
  "axios": "^1.13.2",
  "tailwindcss": "^4.1.17",
  "react-hook-form": "^7.66.1",
  "zod": "^3.23.8",
  "react-markdown": "^10.1.0",
  "lucide-react": "^0.554.0",
  "sonner": "^2.0.7",
  "@radix-ui/react-dialog": "Radix UI primitives",
  "@livekit/components-react": "^2.9.17",
  "@ricky0123/vad-react": "^0.0.36"
}
```

---

## Routing

### Route Configuration (`App.tsx`)

```tsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />

  {/* Protected Dashboard Routes */}
  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
    <Route path="/chat" element={<ChatInterface />} />
    <Route path="/chat/:id" element={<ChatInterface />} />
    <Route path="/apps" element={<AppsPage />} />
    <Route path="/documents" element={<DocumentsPage />} />
    <Route path="/memories" element={<MemoriesPage />} />
    <Route path="/prompts" element={<PlaceholderSection />} />
    <Route path="/drive" element={<PlaceholderSection />} />
  </Route>
</Routes>
```

### Route Summary

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/` | LandingPage | No | Marketing landing page |
| `/login` | LoginPage | No | User login |
| `/signup` | SignupPage | No | User registration |
| `/chat` | ChatInterface | Yes | New chat |
| `/chat/:id` | ChatInterface | Yes | Existing chat |
| `/apps` | AppsPage | Yes | App integrations |
| `/documents` | DocumentsPage | Yes | PDF management |
| `/memories` | MemoriesPage | Yes | Memory management |

---

## State Management

### Zustand Stores

#### Auth Store (`stores/auth.store.ts`)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}
```

**Features:**
- Persists token in localStorage
- Auto-validates token on page load
- Handles 401 responses globally

#### Chat Store (`stores/chat.store.ts`)

```typescript
interface ChatState {
  currentChatId: string | null;
  currentMessages: Message[];
  chats: Chat[];
  isLoading: boolean;
  isSending: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  
  sendMessageStreaming: (message, agentType?, images?, documentIds?) => Promise<void>;
  sendMessage: (message, agentType?) => Promise<void>;
  loadChats: () => Promise<void>;
  loadChat: (chatId) => Promise<void>;
  deleteChat: (chatId) => Promise<void>;
  updateChatTitle: (chatId, title) => Promise<void>;
  createNewChat: () => void;
  setCurrentChat: (chatId) => void;
  startPolling: () => void;
  stopPolling: () => void;
}
```

**Features:**
- Optimistic UI updates
- SSE streaming handling
- Polling fallback for Redis queue mode
- Image/document attachment support

#### Apps Store (`stores/apps.store.ts`)

```typescript
interface AppsState {
  apps: App[];
  connectedApps: ConnectedApp[];
  tools: Tool[];
  isLoading: boolean;
  error: string | null;
  
  loadApps: () => Promise<void>;
  loadConnectedApps: () => Promise<void>;
  loadTools: () => Promise<void>;
  connectApp: (appName) => Promise<void>;
  disconnectApp: (appName) => Promise<void>;
}
```

#### Documents Store (`stores/documents.store.ts`)

```typescript
interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  
  fetchDocuments: () => Promise<void>;
  deleteDocument: (id) => Promise<void>;
}
```

#### Memory Store (`stores/memory.store.ts`)

```typescript
interface MemoryState {
  memories: Memory[];
  searchResults: Memory[];
  searchQuery: string;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  
  loadMemories: () => Promise<void>;
  searchMemories: (query) => Promise<void>;
  addMemory: (content) => Promise<void>;
  deleteMemory: (id) => Promise<void>;
  clearSearch: () => void;
}
```

---

## API Layer

### API Client (`api/client.ts`)

```typescript
// Axios instance with base URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Request interceptor - attach JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Modules

#### Auth API (`api/auth.api.ts`)

```typescript
login(data: LoginFormData): Promise<AuthResponse>
register(data: SignupFormData): Promise<AuthResponse>
getCurrentUser(): Promise<{ user: User }>
logout(): Promise<void>
```

#### Chat API (`api/chat.api.ts`)

```typescript
// Streaming message with SSE
streamMessage(data, callbacks: StreamCallbacks): Promise<void>

// Callbacks:
interface StreamCallbacks {
  onChatId?: (chatId: string) => void;
  onJobId?: (jobId: string) => void;
  onStatus?: (status: string) => void;
  onChunk?: (content: string) => void;
  onToolCall?: (toolName: string, args: object) => void;
  onToolResult?: (toolName: string, success: boolean) => void;
  onDone?: (fullResponse: string) => void;
  onError?: (error: string) => void;
}

// Other endpoints
sendMessage(data): Promise<SendMessageResponse>
getChats(): Promise<GetChatsResponse>
getChat(chatId): Promise<GetChatResponse>
deleteChat(chatId): Promise<void>
updateChatTitle(chatId, data): Promise<UpdateChatTitleResponse>
```

#### Apps API (`api/apps.api.ts`)

```typescript
getApps(): Promise<{ apps: App[] }>
getConnectedApps(): Promise<{ apps: ConnectedApp[] }>
getAvailableTools(): Promise<{ tools: Tool[] }>
connectApp(appName): Promise<{ authUrl: string }>
disconnectApp(appName): Promise<void>
```

#### Documents API (`api/documents.api.ts`)

```typescript
uploadDocument(file: File, chatId?): Promise<UploadResult>
listDocuments(chatId?): Promise<Document[]>
getDocument(id): Promise<Document>
deleteDocument(id): Promise<void>
queryDocument(id, question): Promise<QueryResult>
summarizeDocument(id): Promise<{ summary: string }>
```

#### Memory API (`api/memory.api.ts`)

```typescript
addMemory(content, metadata?): Promise<Memory>
listMemories(page?, limit?): Promise<MemoriesResponse>
searchMemories(query, limit?): Promise<Memory[]>
getMemory(id): Promise<Memory>
deleteMemory(id): Promise<void>
updateMemory(id, content): Promise<Memory>
```

---

## Components

### Landing Page Components

#### Navigation (`components/landing/Navigation.tsx`)

- Fixed header with glass effect
- Logo and nav links
- Login/Signup buttons
- Mobile responsive

#### HeroSection (`components/landing/HeroSection.tsx`)

- Large headline with gradient text
- Animated background effects
- CTA buttons
- Hero image

#### FeaturesSection (`components/landing/FeaturesSection.tsx`)

- Feature cards grid
- Icon illustrations
- Hover effects

#### ExperienceSection (`components/landing/ExperienceSection.tsx`)

- Product screenshots
- Feature highlights

#### TechnologySection (`components/landing/TechnologySection.tsx`)

- Tech stack showcase
- Integration logos

#### CTASection (`components/landing/CTASection.tsx`)

- Final call-to-action
- Sign up prompt

#### Footer (`components/landing/Footer.tsx`)

- Links and copyright
- Social links

### Auth Components

#### LoginPage (`components/auth/LoginPage.tsx`)

- Email/password form
- Form validation with Zod
- Error handling
- Redirect on success

#### SignupPage (`components/auth/SignupPage.tsx`)

- Name/email/password form
- Password confirmation
- Terms checkbox
- Validation

#### ProtectedRoute (`components/auth/ProtectedRoute.tsx`)

```tsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};
```

### Dashboard Components

#### DashboardLayout (`components/dashboard/DashboardLayout.tsx`)

```tsx
<SidebarProvider>
  <DashboardSidebar />
  <SidebarInset>
    <main>
      <Outlet />  {/* Child routes render here */}
    </main>
  </SidebarInset>
</SidebarProvider>
```

#### DashboardSidebar (`components/dashboard/DashboardSidebar.tsx`)

- Logo and branding
- Navigation links (Chat, Apps, Documents, Memories)
- Chat history list
- New chat button
- User profile section
- Logout button

### Chat Components

#### ChatInterface (`components/dashboard/ChatInterface.tsx`)

Main chat view with:
- **Header**: Notifications button
- **Message area**: Scrollable message list
- **Empty state**: Hero with connected apps
- **Input area**:
  - Textarea for message
  - Image attachment button
  - Document picker
  - PDF upload button
  - Voice control
  - Send button

**Features:**
- Auto-resize textarea
- Image preview grid
- Document attachment chips
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Loading states

#### MessageList (`components/chat/MessageList.tsx`)

```tsx
<div className="space-y-6">
  {messages.map((message) => (
    <MessageItem key={message.id} message={message} />
  ))}
  {isLoading && <LoadingIndicator />}
</div>
```

#### MessageItem (`components/chat/MessageItem.tsx`)

- User message: Right-aligned, orange accent
- Assistant message: Left-aligned, neutral
- Avatar icons
- Timestamp
- Image attachments display
- Document attachments display

#### MessageContent (`components/chat/MessageContent.tsx`)

- Markdown rendering with react-markdown
- Code syntax highlighting
- Link handling
- Image rendering

### Apps Components

#### AppsPage (`components/apps/AppsPage.tsx`)

- Header with title
- Success/error banners
- Connected apps section
- Available apps grid
- How it works section

#### AppCard (`components/apps/AppCard.tsx`)

```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
  <div className="flex items-center gap-3">
    <span className="text-3xl">{app.icon}</span>
    <div>
      <h3>{app.displayName}</h3>
      <p>{app.description}</p>
    </div>
  </div>
  <Button onClick={isConnected ? disconnect : connect}>
    {isConnected ? 'Disconnect' : 'Connect'}
  </Button>
</div>
```

#### ConnectedAppsList (`components/apps/ConnectedAppsList.tsx`)

- Horizontal scrollable list
- App badges with icons
- Quick disconnect

### Documents Components

#### DocumentsPage (`components/documents/DocumentsPage.tsx`)

- Upload section
- Documents list
- Loading state

#### DocumentUpload (`components/documents/DocumentUpload.tsx`)

- Drag and drop zone
- File input
- Upload progress
- Max 50MB limit

#### DocumentList (`components/documents/DocumentList.tsx`)

- Grid of document cards
- Empty state
- Refresh callback

#### DocumentCard (`components/documents/DocumentCard.tsx`)

- Document preview
- Status indicator
- Delete button
- Open in chat action

### Memories Components

#### MemoriesPage (`components/memories/MemoriesPage.tsx`)

- Search bar
- Add memory button
- Memory cards list
- Empty state

#### MemoryCard (`components/memories/MemoryCard.tsx`)

- Memory content
- Created date
- Delete button

#### AddMemoryDialog (`components/memories/AddMemoryDialog.tsx`)

- Modal dialog
- Text input
- Save/cancel buttons

### Voice Components

#### VoiceControl (`components/voice/VoiceControl.tsx`)

- Microphone button
- Voice activity detection
- Recording indicator
- Transcription display

#### LiveVoiceModal (`components/voice/LiveVoiceModal.tsx`)

- Full-screen voice chat
- Real-time audio
- LiveKit integration
- Waveform visualization

---

## Authentication

### Login Flow

1. User enters email/password
2. Form validated with Zod
3. API call to `/api/auth/login`
4. Token stored in localStorage
5. User redirected to `/chat`

### Token Management

```typescript
// Store token
localStorage.setItem('auth_token', token);
localStorage.setItem('auth_user', JSON.stringify(user));

// Retrieve for requests
const token = localStorage.getItem('auth_token');

// Clear on logout
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
```

### Protected Routes

```tsx
// ProtectedRoute wrapper
<Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  <Route path="/chat" element={<ChatInterface />} />
  ...
</Route>
```

### Auto-Auth Check

On app load, `checkAuth()` is called to:
1. Check for existing token
2. Validate with `/api/auth/me`
3. Update auth state

---

## Chat Interface

### Message Flow

1. **User types message** in textarea
2. **Optional attachments**: images, documents
3. **Send button** clicked (or Enter key)
4. **Optimistic update**: Message added to UI immediately
5. **API call**: `streamMessage()` with SSE
6. **Streaming**: Chunks received and displayed
7. **Completion**: Final message saved to state

### Streaming Implementation

```typescript
// SSE parsing
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      
      switch (data.type) {
        case 'chunk':
          callbacks.onChunk(data.content);
          break;
        case 'tool_call':
          callbacks.onToolCall(data.toolName, data.args);
          break;
        case 'done':
          callbacks.onDone(data.fullResponse);
          break;
      }
    }
  }
}
```

### Multimodal Support

#### Image Attachments

- Max 5 images per message
- Preview thumbnails shown
- Sent as FormData with `images` field
- Stored in chat folder on server

#### Document Attachments

- Select from uploaded documents
- Or upload new PDF inline
- Document IDs sent with message
- RAG context included in AI prompt

---

## App Integrations

### OAuth Flow (Frontend Perspective)

1. User clicks "Connect" on app card
2. Frontend calls `/api/apps/:appName/connect`
3. Receives OAuth URL
4. Opens OAuth URL (redirect)
5. User authorizes in provider
6. Redirected back to `/apps?success=true&app=appName`
7. Success message shown
8. Apps list refreshed

### Connected Apps Display

```tsx
// Show in chat interface empty state
{connectedApps.map(app => (
  <Badge>
    <span>{app.icon}</span>
    {app.displayName}
  </Badge>
))}
```

---

## Documents (RAG)

### Upload Flow

1. User selects PDF file
2. `uploadDocument()` called
3. File sent as FormData
4. Server extracts text
5. Document appears in list

### Chat Integration

1. User attaches document to message
2. Document ID included in request
3. Server loads extracted text
4. AI has document context
5. Response based on document content

---

## Memories

### Memory Display

- Cards with content preview
- Creation date
- Delete action

### Search

- Semantic search across memories
- Results filtered in real-time
- Clear search to show all

### Add Memory

- Dialog with textarea
- Save stores via API
- List refreshed

---

## Voice Features

### Voice-to-Text (VoiceControl)

Using VAD (Voice Activity Detection):

```tsx
const { listening, start, stop } = useMicVAD({
  onSpeechEnd: async (audio) => {
    // Send to transcription API
    const transcript = await transcribe(audio);
    onTranscript(transcript);
  },
});
```

### Live Voice (LiveVoiceModal)

Using LiveKit for real-time audio:

```tsx
<LiveKitRoom
  serverUrl={LIVEKIT_URL}
  token={token}
  audio={true}
>
  <AudioRenderer />
  <ControlBar />
</LiveKitRoom>
```

---

## UI Components

### shadcn/ui Components

Built on Radix UI primitives:

| Component | Usage |
|-----------|-------|
| Button | Primary actions |
| Badge | Status indicators |
| Dialog | Modals |
| DropdownMenu | Context menus |
| Input | Form inputs |
| Label | Form labels |
| Separator | Visual dividers |
| Sidebar | Navigation panel |
| Sheet | Slide-over panels |
| Skeleton | Loading states |
| Tooltip | Hover hints |

### Custom Components

| Component | Purpose |
|-----------|---------|
| MessageList | Chat messages display |
| AppCard | App integration card |
| MemoryCard | Memory item display |
| DocumentCard | Document preview |
| VoiceControl | Voice input button |

---

## Styling

### Tailwind CSS v4

Using new Tailwind v4 with Vite plugin:

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [tailwindcss()],
};
```

### Color Scheme

| Color | Usage | Value |
|-------|-------|-------|
| Background | Page background | zinc-950 |
| Surface | Cards, panels | zinc-900 |
| Border | Subtle borders | zinc-800/white-5% |
| Text Primary | Main text | zinc-100 |
| Text Secondary | Muted text | zinc-400 |
| Accent | Primary actions | orange-500 |
| Accent Hover | Hover states | orange-600 |

### Design Patterns

1. **Glass morphism**: Transparent backgrounds with blur
2. **Gradient accents**: Orange to amber gradients
3. **Rounded corners**: 2xl (1rem) for cards
4. **Subtle animations**: Fade in, slide up
5. **Dark theme**: Consistent zinc palette

### CSS Classes Example

```tsx
// Card pattern
className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 
           hover:border-zinc-700 transition-colors"

// Button pattern  
className="bg-orange-500 hover:bg-orange-600 text-white 
           rounded-full px-6 py-3 font-medium transition-all"

// Input pattern
className="bg-zinc-900 border border-zinc-800 rounded-lg 
           text-zinc-100 placeholder:text-zinc-500 
           focus:border-orange-500 transition-colors"
```

---

## Environment Variables

```bash
# API URL
VITE_API_URL=http://localhost:3001/api

# LiveKit (for voice)
VITE_LIVEKIT_URL=wss://your-livekit-server.com
```

Create `.env` file in frontend directory:

```bash
VITE_API_URL=http://localhost:3001/api
```

---

## Running the Frontend

### Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Opens at http://localhost:5173
```

### Production Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Linting

```bash
# Run ESLint
bun run lint
```

---

## Best Practices

### State Management

- Use Zustand stores for global state
- Keep component state local when possible
- Clear errors on user action

### API Calls

- Handle loading states
- Show error messages
- Optimistic updates for better UX

### Performance

- Lazy load routes
- Memoize expensive computations
- Use virtualization for long lists

### Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals

---

## Docker Deployment

### Dockerfile Overview

The frontend uses a multi-stage Dockerfile with NGINX for production:

```dockerfile
# Stage 1: Dependencies
FROM oven/bun:1.1-alpine AS deps
# Install all dependencies

# Stage 2: Builder
FROM oven/bun:1.1-alpine AS builder
# Build the Vite application with env vars

# Stage 3: Production (NGINX)
FROM nginx:alpine AS production
# Serve static files with NGINX
```

### Dockerfile Location

- **Frontend**: `frontend/Dockerfile`
- **NGINX Config**: `frontend/nginx.conf`

### Build Arguments

The Dockerfile accepts build-time arguments for environment variables:

```dockerfile
ARG VITE_API_URL=http://localhost:3001/api
ARG VITE_LIVEKIT_URL
```

### Building the Frontend Image

```bash
# Build with default API URL
docker build -t kuma-frontend ./frontend

# Build with custom API URL
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  --build-arg VITE_LIVEKIT_URL=wss://livekit.yourdomain.com \
  -t kuma-frontend \
  ./frontend
```

### Running with Docker

```bash
# Run frontend container
docker run -d \
  --name kuma-frontend \
  -p 80:80 \
  kuma-frontend
```

### NGINX Configuration

The `nginx.conf` includes:

1. **Gzip Compression**: Compresses responses for faster loading
2. **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
3. **Static Asset Caching**: 1-year cache for immutable assets
4. **SPA Routing**: Redirects all routes to index.html
5. **Health Check Endpoint**: `/health` for container monitoring

```nginx
# SPA routing
location / {
    try_files $uri $uri/ /index.html;
}

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Docker Compose

Using Docker Compose (recommended):

```bash
# Start frontend with all services
docker-compose up -d frontend

# Rebuild after changes
docker-compose up -d --build frontend

# View logs
docker-compose logs -f frontend
```

### Health Checks

The Dockerfile includes health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1
```

### Development with Docker

For development with hot reload:

```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up -d frontend

# Frontend available at http://localhost:5173
```

The development configuration mounts source files for Vite HMR (Hot Module Replacement).

---

## Error Handling

### API Errors

```typescript
try {
  await api.someAction();
} catch (error) {
  if (error.response?.status === 401) {
    // Handled by interceptor
  } else {
    toast.error('Action failed');
  }
}
```

### UI Error States

```tsx
{error && (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
    <AlertCircle className="text-red-400" />
    <p className="text-red-400">{error}</p>
    <button onClick={clearError}>×</button>
  </div>
)}
```

---

This documentation covers the frontend architecture and implementation. For component-specific details, refer to the source code in the respective files.

