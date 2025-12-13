# Frontend Documentation

Complete guide to the Kuma frontend architecture, components, and development.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Routing](#routing)
- [Components](#components)
- [API Integration](#api-integration)
- [Development Guide](#development-guide)

## Architecture Overview

The Kuma frontend is a modern React application built with Vite, featuring a component-based architecture with centralized state management using Zustand.

### Key Features

1. **Landing Page** - Marketing site with feature showcase
2. **Authentication** - Signup/Login with JWT
3. **Chat Interface** - Real-time AI chat with streaming responses
4. **App Management** - Connect and manage third-party apps
5. **Document Management** - Upload and manage PDF documents
6. **Memory Management** - View and search saved memories

### Design Principles

- **Component Composition** - Reusable UI components
- **State Management** - Zustand for global state
- **Type Safety** - TypeScript throughout
- **Responsive Design** - Mobile-first with TailwindCSS
- **Accessibility** - Radix UI primitives for a11y

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI library |
| Vite | 7.2.2 | Build tool & dev server |
| TypeScript | 5.9.3 | Type safety |
| React Router | 7.9.6 | Client-side routing |
| Zustand | 5.0.8 | State management |
| TailwindCSS | 4.1.17 | Styling |
| Radix UI | Latest | Accessible components |
| Axios | 1.13.2 | HTTP client |
| React Hook Form | 7.66.1 | Form handling |
| Zod | 4.1.12 | Schema validation |
| React Markdown | 10.1.0 | Markdown rendering |
| Lucide React | 0.554.0 | Icons |
| Sonner | 2.0.7 | Toast notifications |

## Project Structure

```
frontend/
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # TailwindCSS config
├── tsconfig.json           # TypeScript config
├── public/                 # Static assets
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Main app component & routing
    ├── index.css           # Global styles
    ├── api/                # API client functions
    │   ├── client.ts       # Axios instance
    │   ├── auth.api.ts     # Auth endpoints
    │   ├── chat.api.ts     # Chat endpoints
    │   ├── apps.api.ts     # Apps endpoints
    │   ├── documents.api.ts # Documents endpoints
    │   ├── memory.api.ts   # Memory endpoints
    │   └── upload.api.ts   # Upload endpoints
    ├── components/         # React components
    │   ├── ui/             # Reusable UI components (buttons, dialogs, etc.)
    │   ├── landing/        # Landing page components
    │   ├── auth/           # Auth pages (login, signup)
    │   ├── dashboard/      # Dashboard layout & chat
    │   ├── chat/           # Chat UI components
    │   ├── apps/           # App management
    │   ├── documents/      # Document management
    │   └── memories/       # Memory management
    ├── stores/             # Zustand stores
    │   ├── auth.store.ts   # User & auth state
    │   ├── chat.store.ts   # Chat state
    │   ├── apps.store.ts   # Apps state
    │   ├── documents.store.ts # Documents state
    │   ├── memory.store.ts # Memory state
    │   └── user.store.ts   # User preferences
    ├── types/              # TypeScript types
    ├── hooks/              # Custom React hooks
    └── lib/                # Utilities
        └── utils.ts        # Helper functions
```

## State Management

Kuma uses **Zustand** for simple, performant state management.

### Store Architecture

Each feature has its own store with clear responsibilities:

#### Auth Store (`auth.store.ts`)

Manages authentication state and user session.

```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

// Usage
const { user, login, logout } = useAuthStore();
```

**Key Methods:**
- `login(email, password)` - Authenticate user
- `signup(data)` - Create new account
- `logout()` - Clear session
- `loadFromStorage()` - Restore session from localStorage

#### Chat Store (`chat.store.ts`)

Manages chat conversations and messages.

```typescript
interface ChatStore {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  
  fetchChats: () => Promise<void>;
  fetchChat: (chatId: string) => Promise<void>;
  sendMessage: (message: string, options) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  setCurrentChat: (chat: Chat) => void;
}
```

**Key Methods:**
- `sendMessage(message, {chatId, files, documentIds})` - Send message with attachments
- `fetchChats()` - Load user's chat history
- `fetchChat(id)` - Load specific chat with messages
- `deleteChat(id)` - Delete chat

#### Apps Store (`apps.store.ts`)

Manages third-party app connections.

```typescript
interface AppsStore {
  apps: App[];
  connectedApps: UserApp[];
  isLoading: boolean;
  
  fetchApps: () => Promise<void>;
  fetchConnectedApps: () => Promise<void>;
  connectApp: (appName: string) => Promise<string>;
  disconnectApp: (appName: string) => Promise<void>;
}
```

#### Documents Store (`documents.store.ts`)

Manages uploaded PDF documents.

```typescript
interface DocumentsStore {
  documents: Document[];
  isLoading: boolean;
  
  fetchDocuments: () => Promise<void>;
  uploadDocuments: (files: File[], chatId?) => Promise<Document[]>;
  deleteDocument: (id: string) => Promise<void>;
}
```

#### Memory Store (`memory.store.ts`)

Manages long-term memories.

```typescript
interface MemoryStore {
  memories: Memory[];
  searchResults: Memory[];
  
  fetchMemories: () => Promise<void>;
  searchMemories: (query: string) => Promise<void>;
  addMemory: (content: string, metadata) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
}
```

### Store Best Practices

1. **Keep stores focused** - Each store manages one domain
2. **Async actions** - Use async/await in store methods
3. **Error handling** - Catch errors and show toast notifications
4. **Loading states** - Track loading for better UX
5. **Persist critical data** - Use localStorage for auth tokens

## Routing

Kuma uses **React Router v7** for navigation.

### Route Structure

```
/ - Landing page
/login - Login page
/signup - Signup page
/chat - Chat interface (protected)
/chat/:id - Specific chat (protected)
/apps - App management (protected)
/documents - Document management (protected)
/memories - Memory management (protected)
```

### Protected Routes

Protected routes require authentication:

```typescript
<Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  <Route path="/chat" element={<ChatInterface />} />
  <Route path="/chat/:id" element={<ChatInterface />} />
  {/* ... other protected routes */}
</Route>
```

`ProtectedRoute` component checks auth state and redirects to login if needed.

### Navigation

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/chat');
navigate(`/chat/${chatId}`);
```

## Components

### Component Organization

Components are organized by feature and reusability:

- **`ui/`** - Generic, reusable UI components (Button, Dialog, Input, etc.)
- **`landing/`** - Landing page specific components
- **`auth/`** - Authentication pages
- **`dashboard/`** - Dashboard layout and structure
- **`chat/`** - Chat interface components
- **`apps/`**, **`documents/`**, **`memories/`** - Feature-specific components

### Key Components

#### DashboardLayout

Main layout wrapper for authenticated pages.

```typescript
<DashboardLayout>
  {/* Sidebar with navigation */}
  {/* Main content area */}
  <Outlet /> {/* Nested routes render here */}
</DashboardLayout>
```

**Features:**
- Sidebar with chat history
- Navigation menu
- User profile dropdown
- Responsive (mobile drawer)

#### ChatInterface

Main chat component with streaming support.

```typescript
<ChatInterface />
```

**Features:**
- Message list with auto-scroll
- Input field with file attachments
- Streaming message rendering
- Image and document attachments
- Markdown rendering in messages
- Loading states

**Key Sub-components:**
- `MessageList` - Displays messages
- `MessageInput` - Input with file upload
- `MessageBubble` - Individual message rendering
- `StreamingMessage` - Animated streaming text

#### AppsPage

Manage third-party app connections.

```typescript
<AppsPage />
```

**Features:**
- Grid of available apps
- Connection status indicators
- OAuth flow initiation
- Disconnect functionality

#### DocumentsPage

Upload and manage PDF documents.

```typescript
<DocumentsPage />
```

**Features:**
- Drag-and-drop file upload
- Document list with metadata
- Processing status indicators
- Delete functionality
- Attach to chat

#### MemoriesPage

View and search saved memories.

```typescript
<MemoriesPage />
```

**Features:**
- Memory list
- Search functionality
- Add new memories
- Delete memories

### UI Components (Radix + TailwindCSS)

Located in `src/components/ui/`:

- **Button** - Customizable button with variants
- **Dialog** - Modal dialogs
- **DropdownMenu** - Dropdown menus
- **Input** - Form inputs
- **Label** - Form labels
- **Separator** - Visual dividers
- **Tooltip** - Hover tooltips

**Example Usage:**

```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>Dialog Title</DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### Component Patterns

#### Loading States

```typescript
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin">⏳</div>
  </div>
) : (
  <ContentComponent />
)}
```

#### Error Handling

```typescript
import { toast } from 'sonner';

try {
  await someAsyncAction();
  toast.success('Success!');
} catch (error) {
  toast.error(error.message || 'Something went wrong');
}
```

#### Conditional Rendering

```typescript
{user ? <UserProfile user={user} /> : <LoginPrompt />}

{messages.length > 0 ? (
  <MessageList messages={messages} />
) : (
  <EmptyState message="No messages yet" />
)}
```

## API Integration

### API Client Setup

Centralized Axios instance in `src/api/client.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Functions

Each feature has dedicated API functions in `src/api/`:

#### Auth API (`auth.api.ts`)

```typescript
export const authApi = {
  signup: (data: SignupData) => 
    api.post('/api/auth/signup', data),
  
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
};
```

#### Chat API (`chat.api.ts`)

```typescript
export const chatApi = {
  // Get all chats
  getChats: () => api.get('/api/chat'),
  
  // Get specific chat
  getChat: (id: string) => api.get(`/api/chat/${id}`),
  
  // Send message (non-streaming)
  sendMessage: (data: MessageData) => 
    api.post('/api/chat', data),
  
  // Streaming handled separately with EventSource
  streamMessage: (data: MessageData, onEvent: EventHandler) => {
    // Create FormData for multipart
    const formData = new FormData();
    formData.append('message', data.message);
    if (data.chatId) formData.append('chatId', data.chatId);
    // ... handle streaming
  },
  
  deleteChat: (id: string) => api.delete(`/api/chat/${id}`),
  
  updateTitle: (id: string, title: string) =>
    api.patch(`/api/chat/${id}/title`, { title }),
};
```

#### Apps API (`apps.api.ts`)

```typescript
export const appsApi = {
  getApps: () => api.get('/api/apps'),
  getConnectedApps: () => api.get('/api/apps/connected'),
  connectApp: (appName: string) => 
    api.post('/api/apps/connect', { appName }),
  disconnectApp: (appName: string) => 
    api.delete(`/api/apps/${appName}`),
};
```

### Streaming Responses

Chat uses Server-Sent Events (SSE) for streaming:

```typescript
const streamMessage = async (message: string, chatId?: string) => {
  const formData = new FormData();
  formData.append('message', message);
  if (chatId) formData.append('chatId', chatId);
  
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        
        if (data.text) {
          // Append to streaming message
          updateStreamingMessage(data.text);
        }
      }
    }
  }
};
```

## Development Guide

### Setup

```bash
cd frontend
bun install
```

### Environment Variables

Create `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:3001
```

### Running Development Server

```bash
bun dev
```

App will run on http://localhost:5173

### Building for Production

```bash
bun build
```

Output in `dist/` folder.

### Preview Production Build

```bash
bun preview
```

### Creating New Components

Use the component template:

```typescript
// src/components/feature/MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
};
```

### Adding New Pages

1. **Create page component** in appropriate folder
2. **Add route** in `App.tsx`:

```typescript
import { MyPage } from '@/components/myfeature/MyPage';

<Route path="/my-page" element={<MyPage />} />
```

3. **Add navigation link** in sidebar or menu

### Styling Guidelines

Use TailwindCSS utility classes:

```typescript
// Layout
<div className="flex items-center justify-between p-4">

// Spacing
<div className="mt-4 mb-2 px-6">

// Typography
<h1 className="text-2xl font-bold text-gray-900">

// Colors
<div className="bg-blue-500 text-white">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Dark mode (if implemented)
<div className="bg-white dark:bg-gray-800">
```

### Form Handling

Use React Hook Form + Zod:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data: FormData) => {
    // Handle submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Toast Notifications

```typescript
import { toast } from 'sonner';

// Success
toast.success('Message sent successfully!');

// Error
toast.error('Failed to send message');

// Info
toast.info('Processing document...');

// With custom duration
toast.success('Saved!', { duration: 2000 });
```

### TypeScript Tips

1. **Use interfaces for props**
2. **Avoid `any`** - Use `unknown` and type guards
3. **Leverage type inference** - Let TS infer when possible
4. **Use generics** for reusable components
5. **Define API response types** in `src/types/`

### Performance Optimization

1. **Lazy load routes** with React.lazy
2. **Memoize expensive computations** with useMemo
3. **Prevent unnecessary re-renders** with React.memo
4. **Virtualize long lists** (react-window)
5. **Code split** large components
6. **Optimize images** - Use WebP, lazy loading

### Debugging

```typescript
// React DevTools - Inspect component tree and state

// Console logging
console.log('Debug:', variable);

// Network tab - Check API requests

// React Router - Check current location
import { useLocation } from 'react-router-dom';
const location = useLocation();
console.log('Current path:', location.pathname);

// Zustand DevTools
// Install zustand/middleware and add devtools
```

### Common Issues & Solutions

**Issue: API calls fail with 401**
- Check if token is in localStorage
- Verify token hasn't expired
- Check Authorization header is set

**Issue: Component not re-rendering**
- Ensure store updates are triggering properly
- Check if you're mutating state directly
- Use Zustand DevTools to inspect state changes

**Issue: Routing not working**
- Verify route paths match exactly
- Check if BrowserRouter is wrapping App
- Ensure links use React Router's Link/navigate

**Issue: Styles not applying**
- Check TailwindCSS class names are correct
- Verify Tailwind config includes all content paths
- Clear build cache and restart dev server

### Installing Shadcn/UI Components

Add new UI components using:

```bash
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add dialog
bunx --bun shadcn@latest add dropdown-menu
```

Components will be added to `src/components/ui/`.

### Global Styles

Global styles are defined in `src/index.css`. Use CSS variables for consistent theming:

```css
:root {
  --primary: #3b82f6;
  --secondary: #64748b;
  --accent: #f59e0b;
  --background: #ffffff;
  --foreground: #0f172a;
}
```

---

**Need help?** Check the main README or backend docs, or open an issue on GitHub.