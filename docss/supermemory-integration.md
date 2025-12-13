# Supermemory Integration Guide

> Complete guide to integrating Supermemory with AI SDK for intelligent memory management

## What is Supermemory?

Supermemory is a personal knowledge management system that creates a living knowledge graph from your content. It's designed to mirror how human memory works - forming connections, evolving over time, and generating insights from accumulated knowledge.

## Key Features

- **Universal Storage**: Store text, images, PDFs, web pages
- **Semantic Search**: Find information using natural language queries
- **Context Retrieval**: Get relevant context for AI conversations
- **Memory Management**: Organize and categorize memories
- **Knowledge Graph**: Dynamic relationships between memories
- **API Integration**: Easy integration with AI applications

## Installation & Setup

```bash
npm install supermemory
```

```typescript
import Supermemory from 'supermemory';

const client = new Supermemory({
  apiKey: process.env.SUPERMEMORY_API_KEY!
});
```

## Core Concepts

### Documents vs Memories

**Documents**: Raw content you upload (PDFs, URLs, text, images, videos)
- Think of documents as books you hand to Supermemory

**Memories**: Intelligent knowledge units created by Supermemory
- Semantic chunks with meaning
- Embedded for similarity search
- Connected through relationships
- Dynamically updated over time
- Think of memories as insights and connections your brain makes

### Memory Relationships

Supermemory creates three types of relationships:

**1. Updates**: Information changes
```text
Original: "You work at Supermemory as a content engineer"
New: "You now work at Supermemory as the CMO"
```

**2. Extends**: Information enriches
```text
Original: "You work at Supermemory as the CMO"
Extension: "Your work consists of ensuring docs are up to date, marketing campaigns, SEO"
```

**3. Derives**: Information infers
```text
Memory 1: "Dhravya is the founder of Supermemory"
Memory 2: "Dhravya frequently discusses AI and machine learning"
Derived: "Supermemory is likely an AI-focused company"
```

## Adding Memories

### Direct Text

```typescript
// Add text content
const result = await client.memories.add({
  content: "Machine learning enables computers to learn from data",
  containerTag: "ai-research",
  metadata: { priority: "high" }
});

console.log(result);
// Output: { id: "abc123", status: "queued" }
```

### File Upload

```typescript
await client.memories.uploadFile({
  file: fileStream,
  containerTag: "project"
});
```

### Update Memory

```typescript
await client.memories.update("doc_id", {
  content: "Updated content"
});
```

## Searching Memories

### Basic Search

```typescript
const results = await client.search({
  query: "React TypeScript preferences",
  limit: 5
});
```

### Advanced Search with Filters

```typescript
const filteredResults = await client.search({
  query: "frontend development",
  filters: {
    type: "preference",
    tags: ["react"]
  },
  limit: 10
});
```

## AI SDK Integration

### Memory Tools

Add memory capabilities to your AI agents:

```typescript
import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { supermemoryTools } from "@supermemory/tools/ai-sdk"

const openai = createOpenAI({
  apiKey: "YOUR_OPENAI_KEY"
})

const result = await streamText({
  model: openai("gpt-4"),
  prompt: "Remember that my name is Alice",
  tools: supermemoryTools("YOUR_SUPERMEMORY_KEY")
})
```

### Available Tools

**Search Memories**: Semantic search through user memories
```typescript
const result = await streamText({
  model: openai("gpt-4"),
  prompt: "What are my dietary preferences?",
  tools: supermemoryTools("API_KEY")
})
```

**Add Memory**: Store new information
```typescript
const result = await streamText({
  model: openai("gpt-4"),
  prompt: "Remember that I'm allergic to peanuts",
  tools: supermemoryTools("API_KEY")
})
```

**Fetch Memory**: Retrieve specific memory by ID
```typescript
const result = await streamText({
  model: openai("gpt-4"),
  prompt: "Get the details of memory abc123",
  tools: supermemoryTools("API_KEY")
})
```

### Personal Assistant Example

```typescript
import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { supermemoryTools } from '@supermemory/tools/ai-sdk'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = await streamText({
    model: anthropic('claude-3-sonnet-20240229'),
    messages,
    tools: supermemoryTools(process.env.SUPERMEMORY_API_KEY!),
    system: `You are a helpful personal assistant. When users share information,
    remember it using the addMemory tool. When they ask questions, search your 
    memories to provide personalized responses.`
  })

  return result.toAIStreamResponse()
}
```

### Customer Support with Context

```typescript
export async function POST(request: Request) {
  const { messages, customerId } = await request.json()

  const result = await streamText({
    model: openai('gpt-4'),
    messages,
    tools: supermemoryTools(process.env.SUPERMEMORY_API_KEY!, {
      containerTags: [customerId]
    }),
    system: `You are a customer support agent. Before responding:
    1. Search for the customer's previous interactions
    2. Remember any new information shared
    3. Provide personalized help based on their history`
  })

  return result.toAIStreamResponse()
}
```

### Using Individual Tools

```typescript
import {
  searchMemoriesTool,
  addMemoryTool,
  fetchMemoryTool
} from "@supermemory/tools/ai-sdk"

const result = await streamText({
  model: openai("gpt-4"),
  prompt: "What do you know about me?",
  tools: {
    searchMemories: searchMemoriesTool("API_KEY", {
      projectId: "personal"
    }),
    // Your custom tools
    createEvent: yourCustomTool
  }
})
```

## Supported Content Types

### Documents
- PDF with OCR support
- Google Docs, Sheets, Slides
- Notion pages
- Microsoft Office files

### Media
- Images (JPG, PNG, GIF, WebP) with OCR
- Videos with captions

### Web Content
- Twitter/X posts
- YouTube videos

### Text Formats
- Plain text
- Markdown
- CSV files

## Best Practices

### Memory Organization

```typescript
// Use consistent memory types
const MEMORY_TYPES = {
  PREFERENCE: 'preference',
  CONVERSATION: 'conversation',
  DOCUMENT: 'document',
  TASK: 'task',
  KNOWLEDGE: 'knowledge'
} as const;

// Tag memories for better organization
const addOrganizedMemory = async (content: string, category: string) => {
  await client.addMemory({
    content,
    type: MEMORY_TYPES.KNOWLEDGE,
    tags: [category, 'organized'],
    metadata: {
      addedAt: new Date().toISOString(),
      category
    }
  });
};
```

### Context Management

```typescript
// Limit context size for better performance
const getRelevantContext = async (query: string, maxTokens = 2000) => {
  const memories = await client.search({ query, limit: 20 });
  
  let context = '';
  let tokenCount = 0;
  
  for (const memory of memories) {
    const memoryTokens = memory.content.length / 4; // Rough estimate
    if (tokenCount + memoryTokens > maxTokens) break;
    
    context += memory.content + '\n---\n';
    tokenCount += memoryTokens;
  }
  
  return context;
};
```

## Error Handling

```typescript
try {
  const memories = await client.search({ query: "user preferences" });
  // Process memories...
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Retry...
  } else if (error.code === 'INVALID_API_KEY') {
    console.error('Invalid Supermemory API key');
  } else {
    console.error('Supermemory error:', error.message);
  }
}
```

## Processing Pipeline

| Stage          | What Happens                |
| -------------- | --------------------------- |
| **Queued**     | Document waiting to process |
| **Extracting** | Content being extracted     |
| **Chunking**   | Creating memory chunks      |
| **Embedding**  | Generating vectors          |
| **Indexing**   | Building relationships      |
| **Done**       | Fully searchable            |

## Response Format

```json
{
  "id": "D2Ar7Vo7ub83w3PRPZcaP1",
  "status": "queued"
}
```

## Environment Setup

```bash
SUPERMEMORY_API_KEY=your_supermemory_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Tips

- Use descriptive memory content for better search results
- Include context in system prompts about when to use each tool
- Use container tags to separate different use cases
- Implement error handling for tool failures
- Start simple and gradually add complexity
- Monitor token usage for cost optimization
