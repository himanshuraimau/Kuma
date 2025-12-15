# kuma-ai Backend - Authentication API

Backend server for kuma-ai application with Supabase authentication and Prisma ORM.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Validation**: Zod
- **Password Hashing**: bcrypt
- **JWT**: jsonwebtoken

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your Supabase credentials:
- `DATABASE_URL`: Get from Supabase project settings → Database → Connection string (URI)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `JWT_SECRET`: Generate a random secret key

### 3. Set Up Database

Generate Prisma client and push schema to database:

```bash
bun run db:generate
bun run db:push
```

### 4. Start Development Server

```bash
bun run dev
```

Server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Authentication

#### Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User (Protected)
```bash
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

#### Logout (Protected)
```bash
POST /api/auth/logout
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts # Auth request handlers
│   ├── db/
│   │   └── prisma.ts          # Prisma client
│   ├── lib/
│   │   ├── auth.ts            # Auth service functions
│   │   ├── supabase.ts        # Supabase client
│   │   └── middleware/
│   │       ├── auth.middleware.ts   # JWT verification
│   │       └── error.middleware.ts  # Error handling
│   ├── routes/
│   │   ├── auth.routes.ts     # Auth routes
│   │   └── index.ts           # Main router
│   └── types/
│       └── auth.types.ts      # TypeScript types & Zod schemas
├── index.ts                   # Express server entry point
├── package.json
└── .env.example
```

## Scripts

- `bun run dev` - Start development server
- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema to database
- `bun run db:studio` - Open Prisma Studio

## Authentication Flow

1. **Signup**: User registers with email, password, and name
   - Creates user in Supabase Auth
   - Stores user data in Prisma database
   - Returns JWT token

2. **Login**: User authenticates with email and password
   - Verifies credentials with Supabase Auth
   - Returns JWT token

3. **Protected Routes**: Require valid JWT token in Authorization header
   - Token is verified using `authenticate` middleware
   - User data is attached to request object

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

Validation errors include details:

```json
{
  "error": "Validation error",
  "details": [...]
}
```
