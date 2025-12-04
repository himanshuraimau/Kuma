# How Supermemory Works

> Understanding the knowledge graph architecture that powers intelligent memory

Supermemory isn't just another document storage system. It's designed to mirror how human memory actually works - forming connections, evolving over time, and generating insights from accumulated knowledge.

<img src="https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/graph-view.png?fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=e05dffd1f85e514d65e962b8bcbe70c3" alt="" data-og-width="2786" width="2786" data-og-height="1662" height="1662" data-path="images/graph-view.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/graph-view.png?w=280&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=783f47a12f19bbc477d0d8151f88374a 280w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/graph-view.png?w=560&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=f2a3c56a57fc99b7ff5d9d501782aba8 560w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/graph-view.png?w=840&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=c56dcf534126dd9af5864e15780cc0d5 840w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/graph-view.png?w=1100&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=adedf3be078c9cf54367acea4688cdbd 1100w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/graph-view.png?w=1650&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=09a92a121ac17a585a1e781d9e21734c 1650w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/graph-view.png?w=2500&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=39c9f6dc57099350d6469a70bf388b2d 2500w" />

## The Mental Model

Traditional systems store files. Supermemory creates a living knowledge graph.

<CardGroup cols={2}>
  <Card title="Traditional Systems" icon="folder">
    * Static files in folders
    * No connections between content
    * Search matches keywords
    * Information stays frozen
  </Card>

  <Card title="Supermemory" icon="network">
    * Dynamic knowledge graph
    * Rich relationships between memories
    * Semantic understanding
    * Information evolves and connects
  </Card>
</CardGroup>

## Documents vs Memories

Understanding this distinction is crucial to using Supermemory effectively.

### Documents: Your Raw Input

Documents are what you provide - the raw materials:

* PDF files you upload
* Web pages you save
* Text you paste
* Images with text
* Videos to transcribe

Think of documents as books you hand to Supermemory.

### Memories: Intelligent Knowledge Units

Memories are what Supermemory creates - the understanding:

* Semantic chunks with meaning
* Embedded for similarity search
* Connected through relationships
* Dynamically updated over time

Think of memories as the insights and connections your brain makes after reading those books.

<Note>
  **Key Insight**: When you upload a 50-page PDF, Supermemory doesn't just store it. It breaks it into hundreds of interconnected memories, each understanding its context and relationships to your other knowledge.
</Note>

## Memory Relationships

<img src="https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/memories-inferred.png?fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=1755eced95305da072bcd9a598d5e3b5" alt="" data-og-width="5120" width="5120" data-og-height="2880" height="2880" data-path="images/memories-inferred.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/memories-inferred.png?w=280&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=5226a6d8248d619a17a49efc2098bf33 280w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/memories-inferred.png?w=560&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=7b211b2caf82216694900f83a652132f 560w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/memories-inferred.png?w=840&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=6a871dbb117027302904c5ce4f7b1623 840w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/memories-inferred.png?w=1100&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=f1b8c0da6d86f195379bba3960462f91 1100w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/memories-inferred.png?w=1650&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=1918d41ba800f451a351b5519b896625 1650w, https://mintcdn.com/supermemory/nafXZdsbm5CLncox/images/memories-inferred.png?w=2500&fit=max&auto=format&n=nafXZdsbm5CLncox&q=85&s=556f4c1f226a6c374aa58af415d4aca2 2500w" />

The graph connects memories through three types of relationships:

### Updates: Information Changes

When new information contradicts or updates existing knowledge, Supermemory creates an "update" relationship.

<CodeGroup>
  ```text Original Memory theme={null}
  "You work at Supermemory as a content engineer"
  ```

  ```text New Memory (Updates Original) theme={null}
  "You now work at Supermemory as the CMO"
  ```
</CodeGroup>

The system tracks which memory is latest with an `isLatest` field, ensuring searches return current information.

### Extends: Information Enriches

When new information adds to existing knowledge without replacing it, Supermemory creates an "extends" relationship.

Continuing our "working at supermemory" analogy, a memory about what you work on would extend the memory about your role given above.

<CodeGroup>
  ```text Original Memory theme={null}
  "You work at Supermemory as the CMO"
  ```

  ```text New Memory (Extension) - Separate From Previous theme={null}
  "Your work consists of ensuring the docs are up to date, making marketing campaigns, SEO, etc."
  ```
</CodeGroup>

Both memories remain valid and searchable, providing richer context.

### Derives: Information Infers

The most sophisticated relationship - when Supermemory infers new connections from patterns in your knowledge.

<CodeGroup>
  ```text Memory 1 theme={null}
  "Dhravya is the founder of Supermemory"
  ```

  ```text Memory 2 theme={null}
  "Dhravya frequently discusses AI and machine learning innovations"
  ```

  ```text Derived Memory theme={null}
  "Supermemory is likely an AI-focused company"
  ```
</CodeGroup>

These inferences help surface insights you might not have explicitly stated.

## Processing Pipeline

Understanding the pipeline helps you optimize your usage:

| Stage          | What Happens                |
| -------------- | --------------------------- |
| **Queued**     | Document waiting to process |
| **Extracting** | Content being extracted     |
| **Chunking**   | Creating memory chunks      |
| **Embedding**  | Generating vectors          |
| **Indexing**   | Building relationships      |
| **Done**       | Fully searchable            |

<Note>
  **Tip**: Larger documents and videos take longer. A 100-page PDF might take 1-2 minutes, while a 1-hour video could take 5-10 minutes.
</Note>

## Next Steps

Now that you understand how Supermemory works:

<CardGroup cols={2}>
  <Card title="Add Memories" icon="plus" href="/add-memories/overview">
    Start adding content to your knowledge graph
  </Card>

  <Card title="Search Memories" icon="search" href="/search/overview">
    Learn to query your knowledge effectively
  </Card>
</CardGroup>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://supermemory.ai/docs/llms.txt


# Add Memories Overview

> Add content to Supermemory through text, files, or URLs

Add any type of content to Supermemory - text, files, URLs, images, videos, and more. Everything is automatically processed into searchable memories that form part of your intelligent knowledge graph.

## Prerequisites

Before adding memories, you need to set up the Supermemory client:

* **Install the SDK** for your language
* **Get your API key** from [Supermemory Console](https://console.supermemory.ai)
* **Initialize the client** with your API key

<CodeGroup>
  ```bash npm theme={null}
  npm install supermemory
  ```

  ```bash pip theme={null}
  pip install supermemory
  ```
</CodeGroup>

<CodeGroup>
  ```typescript TypeScript theme={null}
  import Supermemory from 'supermemory';

  const client = new Supermemory({
    apiKey: process.env.SUPERMEMORY_API_KEY!
  });
  ```

  ```python Python theme={null}
  from supermemory import Supermemory
  import os

  client = Supermemory(
      api_key=os.environ.get("SUPERMEMORY_API_KEY")
  )
  ```
</CodeGroup>

## Quick Start

<CodeGroup>
  ```typescript TypeScript theme={null}
  // Add text content
  const result = await client.memories.add({
    content: "Machine learning enables computers to learn from data",
    containerTag: "ai-research",
    metadata: { priority: "high" }
  });

  console.log(result);
  // Output: { id: "abc123", status: "queued" }
  ```

  ```python Python theme={null}
  # Add text content
  result = client.memories.add(
      content="Machine learning enables computers to learn from data",
      container_tags=["ai-research"],
      metadata={"priority": "high"}
  )

  print(result)
  # Output: {"id": "abc123", "status": "queued"}
  ```

  ```bash cURL theme={null}
  curl -X POST "https://api.supermemory.ai/v3/documents" \
    -H "Authorization: Bearer $SUPERMEMORY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Machine learning enables computers to learn from data",
      "containerTag": "ai-research",
      "metadata": {"priority": "high"}
    }'

  # Response: {"id": "abc123", "status": "queued"}
  ```
</CodeGroup>

## Key Concepts

<Note>
  **New to Supermemory?** Read [How Supermemory Works](/how-it-works) to understand the knowledge graph architecture and the distinction between documents and memories.
</Note>

### Quick Overview

* **Documents**: Raw content you upload (PDFs, URLs, text)
* **Memories**: Searchable chunks created automatically with relationships
* **Container Tags**: Group related content for better context
* **Metadata**: Additional information for filtering

### Content Sources

Add content through three methods:

1. **Direct Text**: Send text content directly via API
2. **File Upload**: Upload PDFs, images, videos for extraction
3. **URL Processing**: Automatic extraction from web pages and platforms

## Endpoints

<Warning>
  Remember, these endpoints add documents. Memories are inferred by Supermemory.
</Warning>

### Add Content

`POST /v3/documents`

Add text content, URLs, or any supported format.

<CodeGroup>
  ```typescript TypeScript theme={null}
  await client.memories.add({
    content: "Your content here",
    containerTag: "project"
  });
  ```

  ```python Python theme={null}
  client.memories.add(
    content="Your content here",
    container_tags=["project"]
  )
  ```

  ```bash cURL theme={null}
  curl -X POST "https://api.supermemory.ai/v3/documents" \
    -H "Authorization: Bearer $SUPERMEMORY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"content": "Your content here", "containerTag": "project"}'
  ```
</CodeGroup>

### Upload File

`POST /v3/documents/file`

Upload files directly for processing.

<CodeGroup>
  ```typescript TypeScript theme={null}
  await client.memories.uploadFile({
    file: fileStream,
    containerTag: "project"
  });
  ```

  ```python Python theme={null}
  client.memories.upload_file(
    file=open('file.pdf', 'rb'),
    container_tags='project'
  )
  ```

  ```bash cURL theme={null}
  curl -X POST "https://api.supermemory.ai/v3/documents/file" \
    -H "Authorization: Bearer $SUPERMEMORY_API_KEY" \
    -F "file=@document.pdf" \
    -F "containerTags=project"
  ```
</CodeGroup>

### Update Memory

`PATCH /v3/documents/{id}`

Update existing document content.

<CodeGroup>
  ```typescript TypeScript theme={null}
  await client.memories.update("doc_id", {
    content: "Updated content"
  });
  ```

  ```python Python theme={null}
  client.memories.update("doc_id", {
    "content": "Updated content"
  })
  ```

  ```bash cURL theme={null}
  curl -X PATCH "https://api.supermemory.ai/v3/documents/doc_id" \
    -H "Authorization: Bearer $SUPERMEMORY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"content": "Updated content"}'
  ```
</CodeGroup>

## Supported Content Types

### Documents

* PDF with OCR support
* Google Docs, Sheets, Slides
* Notion pages
* Microsoft Office files

### Media

* Images (JPG, PNG, GIF, WebP) with OCR

### Web Content

* Twitter/X posts
* YouTube videos with captions

### Text Formats

* Plain text
* Markdown
* CSV files

<Note> Refer to the [connectors guide](/connectors/overview) to learn how you can connect Google Drive, Notion, and OneDrive and sync files in real-time. </Note>

## Response Format

```json  theme={null}
{
  "id": "D2Ar7Vo7ub83w3PRPZcaP1",
  "status": "queued"
}
```

* **`id`**: Unique document identifier
* **`status`**: Processing state (`queued`, `processing`, `done`)

## Next Steps

* [Track Processing Status](/api/track-progress) - Monitor document processing
* [Search Memories](/search/overview) - Search your content
* [List Memories](/list-memories/overview) - Browse stored memories
* [Update & Delete](/update-delete-memories/overview) - Manage memories


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://supermemory.ai/docs/llms.txt



# Add Memories Overview

> Add content to Supermemory through text, files, or URLs

Add any type of content to Supermemory - text, files, URLs, images, videos, and more. Everything is automatically processed into searchable memories that form part of your intelligent knowledge graph.

## Prerequisites

Before adding memories, you need to set up the Supermemory client:

* **Install the SDK** for your language
* **Get your API key** from [Supermemory Console](https://console.supermemory.ai)
* **Initialize the client** with your API key

<CodeGroup>
  ```bash npm theme={null}
  npm install supermemory
  ```

  ```bash pip theme={null}
  pip install supermemory
  ```
</CodeGroup>

<CodeGroup>
  ```typescript TypeScript theme={null}
  import Supermemory from 'supermemory';

  const client = new Supermemory({
    apiKey: process.env.SUPERMEMORY_API_KEY!
  });
  ```

  ```python Python theme={null}
  from supermemory import Supermemory
  import os

  client = Supermemory(
      api_key=os.environ.get("SUPERMEMORY_API_KEY")
  )
  ```
</CodeGroup>

## Quick Start

<CodeGroup>
  ```typescript TypeScript theme={null}
  // Add text content
  const result = await client.memories.add({
    content: "Machine learning enables computers to learn from data",
    containerTag: "ai-research",
    metadata: { priority: "high" }
  });

  console.log(result);
  // Output: { id: "abc123", status: "queued" }
  ```

  ```python Python theme={null}
  # Add text content
  result = client.memories.add(
      content="Machine learning enables computers to learn from data",
      container_tags=["ai-research"],
      metadata={"priority": "high"}
  )

  print(result)
  # Output: {"id": "abc123", "status": "queued"}
  ```

  ```bash cURL theme={null}
  curl -X POST "https://api.supermemory.ai/v3/documents" \
    -H "Authorization: Bearer $SUPERMEMORY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Machine learning enables computers to learn from data",
      "containerTag": "ai-research",
      "metadata": {"priority": "high"}
    }'

  # Response: {"id": "abc123", "status": "queued"}
  ```
</CodeGroup>

## Key Concepts

<Note>
  **New to Supermemory?** Read [How Supermemory Works](/how-it-works) to understand the knowledge graph architecture and the distinction between documents and memories.
</Note>

### Quick Overview

* **Documents**: Raw content you upload (PDFs, URLs, text)
* **Memories**: Searchable chunks created automatically with relationships
* **Container Tags**: Group related content for better context
* **Metadata**: Additional information for filtering

### Content Sources

Add content through three methods:

1. **Direct Text**: Send text content directly via API
2. **File Upload**: Upload PDFs, images, videos for extraction
3. **URL Processing**: Automatic extraction from web pages and platforms

## Endpoints

<Warning>
  Remember, these endpoints add documents. Memories are inferred by Supermemory.
</Warning>

### Add Content

`POST /v3/documents`

Add text content, URLs, or any supported format.

<CodeGroup>
  ```typescript TypeScript theme={null}
  await client.memories.add({
    content: "Your content here",
    containerTag: "project"
  });
  ```

  ```python Python theme={null}
  client.memories.add(
    content="Your content here",
    container_tags=["project"]
  )
  ```

  ```bash cURL theme={null}
  curl -X POST "https://api.supermemory.ai/v3/documents" \
    -H "Authorization: Bearer $SUPERMEMORY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"content": "Your content here", "containerTag": "project"}'
  ```
</CodeGroup>

### Upload File

`POST /v3/documents/file`

Upload files directly for processing.

<CodeGroup>
  ```typescript TypeScript theme={null}
  await client.memories.uploadFile({
    file: fileStream,
    containerTag: "project"
  });
  ```

  ```python Python theme={null}
  client.memories.upload_file(
    file=open('file.pdf', 'rb'),
    container_tags='project'
  )
  ```

  ```bash cURL theme={null}
  curl -X POST "https://api.supermemory.ai/v3/documents/file" \
    -H "Authorization: Bearer $SUPERMEMORY_API_KEY" \
    -F "file=@document.pdf" \
    -F "containerTags=project"
  ```
</CodeGroup>

### Update Memory

`PATCH /v3/documents/{id}`

Update existing document content.

<CodeGroup>
  ```typescript TypeScript theme={null}
  await client.memories.update("doc_id", {
    content: "Updated content"
  });
  ```

  ```python Python theme={null}
  client.memories.update("doc_id", {
    "content": "Updated content"
  })
  ```

  ```bash cURL theme={null}
  curl -X PATCH "https://api.supermemory.ai/v3/documents/doc_id" \
    -H "Authorization: Bearer $SUPERMEMORY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"content": "Updated content"}'
  ```
</CodeGroup>

## Supported Content Types

### Documents

* PDF with OCR support
* Google Docs, Sheets, Slides
* Notion pages
* Microsoft Office files

### Media

* Images (JPG, PNG, GIF, WebP) with OCR

### Web Content

* Twitter/X posts
* YouTube videos with captions

### Text Formats

* Plain text
* Markdown
* CSV files

<Note> Refer to the [connectors guide](/connectors/overview) to learn how you can connect Google Drive, Notion, and OneDrive and sync files in real-time. </Note>

## Response Format

```json  theme={null}
{
  "id": "D2Ar7Vo7ub83w3PRPZcaP1",
  "status": "queued"
}
```

* **`id`**: Unique document identifier
* **`status`**: Processing state (`queued`, `processing`, `done`)

## Next Steps

* [Track Processing Status](/api/track-progress) - Monitor document processing
* [Search Memories](/search/overview) - Search your content
* [List Memories](/list-memories/overview) - Browse stored memories
* [Update & Delete](/update-delete-memories/overview) - Manage memories


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://supermemory.ai/docs/llms.txt


# Memory Tools

> Add memory capabilities to your AI agents with Vercel AI SDK tools

Memory tools allow AI agents to search, add, and fetch memories.

## Setup

```typescript  theme={null}
import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { supermemoryTools } from "@supermemory/tools/ai-sdk"

const openai = createOpenAI({
  apiKey: "YOUR_OPENAI_KEY"
})

const result = await streamText({
  model: openai("gpt-5"),
  prompt: "Remember that my name is Alice",
  tools: supermemoryTools("YOUR_SUPERMEMORY_KEY")
})
```

## Available Tools

### Search Memories

Semantic search through user memories:

```typescript  theme={null}
const result = await streamText({
  model: openai("gpt-5"),
  prompt: "What are my dietary preferences?",
  tools: supermemoryTools("API_KEY")
})

// The AI will automatically call searchMemories tool
// Example tool call:
// searchMemories({ informationToGet: "dietary preferences and restrictions" })
```

### Add Memory

Store new information:

```typescript  theme={null}
const result = await streamText({
  model: anthropic("claude-3-sonnet"),
  prompt: "Remember that I'm allergic to peanuts",
  tools: supermemoryTools("API_KEY")
})

// The AI will automatically call addMemory tool
// Example tool call:
// addMemory({ memory: "User is allergic to peanuts" })
```

### Fetch Memory

Retrieve specific memory by ID:

```typescript  theme={null}
const result = await streamText({
  model: openai("gpt-5"),
  prompt: "Get the details of memory abc123",
  tools: supermemoryTools("API_KEY")
})

// The AI will automatically call fetchMemory tool
// Example tool call:
// fetchMemory({ memoryId: "abc123" })
```

## Using Individual Tools

For more control, import tools separately:

```typescript  theme={null}
import {
  searchMemoriesTool,
  addMemoryTool,
  fetchMemoryTool
} from "@supermemory/tools/ai-sdk"

// Use only search tool
const result = await streamText({
  model: openai("gpt-5"),
  prompt: "What do you know about me?",
  tools: {
    searchMemories: searchMemoriesTool("API_KEY", {
      projectId: "personal"
    })
  }
})

// Combine with custom tools
const result = await streamText({
  model: anthropic("claude-3"),
  prompt: "Help me with my calendar",
  tools: {
    searchMemories: searchMemoriesTool("API_KEY"),
    // Your custom tools
    createEvent: yourCustomTool,
    sendEmail: anotherCustomTool
  }
})
```

## Tool Results

Each tool returns a result object:

```typescript  theme={null}
// searchMemories result
{
  success: true,
  results: [...],  // Array of memories
  count: 5
}

// addMemory result
{
  success: true,
  memory: { id: "mem_123", ... }
}

// fetchMemory result
{
  success: true,
  memory: { id: "mem_123", content: "...", ... }
}
```

## Next Steps

<CardGroup cols={2}>
  <Card title="Infinite Chat" icon="infinity" href="/ai-sdk/infinite-chat">
    Try automatic memory management
  </Card>

  <Card title="Examples" icon="code" href="/cookbook/ai-sdk-integration">
    See more complete examples
  </Card>
</CardGroup>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://supermemory.ai/docs/llms.txt