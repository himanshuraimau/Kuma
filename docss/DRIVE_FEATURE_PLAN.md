# Google Drive Integration Plan

## Overview

This document outlines the implementation plan for adding Google Drive as a new app integration in Kuma. The Drive feature will allow users to store, organize, and manage their personal documents including notes, research, and any important files.

---

## Current Architecture Analysis

### Backend Structure

The current app system follows a clean pattern:

1. **App Registry** (`backend/src/apps/base.app.ts`)
   - Central registry for all apps using `AppRegistry` class
   - Apps implement `BaseApp` interface

2. **App Classes** (`backend/src/apps/<app-name>/<app-name>.app.ts`)
   - Each app has its own folder with app configuration
   - Implements: `name`, `displayName`, `description`, `category`, `icon`, `authType`
   - Methods: `getAuthConfig()`, `initialize()`, `validateCredentials()`, `refreshCredentials()`

3. **App Registration** (`backend/src/apps/index.ts`)
   - All apps are imported and registered here
   - Current apps: Gmail, Calendar, Docs

4. **AI Tools** (`backend/src/lib/ai/tools/app.tools.ts`)
   - Each app has dedicated tools for AI agent interactions
   - Tools use `tool()` from AI SDK with Zod schemas
   - `loadUserAppTools()` loads tools based on connected apps

5. **Database Schema** (`backend/prisma/schema.prisma`)
   - `App` model: stores app metadata
   - `UserApp` model: stores user connections with encrypted credentials

6. **Seed Data** (`backend/prisma/seed.ts`)
   - Database seed for available apps

### Frontend Structure

1. **API Layer** (`frontend/src/api/apps.api.ts`)
   - `getApps()`, `getConnectedApps()`, `connectApp()`, `disconnectApp()`

2. **Types** (`frontend/src/types/apps.types.ts`)
   - Categories include: `'communication' | 'productivity' | 'development' | 'storage'`

3. **Store** (`frontend/src/stores/apps.store.ts`)
   - Zustand store for app state management

4. **Components** (`frontend/src/components/apps/`)
   - `AppsPage.tsx`: Main apps page
   - `AppCard.tsx`: Individual app card
   - `ConnectedAppsList.tsx`: List of connected apps

---

## Implementation Plan

### Phase 1: Backend - Drive App Class

#### 1.1 Create Drive App Configuration

**File:** `backend/src/apps/drive/drive.app.ts`

```typescript
import { google } from 'googleapis';
import type { BaseApp, OAuthConfig } from '../../types/apps.types';
import { GoogleOAuthProvider } from '../../lib/oauth/providers/google';

export class DriveApp implements BaseApp {
    name = 'drive';
    displayName = 'Google Drive';
    description = 'Store, organize, and access your documents and files';
    category = 'storage' as const;
    icon = '💾';  // or use Google Drive icon
    authType = 'oauth2' as const;

    getAuthConfig(): OAuthConfig {
        return {
            provider: 'google',
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive.metadata.readonly',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            redirectUri: `${process.env.BACKEND_URL}/api/apps/drive/callback`,
        };
    }

    async initialize(credentials: any): Promise<void> { /* ... */ }
    async validateCredentials(credentials: any): Promise<boolean> { /* ... */ }
    async refreshCredentials(credentials: any): Promise<any> { /* ... */ }
}
```

#### 1.2 Register Drive App

**File:** `backend/src/apps/index.ts`

```typescript
import { DriveApp } from './drive/drive.app';
// ... existing imports

appRegistry.register(new DriveApp());
```

#### 1.3 Add Seed Data

**File:** `backend/prisma/seed.ts`

Add Drive app to the seed file.

---

### Phase 2: Backend - Drive AI Tools

#### 2.1 Create Drive Tools

**File:** `backend/src/lib/ai/tools/app.tools.ts`

Add `createDriveTools(userId: string)` function with the following tools:

| Tool Name | Description | Use Case |
|-----------|-------------|----------|
| `listDriveFiles` | List files in Drive or a specific folder | Browse files, see recent documents |
| `searchDriveFiles` | Search files by name, type, or content | Find specific documents |
| `createDriveFolder` | Create a new folder | Organize documents |
| `uploadToDrive` | Upload a file/document to Drive | Save notes, reports |
| `downloadFromDrive` | Get file content | Read document content |
| `getDriveFileInfo` | Get file metadata | Check file details |
| `deleteDriveFile` | Delete a file | Clean up |
| `moveDriveFile` | Move file between folders | Organize |
| `shareDriveFile` | Share a file with others | Collaboration |

#### 2.2 Update Tool Loader

Update `loadUserAppTools()` to include Drive tools when connected.

---

### Phase 3: Database Updates

#### 3.1 Run Seed Script

After creating the Drive app, run the seed script to add the Drive app to the database:

```bash
npx prisma db seed
```

---

### Phase 4: Frontend Updates (Minimal)

The frontend already supports the `'storage'` category, so minimal changes are needed:

1. **AppCard.tsx** - Already handles `storage` category with orange color
2. **Types** - Already includes `'storage'` in category union

No frontend code changes required! The Drive app will automatically appear once:
- Backend app is registered
- Database is seeded
- User connects via OAuth

---

## Implementation Details

### Drive API Scopes

| Scope | Purpose |
|-------|---------|
| `drive` | Full access to Drive files |
| `drive.file` | Access to files created by the app |
| `drive.metadata.readonly` | Read file metadata |
| `userinfo.email` | Get user email for connection display |

### Drive Tools Implementation

```typescript
export function createDriveTools(userId: string) {
    const getDriveClient = async () => {
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId,
                app: { name: 'drive' },
                isConnected: true,
            },
        });

        if (!userApp) return null;

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        return google.drive({ version: 'v3', auth: oauth2Client });
    };

    return {
        listDriveFiles: tool({...}),
        searchDriveFiles: tool({...}),
        createDriveFolder: tool({...}),
        uploadToDrive: tool({...}),
        downloadFromDrive: tool({...}),
        getDriveFileInfo: tool({...}),
        deleteDriveFile: tool({...}),
        moveDriveFile: tool({...}),
        shareDriveFile: tool({...}),
    };
}
```

---

## File Changes Summary

### Backend (4 files to create/modify)

| File | Action | Description |
|------|--------|-------------|
| `backend/src/apps/drive/drive.app.ts` | **CREATE** | New Drive app class |
| `backend/src/apps/index.ts` | MODIFY | Register DriveApp |
| `backend/src/lib/ai/tools/app.tools.ts` | MODIFY | Add createDriveTools function |
| `backend/prisma/seed.ts` | MODIFY | Add Drive app seed data |
| `backend/src/controllers/apps.controller.ts` | MODIFY | Add drive tools to getAvailableTools |

### Frontend (0 files)

No changes needed - the frontend already supports the `'storage'` category.

---

## Task Checklist

### Backend Tasks
- [ ] Create `backend/src/apps/drive/drive.app.ts`
- [ ] Update `backend/src/apps/index.ts` to register DriveApp
- [ ] Update `backend/prisma/seed.ts` to add Drive app
- [ ] Create `createDriveTools()` in `backend/src/lib/ai/tools/app.tools.ts`
- [ ] Update `loadUserAppTools()` to include Drive tools
- [ ] Update `apps.controller.ts` to handle Drive tools in `getAvailableTools`

### Database Tasks
- [ ] Run database seed: `npx prisma db seed`

### Testing Tasks
- [ ] Test OAuth connection flow
- [ ] Test each Drive tool:
  - [ ] `listDriveFiles`
  - [ ] `searchDriveFiles`
  - [ ] `createDriveFolder`
  - [ ] `uploadToDrive`
  - [ ] `downloadFromDrive`
  - [ ] `getDriveFileInfo`
  - [ ] `deleteDriveFile`
  - [ ] `moveDriveFile`
  - [ ] `shareDriveFile`

---

## Tool Specifications

### 1. listDriveFiles

```typescript
listDriveFiles: tool({
    description: 'List files in Google Drive. Use to browse files and folders.',
    inputSchema: z.object({
        folderId: z.string().optional().describe('Folder ID to list (default: root)'),
        maxResults: z.number().default(20).describe('Maximum files to return'),
        fileType: z.enum(['all', 'folder', 'document', 'spreadsheet', 'presentation', 'image', 'pdf']).optional(),
    }),
    execute: async ({ folderId, maxResults, fileType }) => {
        // Implementation
    },
}),
```

### 2. searchDriveFiles

```typescript
searchDriveFiles: tool({
    description: 'Search for files in Google Drive by name or content.',
    inputSchema: z.object({
        query: z.string().describe('Search query'),
        maxResults: z.number().default(10),
        fileType: z.enum(['all', 'folder', 'document', 'spreadsheet', 'presentation', 'image', 'pdf']).optional(),
    }),
    execute: async ({ query, maxResults, fileType }) => {
        // Implementation
    },
}),
```

### 3. createDriveFolder

```typescript
createDriveFolder: tool({
    description: 'Create a new folder in Google Drive.',
    inputSchema: z.object({
        name: z.string().describe('Folder name'),
        parentFolderId: z.string().optional().describe('Parent folder ID (default: root)'),
    }),
    execute: async ({ name, parentFolderId }) => {
        // Implementation
    },
}),
```

### 4. uploadToDrive

```typescript
uploadToDrive: tool({
    description: 'Create/upload a document to Google Drive. Use when user wants to save notes, reports, or any text content.',
    inputSchema: z.object({
        name: z.string().describe('File name'),
        content: z.string().describe('File content (text)'),
        folderId: z.string().optional().describe('Destination folder ID'),
        mimeType: z.enum(['text/plain', 'application/vnd.google-apps.document']).default('text/plain'),
    }),
    execute: async ({ name, content, folderId, mimeType }) => {
        // Implementation
    },
}),
```

### 5. downloadFromDrive / getFileContent

```typescript
downloadFromDrive: tool({
    description: 'Read/download content from a Google Drive file.',
    inputSchema: z.object({
        fileId: z.string().describe('File ID to download'),
    }),
    execute: async ({ fileId }) => {
        // Implementation
    },
}),
```

### 6. getDriveFileInfo

```typescript
getDriveFileInfo: tool({
    description: 'Get detailed information about a file in Google Drive.',
    inputSchema: z.object({
        fileId: z.string().describe('File ID'),
    }),
    execute: async ({ fileId }) => {
        // Implementation
    },
}),
```

### 7. deleteDriveFile

```typescript
deleteDriveFile: tool({
    description: 'Delete a file from Google Drive. Use with caution.',
    inputSchema: z.object({
        fileId: z.string().describe('File ID to delete'),
    }),
    execute: async ({ fileId }) => {
        // Implementation
    },
}),
```

### 8. moveDriveFile

```typescript
moveDriveFile: tool({
    description: 'Move a file to a different folder in Google Drive.',
    inputSchema: z.object({
        fileId: z.string().describe('File ID to move'),
        newFolderId: z.string().describe('Destination folder ID'),
    }),
    execute: async ({ fileId, newFolderId }) => {
        // Implementation
    },
}),
```

### 9. shareDriveFile

```typescript
shareDriveFile: tool({
    description: 'Share a Google Drive file with another person.',
    inputSchema: z.object({
        fileId: z.string().describe('File ID to share'),
        email: z.string().describe('Email address to share with'),
        role: z.enum(['reader', 'writer', 'commenter']).default('reader'),
    }),
    execute: async ({ fileId, email, role }) => {
        // Implementation
    },
}),
```

---

## Integration with Memory/Supermemory

The Drive integration can work alongside the existing Supermemory service:

1. **Supermemory** - For quick AI-accessible memories (text-based, searchable)
2. **Google Drive** - For structured document storage with full file management

### Use Cases

| Use Case | Best Option |
|----------|-------------|
| Quick notes during chat | Supermemory |
| Long-form documents | Google Drive |
| Research organization | Google Drive (folders) |
| Context for AI conversations | Supermemory |
| File sharing with others | Google Drive |
| Structured file storage | Google Drive |

---

## Estimated Timeline

| Task | Time Estimate |
|------|---------------|
| Drive App Class | 30 mins |
| Drive AI Tools | 2-3 hours |
| Database Seed | 15 mins |
| Testing | 1-2 hours |
| **Total** | **4-6 hours** |

---

## Future Enhancements

1. **Folder-based Organization** - Create a dedicated "Kuma" folder for all app-generated content
2. **Auto-sync** - Sync important chat summaries to Drive
3. **Document Templates** - Pre-built templates for common use cases
4. **Bulk Operations** - Upload/download multiple files
5. **Drive Picker Integration** - Frontend UI for browsing Drive files
6. **Version History** - Access file revision history

---

## Notes

- The Google APIs client library (`googleapis`) is already installed and used for Gmail, Calendar, and Docs
- OAuth flow is already set up and working for Google services
- Frontend category styling for `'storage'` already exists (orange color)
- Encryption/decryption utilities are already in place for credentials
