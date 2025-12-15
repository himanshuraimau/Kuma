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
        Stream[Message Stream\nConsumer Group]
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
        Core[AI Assistant\nPlatform]
    end
    
    GoogleServices[Google Workspace\nGmail, Calendar, Drive, Docs]
    GitHub[GitHub]
    AIAPIs[AI Services\nGemini, OpenAI]
    VoiceServices[Voice Services\nSarvam AI, LiveKit]
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
        Auth[1.0\nAuthentication &\nSession Management]
        Chat[2.0\nChat &\nMessage Processing]
        Agent[3.0\nAI Agent\nRouting & Execution]
        Voice[4.0\nVoice\nProcessing]
        Vision[5.0\nImage & Document\nAnalysis]
        Integration[6.0\nExternal Service\nIntegration]
        Queue[7.0\nRedis Queue\nManagement]
    end
    
    DB[(Database)]
    Redis[(Redis)]
    External[External\nServices]
    
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
    Input[User Query +\nContext]
    
    subgraph AgentProcessing["3.0 AI Agent Processing"]
        Router[3.1\nRouter Agent\nQuery Classification]
        LoadContext[3.2\nLoad Context\nHistory + Memory]
        SelectAgent[3.3\nSelect Specialized\nAgent]
        LoadTools[3.4\nLoad User\nTools]
        Execute[3.5\nExecute Agent\nwith Tools]
        Stream[3.6\nStream Response\nTokens]
        SaveMemory[3.7\nSave to\nMemory]
    end
    
    DB[(Database)]
    Memory[Supermemory]
    Tools[External\nTools/APIs]
    Output[Streaming\nResponse]
    
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
    AudioInput[Audio\nInput]
    
    subgraph VoiceProcessing["4.0 Voice Processing"]
        Capture[4.1\nAudio Capture\n& Buffering]
        STT[4.2\nSpeech-to-Text\nSarvam AI]
        AgentProcess[4.3\nAI Agent\nProcessing]
        TTS[4.4\nText-to-Speech\nSarvam AI]
        Stream[4.5\nAudio\nStreaming]
    end
    
    Agent[AI Agent\nSystem]
    AudioOutput[Audio\nResponse]
    
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
    ImageInput[Image/Document\nUpload]
    
    subgraph ImageProcessing["5.0 Image & Document Analysis"]
        Validate[5.1\nFile Validation\n& Upload]
        Encode[5.2\nBase64\nEncoding]
        Vision[5.3\nGemini Vision\nAnalysis]
        OCR[5.4\nText Extraction\nOCR]
        Scene[5.5\nScene Description\n& Objects]
        Store[5.6\nStore Results\n& Metadata]
    end
    
    DB[(Database)]
    GeminiAPI[Google\nGemini Vision]
    Output[Analysis\nResults]
    
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
