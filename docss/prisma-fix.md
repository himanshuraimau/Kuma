# Prisma 7 Migration Guide: Fixing Datasource URL Error

## The Problem

You're seeing this error:
```
Error: The datasource property `url` is no longer supported in schema files. 
Move connection URLs for Migrate to `prisma.config.ts` and pass either `adapter` 
for a direct database connection or `accelerateUrl` for Accelerate to the 
PrismaClient constructor.
```

This is a **breaking change** in Prisma 7. The database connection URL can no longer be configured in the `schema.prisma` file. Instead, it must be configured in two separate places:
1. **prisma.config.ts** - for CLI operations (migrations, generate, etc.)
2. **Your application code** - using a database adapter when creating PrismaClient

---

## Step-by-Step Fix

### Step 1: Update Your `schema.prisma` File

**Remove the `url` line** from your datasource block, but keep the `provider`:

```prisma
// ❌ OLD (Prisma 6)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ✅ NEW (Prisma 7)
datasource db {
  provider = "postgresql"
}
```

**Important:** Keep any other properties like `shadowDatabaseUrl`, `relationMode`, `schemas`, or `extensions` if you have them.

### Step 2: Update Your Generator

Change your generator to use the new defaults:

```prisma
// ❌ OLD (Prisma 6)
generator client {
  provider = "prisma-client-js"
}

// ✅ NEW (Prisma 7)
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

### Step 3: Create `prisma.config.ts` at Project Root

Create a new file called `prisma.config.ts` in the **root** of your project (where `package.json` is):

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts', // optional: if you have a seed script
  },
  datasource: {
    url: env('DATABASE_URL'),
    // Add shadowDatabaseUrl if you need it for migrations
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})
```

**Key points:**
- This file is used by the Prisma CLI for migrations and generation
- The `env()` helper provides type-safe access to environment variables
- You must import `'dotenv/config'` at the top to load your `.env` file

### Step 4: Install Required Dependencies

You need to install the database adapter for your specific database:

#### For PostgreSQL:
```bash
npm install @prisma/adapter-pg pg dotenv
npm install --save-dev @types/pg
```

#### For MySQL:
```bash
npm install @prisma/adapter-mariadb mariadb dotenv
```

#### For SQLite:
```bash
npm install @prisma/adapter-better-sqlite3 better-sqlite3 dotenv
```

### Step 5: Update Your PrismaClient Instantiation

In your application code, you now need to use an adapter:

#### PostgreSQL Example:
```typescript
import 'dotenv/config'
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })

export default prisma
```

#### MySQL Example:
```typescript
import 'dotenv/config'
import { PrismaClient } from './generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  connectionString: process.env.DATABASE_URL
})

const prisma = new PrismaClient({ adapter })

export default prisma
```

#### SQLite Example:
```typescript
import 'dotenv/config'
import { PrismaClient } from './generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

export default prisma
```

### Step 6: Update ESM Configuration

Prisma 7 requires ES modules. Update your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "build": "tsc"
  }
}
```

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Node",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Step 7: Update Import Paths

Change all your Prisma Client imports to the new path:

```typescript
// ❌ OLD (Prisma 6)
import { PrismaClient } from '@prisma/client'

// ✅ NEW (Prisma 7)
import { PrismaClient } from './generated/prisma/client'
```

Adjust the path based on where you're importing from relative to the generated client.

### Step 8: Update Seed Script (if you have one)

Update `prisma/seed.ts` to use the same adapter pattern:

```typescript
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Your seed logic here
  console.log('Seeding database...')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Step 9: Run Generation and Migration

```bash
# Generate the Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

---

## Special Case: Using Prisma Accelerate

If you're using Prisma Accelerate, the setup is slightly different:

### Schema:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

### Application Code:
```typescript
import { PrismaClient } from './generated/prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL
}).$extends(withAccelerate())

export default prisma
```

**Note:** When using Accelerate, you do NOT use driver adapters.

---

## Troubleshooting

### Error: "Missing required environment variable: DATABASE_URL"

**Solution:** Make sure you have `import 'dotenv/config'` at the top of your `prisma.config.ts`

### Error: "Cannot find module './generated/prisma/client'"

**Solution:** Run `npx prisma generate` first

### Error: Module not found errors with ESM

**Solution:** Ensure `"type": "module"` is in your `package.json` and your `tsconfig.json` has proper ESM configuration

### Migrations failing

**Solution:** Verify your `prisma.config.ts` datasource.url points to the correct database

---

## Summary of Changes

| What Changed | Prisma 6 | Prisma 7 |
|-------------|----------|----------|
| **Database URL** | In `schema.prisma` | In `prisma.config.ts` for CLI, in code with adapter for runtime |
| **Generator** | `prisma-client-js` | `prisma-client` with explicit output |
| **Client Instantiation** | `new PrismaClient()` | `new PrismaClient({ adapter })` |
| **Import Path** | `@prisma/client` | `./generated/prisma/client` |
| **Module System** | CommonJS OK | ES Modules required |
| **Environment Variables** | Auto-loaded | Must use `dotenv/config` |

---

## Additional Resources

- [Official Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Database Drivers Documentation](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)