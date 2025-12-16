# Kuma AI - Architecture Documentation (Report Diagrams Only)

This document contains only the essential diagrams needed for the mini project report.

## Diagrams Included

1. System Architecture
2. Redis Queue Architecture  
3. Voice Processing Flow
4. Level 0 DFD (Context Diagram)
5. Level 1 DFD
6. Level 2 DFD - Agent Processing
7. Level 2 DFD - Voice Processing
8. Level 2 DFD - Image Processing

---

## 1. System Architecture

**Figure: System Architecture of Kuma AI Assistant**

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Vite)"]
        UI[User Interface]
        Store[Zustand State]
        APIClient[API Client]
    end

    subgraph Server["Backend (Bun + Express)"]
        Routes[Express Routes]
        Controllers[Controllers]
        Agents[AI Agents]
        Services[Services]
    end

    subgraph External["External Services"]
        Gemini[Google Gemini]
        OpenAI[OpenAI GPT-4]
        Sarvam[Sarvam AI Voice]
        Google[Google Workspace]
        GitHub[GitHub API]
        Supermemory[Supermemory]
    end

    subgraph Storage["Data Layer"]
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Streams)]
    end

    UI --> Store
    Store --> APIClient
    APIClient -->|HTTP/SSE| Routes
    Routes --> Controllers
    Controllers --> Agents
    Controllers --> Services
    
    Agents --> Gemini
    Agents --> OpenAI
    Services --> Sarvam
    Services --> Google
    Services --> GitHub
    Services --> Supermemory
    
    Controllers --> PostgreSQL
    Controllers --> Redis
```

---

## 2. Redis Queue Architecture

**Figure: Redis Message Queue Architecture**

```mermaid
flowchart TB
    subgraph Producer["API Server"]
        Receive[Receive Chat Message]
        Publish[Publish to Redis Stream]
        Subscribe[Subscribe to Status]
        SSE[Stream to Client via SSE]
    end
    
    subgraph Redis["Redis"]
        Stream[Message Stream Consumer Group]
        PubSub[Pub/Sub Channels]
        DLQ[Dead Letter Queue]
    end
    
    subgraph Worker["Worker Process"]
        Consume[Consume Messages]
        Process[Process with AI Agent]
        UpdateStatus[Publish Status Updates]
        SaveDB[Save to Database]
    end
    
    Receive --> Publish
    Publish --> Stream
    Stream --> Consume
    Consume --> Process
    Process --> UpdateStatus
    UpdateStatus --> PubSub
    PubSub --> Subscribe
    Subscribe --> SSE
    Process --> SaveDB
```

---

## 3. Voice Processing Flow

**Figure: Voice Processing Pipeline**

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Server
    participant SarvamSTT as Sarvam STT
    participant Agent as AI Agent
    participant SarvamTTS as Sarvam TTS

    User->>Frontend: Speak into microphone
    Frontend->>Frontend: Voice Activity Detection
    Frontend->>Frontend: Record audio chunks
    Frontend->>Server: POST /voice/process
    Server->>SarvamSTT: Transcribe audio
    SarvamSTT->>Server: Text transcript
    Server->>Agent: Process with AI
    Agent->>Server: Text response
    Server->>SarvamTTS: Synthesize speech
    SarvamTTS->>Server: Audio response
    Server->>Frontend: Audio + transcript
    Frontend->>User: Play audio response
```

---

## 4. Level 0 DFD - Context Diagram

**Figure: Context Diagram (Level 0 DFD)**

```mermaid
flowchart TB
    User((User))
    
    subgraph System["Kuma AI System"]
        Core[AI Assistant Platform]
    end
    
    GoogleServices[Google Workspace Gmail, Calendar, Drive, Docs]
    GitHub[GitHub]
    AIAPIs[AI Services Gemini, OpenAI]
    VoiceServices[Voice Services Sarvam AI, LiveKit]
    Memory[Supermemory]
    
    User -->|Text, Voice, Images| Core
    Core -->|Responses, Actions| User
    
    Core <-->|OAuth, API Calls| GoogleServices
    Core <-->|API Calls| GitHub
    Core <-->|LLM Requests| AIAPIs
    Core <-->|STT/TTS| VoiceServices
    Core <-->|Memory Storage| Memory
```

---

## 5. Level 1 DFD

**Figure: Level 1 Data Flow Diagram**

```mermaid
flowchart TB
    User((User))
    
    subgraph System["Kuma AI System"]
        Auth[1.0 Authentication & Session Management]
        Chat[2.0 Chat & Message Processing]
        Agent[3.0 AI Agent Routing & Execution]
        Voice[4.0 Voice Processing]
        Vision[5.0 Image & Document Analysis]
        Integration[6.0 External Service Integration]
        Queue[7.0 Redis Queue Management]
    end
    
    DB[(Database)]
    Redis[(Redis)]
    External[External Services]
    
    User -->|Credentials| Auth
    Auth -->|JWT Token| User
    Auth <--> DB
    
    User -->|Messages| Chat
    Chat -->|Responses| User
    Chat --> Agent
    Chat <--> DB
    
    Agent --> Queue
    Queue <--> Redis
    Agent --> Integration
    Integration <--> External
    
    User -->|Audio| Voice
    Voice -->|Audio Response| User
    Voice --> Agent
    
    User -->|Images/Docs| Vision
    Vision -->|Analysis| User
    Vision --> Agent
```

---

## 6. Level 2 DFD - Agent Processing

**Figure: Level 2 DFD - Agent Processing Module**

```mermaid
flowchart TB
    Input[User Query + Context]
    
    subgraph AgentProcessing["3.0 AI Agent Processing"]
        Router[3.1 Router Agent Query Classification]
        LoadContext[3.2 Load Context History + Memory]
        SelectAgent[3.3 Select Specialized Agent]
        LoadTools[3.4 Load User Tools]
        Execute[3.5 Execute Agent with Tools]
        Stream[3.6 Stream Response Tokens]
        SaveMemory[3.7 Save to Memory]
    end
    
    DB[(Database)]
    Memory[Supermemory]
    Tools[External Tools/APIs]
    Output[Streaming Response]
    
    Input --> Router
    Router --> LoadContext
    LoadContext <--> DB
    LoadContext <--> Memory
    LoadContext --> SelectAgent
    SelectAgent --> LoadTools
    LoadTools --> Execute
    Execute <--> Tools
    Execute --> Stream
    Stream --> Output
    Execute --> SaveMemory
    SaveMemory --> Memory
```

---

## 7. Level 2 DFD - Voice Processing

**Figure: Level 2 DFD - Voice Processing Module**

```mermaid
flowchart TB
    AudioInput[Audio Input]
    
    subgraph VoiceProcessing["4.0 Voice Processing"]
        Capture[4.1 Audio Capture & Buffering]
        STT[4.2 Speech-to-Text Sarvam AI]
        AgentProcess[4.3 AI Agent Processing]
        TTS[4.4 Text-to-Speech Sarvam AI]
        Stream[4.5 Audio Streaming]
    end
    
    Agent[AI Agent System]
    AudioOutput[Audio Response]
    
    AudioInput --> Capture
    Capture --> STT
    STT -->|Transcript| AgentProcess
    AgentProcess <--> Agent
    AgentProcess -->|Text Response| TTS
    TTS --> Stream
    Stream --> AudioOutput
```

---

## 8. Level 2 DFD - Image Processing

**Figure: Level 2 DFD - Image Processing Module**

```mermaid
flowchart TB
    ImageInput[Image/Document Upload]
    
    subgraph ImageProcessing["5.0 Image & Document Analysis"]
        Validate[5.1 File Validation & Upload]
        Encode[5.2 Base64 Encoding]
        Vision[5.3 Gemini Vision Analysis]
        OCR[5.4 Text Extraction OCR]
        Scene[5.5 Scene Description & Objects]
        Store[5.6 Store Results & Metadata]
    end
    
    DB[(Database)]
    GeminiAPI[Google Gemini Vision]
    Output[Analysis Results]
    
    ImageInput --> Validate
    Validate --> Encode
    Encode --> Vision
    Vision <--> GeminiAPI
    Vision --> OCR
    Vision --> Scene
    OCR --> Store
    Scene --> Store
    Store --> DB
    Store --> Output
```

---

## 9. Docker Deployment Architecture

**Figure: Docker Deployment Architecture**

```mermaid
flowchart TB
    subgraph DockerHost["Docker Host"]
        subgraph FrontendContainer["Frontend Container (NGINX)"]
            NGINX[NGINX Web Server]
            StaticFiles[React Build /usr/share/nginx/html]
        end
        
        subgraph BackendContainer["Backend API Container (Bun)"]
            API[Express API Server]
            Prisma[Prisma ORM]
            AIAgents[AI Agents]
        end
        
        subgraph WorkerContainer["Worker Container (Bun)"]
            Worker[Queue Consumer]
            AgentProcessor[AI Agent Processor]
        end
        
        subgraph PostgresContainer["PostgreSQL Container"]
            PostgresDB[(PostgreSQL Database)]
            PGData[/var/lib/postgresql/data]
        end
        
        subgraph RedisContainer["Redis Container"]
            RedisServer[(Redis Server)]
            RedisStreams[Streams + Pub/Sub]
            RedisData[/data]
        end
    end
    
    subgraph Volumes["Docker Volumes"]
        PGVolume[postgres-data]
        RedisVolume[redis-data]
        UploadsVolume[uploads]
    end
    
    subgraph Networks["Docker Networks"]
        BridgeNet[kuma-network bridge]
    end
    
    subgraph External["External Services"]
        Gemini[Google Gemini API]
        OpenAI[OpenAI API]
        GoogleWS[Google Workspace]
        Sarvam[Sarvam AI]
    end
    
    User[User Browser] -->|HTTP :80| NGINX
    NGINX -->|Proxy /api| API
    
    API <-->|SQL| PostgresDB
    API <-->|Pub/Sub| RedisServer
    Worker <-->|Streams| RedisServer
    Worker <-->|SQL| PostgresDB
    
    API -->|AI Requests| Gemini
    API -->|AI Requests| OpenAI
    API -->|OAuth/API| GoogleWS
    API -->|STT/TTS| Sarvam
    
    Worker -->|AI Requests| Gemini
    Worker -->|AI Requests| OpenAI
    
    PGData -.->|Mount| PGVolume
    RedisData -.->|Mount| RedisVolume
    API -.->|Mount| UploadsVolume
    
    FrontendContainer -.->|Connected| BridgeNet
    BackendContainer -.->|Connected| BridgeNet
    WorkerContainer -.->|Connected| BridgeNet
    PostgresContainer -.->|Connected| BridgeNet
    RedisContainer -.->|Connected| BridgeNet
    
    style FrontendContainer fill:#e3f2fd
    style BackendContainer fill:#fff3e0
    style WorkerContainer fill:#fff3e0
    style PostgresContainer fill:#f3e5f5
    style RedisContainer fill:#ffebee
    style Volumes fill:#f1f8e9
    style Networks fill:#fce4ec
```

### Container Details

**1. Frontend Container (NGINX)**
- **Base Image:** `nginx:alpine`
- **Port:** 80:80
- **Build:** Multi-stage (Node build → NGINX serve)
- **Health Check:** `curl http://localhost:80`
- **Config:** Custom nginx.conf for SPA routing

**2. Backend API Container (Bun)**
- **Base Image:** `oven/bun:latest`
- **Port:** 3001:3001
- **Environment:** 
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `GOOGLE_GENERATIVE_AI_API_KEY`
  - `REDIS_URL`
- **Health Check:** `curl http://localhost:3001/health`
- **Volumes:** `./uploads:/app/uploads`

**3. Worker Container (Bun)**
- **Base Image:** `oven/bun:latest`
- **No exposed ports** (internal only)
- **Environment:** Same as Backend API
- **Health Check:** Process running check
- **Purpose:** Async AI processing from Redis queue

**4. PostgreSQL Container**
- **Base Image:** `postgres:15-alpine`
- **Port:** 5432:5432
- **Environment:**
  - `POSTGRES_USER=kuma`
  - `POSTGRES_PASSWORD=***`
  - `POSTGRES_DB=kuma`
- **Volume:** `postgres-data:/var/lib/postgresql/data`
- **Health Check:** `pg_isready -U kuma`

**5. Redis Container**
- **Base Image:** `redis:7-alpine`
- **Port:** 6379:6379
- **Volume:** `redis-data:/data`
- **Health Check:** `redis-cli ping`
- **Purpose:** Message queue (Streams) + Pub/Sub

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - kuma-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://kuma:password@postgres:5432/kuma
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_API_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - uploads:/app/uploads
    networks:
      - kuma-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.worker
    environment:
      - DATABASE_URL=postgresql://kuma:password@postgres:5432/kuma
      - REDIS_URL=redis://redis:6379
      - GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_API_KEY}
    depends_on:
      - postgres
      - redis
    networks:
      - kuma-network
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=kuma
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=kuma
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - kuma-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kuma"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    networks:
      - kuma-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
  redis-data:
  uploads:

networks:
  kuma-network:
    driver: bridge
```

### Deployment Commands

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# Start with worker
docker-compose --profile with-worker up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Scale workers
docker-compose up -d --scale worker=3
```

---

## How to Use These Diagrams

1. Copy each mermaid code block
2. Paste into Mermaid Live Editor: https://mermaid.live
3. Export as PNG or SVG
4. Save with appropriate filename
5. Place in report images directory
6. Update LaTeX `\includegraphics` commands

## Recommended Filenames

- `system_architecture.png`
- `redis_architecture.png`
- `voice_pipeline.png`
- `dfd_level0.png`
- `dfd_level1.png`
- `dfd_agent_processing.png`
- `dfd_voice_processing.png`
- `dfd_image_processing.png`
- `docker_deployment.png`
