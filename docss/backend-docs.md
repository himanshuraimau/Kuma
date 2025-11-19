# Kuma Backend Documentation

## Overview

The Kuma backend is built with modern technologies to provide a robust authentication system:

- **Bun Runtime**: Fast JavaScript runtime
- **Express.js**: Web framework
- **Supabase**: Authentication provider and PostgreSQL database
- **Prisma**: Type-safe ORM
- **TypeScript**: Type safety throughout

## Architecture

### Authentication Flow

The backend implements a dual-layer authentication approach:

1. **Supabase Auth Layer**: Handles user authentication and session management
2. **Prisma Database Layer**: Stores additional user data and application-specific information

### Key Components

#### Database (Prisma)
- **User Model**: Stores user information (id, email, name, password, timestamps)
- **PostgreSQL**: Hosted on Supabase
- **Schema Management**: Prisma migrations and schema push

#### Authentication Service (`src/lib/auth.ts`)
- `signUp()`: Register new users with Supabase and store in database
- `signIn()`: Authenticate users and generate JWT tokens
- `verifyToken()`: Validate JWT tokens
- `getUser()`: Retrieve user data from database
- `signOut()`: Invalidate Supabase sessions

#### Middleware
- **Authentication Middleware**: Verifies JWT tokens and attaches user to request
- **Error Handler**: Provides consistent error responses

#### API Routes
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - User logout (protected)
- `GET /api/health` - Health check

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: 7-day expiration
3. **Environment Variables**: Sensitive data stored in .env
4. **CORS**: Configured for frontend origin
5. **Input Validation**: Zod schemas for request validation

## Setup Instructions

### Prerequisites
- Bun installed
- Supabase account and project

### Steps

1. **Install dependencies**:
   ```bash
   cd backend
   bun install
   ```

2. **Configure Supabase**:
   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings → API
   - Get database URL from Settings → Database → Connection string

3. **Set environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Initialize database**:
   ```bash
   bun run db:generate
   bun run db:push
   ```

5. **Start server**:
   ```bash
   bun run dev
   ```

## Testing the API

### Using curl

**Signup**:
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Current User** (replace TOKEN with actual token from login):
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `JWT_SECRET` | Secret for JWT signing | Random string |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## Next Steps

- Add email verification
- Implement password reset
- Add refresh tokens
- Set up rate limiting
- Add API documentation (Swagger/OpenAPI)
- Implement role-based access control
- Add logging and monitoring