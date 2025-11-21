# Kuma Architecture

## Overview
Kuma is an AI-powered financial assistant.
- **Frontend**: React (Vite) + Tailwind + Shadcn UI.
- **Backend**: Node.js (Express) + LangChain + Supabase (Auth) + Prisma (DB).

## System Flow
```mermaid
graph TD
    User[User] -->|Interact| FE[Frontend (React)]
    FE -->|HTTP/REST| BE[Backend API (Express)]
    
    subgraph Backend
        BE -->|Auth| Supabase[Supabase Auth]
        BE -->|Data| Prisma[Prisma / PostgreSQL]
        BE -->|AI Logic| Router[Router Agent]
        
        Router -->|Route| StockAgent[Stock Market Agent]
        Router -->|Route| FinAgent[Financial Agent]
        
        StockAgent -->|Tool Call| YF[Yahoo Finance Tool]
        FinAgent -->|Tool Call| Calc[Calculator/Utils]
    end
    
    YF -->|Fetch| External[External APIs (Yahoo Finance)]
    StockAgent -->|LLM| Gemini[Gemini 2.5 Pro]
```

## Key Components

### Frontend (`/frontend`)
- **Tech**: React, TypeScript, TailwindCSS, Framer Motion.
- **State**: Zustand (`chat.store.ts`, `auth.store.ts`).
- **Routing**: React Router.
- **UI**: Dashboard with Chat Interface, Landing Page.

### Backend (`/backend`)
- **Tech**: Express, LangChain.js, TypeScript.
- **Agents**:
    - `Router Agent`: Decides intent.
    - `Stock Market Agent`: Deep research, news, prices.
    - `Financial Agent`: General finance queries.
- **Tools**: Custom tools wrapping `yahoo-finance2`.
- **Memory**: LangChain memory for context retention.

## Data Flow
1. **Auth**: User logs in via Supabase; Token sent to Backend.
2. **Chat**: User message -> Backend -> Router Agent -> Specialized Agent -> Tools -> LLM Response.
3. **Deep Research**: Stock Agent triggers multi-step tool execution (Price -> News -> Sector -> Synthesis).
