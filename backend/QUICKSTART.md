# Quick Start Guide

## Setup (First Time Only)

1. **Install dependencies**:
   ```bash
   cd backend
   bun install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Initialize database**:
   ```bash
   bun run db:generate
   bun run db:push
   ```

## Development

Start the server:
```bash
bun run dev
```

## Useful Commands

- `bun run db:studio` - Open Prisma Studio (database GUI)
- `bunx tsc --noEmit` - Check TypeScript errors

## Test API

```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
