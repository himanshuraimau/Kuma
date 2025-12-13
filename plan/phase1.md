# Implementation Plan: Queue System & Long-Running Tasks

## Problem Statement
Currently, when a user sends a message and the agent starts working (especially with tools like sending emails, analyzing documents, creating GitHub PRs), if the user closes the chat or navigates away, the task execution might be interrupted or the user loses visibility of progress.

## Solution Architecture

### 1. **RabbitMQ Message Queue Integration**

**Purpose:** Decouple chat requests from agent execution

**Flow:**
```
User sends message → API endpoint → Push to RabbitMQ → Return immediately
                                         ↓
                                    Worker picks up
                                         ↓
                                  Agent processes
                                         ↓
                                  Tools execute
                                         ↓
                              Results saved to DB
                                         ↓
                          (Optional) WebSocket notification
```

**Key Queues Needed:**
- `chat_tasks` - New messages requiring agent processing
- `tool_executions` - Individual tool calls that might take time
- `document_processing` - PDF uploads and RAG indexing
- `camera_analysis` - Periodic Pi camera image processing (for hardware)

### 2. **Containerized Worker Environment**

**Purpose:** Isolate long-running tasks, enable scaling, prevent crashes from affecting main API

**Components:**

**A. Main API Server (existing)**
- Handles HTTP requests
- Pushes tasks to queues
- Serves WebSocket connections for real-time updates
- Returns task IDs to clients immediately

**B. Worker Containers (new)**
- Pull tasks from RabbitMQ
- Execute AI agents
- Call tools (Gmail, GitHub, etc.)
- Update task status in database
- Can scale horizontally (multiple workers for heavy load)

**C. Shared Resources:**
- PostgreSQL database (for persistence)
- Supermemory (for memory operations)
- File storage (for uploads)

### 3. **Database Schema Changes**

**New Table: `Task`**
```
- id (UUID)
- userId (String)
- chatId (String)
- type (String) - "chat_message", "tool_execution", "document_processing"
- status (String) - "queued", "processing", "completed", "failed"
- input (JSON) - Original request data
- output (JSON) - Result/response
- error (String, nullable)
- startedAt (DateTime, nullable)
- completedAt (DateTime, nullable)
- createdAt (DateTime)
```

**Modified Table: `Message`**
```
- Add: taskId (String, nullable) - Links to Task
- Add: status (String) - "pending", "streaming", "completed"
```

This allows:
- Track which task generated which message
- Show "Agent is still working..." in UI
- Resume showing results when user returns

### 4. **API Endpoint Changes**

**Modified: `POST /api/chat/stream`**
- Old: Processes synchronously, streams response
- New: 
  - Creates Task record
  - Pushes to RabbitMQ
  - Returns task ID immediately
  - Client polls or subscribes via WebSocket for updates

**New: `GET /api/tasks/:taskId`**
- Check task status
- Get intermediate results
- See error messages if failed

**New: `GET /api/tasks/user/:userId`**
- List all user's tasks
- Filter by status (active, completed, failed)
- Useful for "background tasks" UI panel

**New: WebSocket `/ws/tasks`**
- Real-time task status updates
- Streaming partial results
- Tool execution progress

### 5. **Worker Process Logic**

**Worker Responsibilities:**

1. **Listen to Queue**
   - Subscribe to RabbitMQ channels
   - Acknowledge messages only after completion

2. **Execute Agent**
   - Load user context (memory, connected apps)
   - Initialize appropriate agent (Router, Financial, etc.)
   - Run agent with tools

3. **Handle Tool Calls**
   - Some tools are instant (get stock price)
   - Some are slow (analyze 50-page PDF, send 100 emails)
   - Update task status after each major step

4. **Save Results**
   - Store messages in database
   - Update task status
   - Emit WebSocket event if user is online

5. **Error Handling**
   - Catch all exceptions
   - Mark task as failed
   - Store error details
   - Send notification to user



### 7. **Deployment Structure**

**Docker Compose Setup:**

```
Services:
1. rabbitmq - Message broker
2. postgres - Database (existing)
3. api-server - Your Express API (existing, modified)
4. worker-1 - Agent worker container
5. worker-2 - Agent worker container (optional, for scaling)
6. redis (optional) - For WebSocket pub/sub if using Socket.io
```

Each worker is the same code, just running in "worker mode" vs "API mode"

### 8. **Frontend Changes Needed**

**Web UI Updates:**

1. **Task Status Indicators**
   - Show "🔄 Agent is working on your request..."
   - Progress indicators for multi-step tasks
   - Allow users to leave and come back

2. **Background Tasks Panel**
   - New section showing active tasks
   - Historical tasks
   - Click to see details/results

3. **WebSocket Integration**
   - Connect to task updates
   - Show real-time progress
   - Toast notifications when tasks complete

4. **Chat Message States**
   - "Pending" - Task queued
   - "Processing" - Agent working
   - "Completed" - Response ready
   - "Failed" - Show error, allow retry

### 9. **Implementation Priority for Hackathon**

**Phase 1 (Critical):**
- Set up RabbitMQ
- Create Task table
- Modify chat endpoint to push to queue
- Basic worker that processes chat messages
- Simple polling endpoint for status

**Phase 2 (Important):**
- WebSocket for real-time updates
- Docker containers for workers
- Handle tool executions properly
- Error handling and retries

**Phase 3 (Nice to have):**
- Multiple worker instances
- Admin dashboard for task monitoring
- Advanced retry logic
- Rate limiting for tools

## Additional Considerations

### A. **Retry Logic**
- If a task fails (network issue, API rate limit), should it auto-retry?
- Store retry count in Task table
- Exponential backoff for retries

### B. **Task Timeout**
- What if an agent gets stuck in infinite loop?
- Set max execution time (e.g., 5 minutes)
- Auto-fail tasks that exceed timeout

### C. **User Notifications**
- Email when long task completes?
- Push notifications to web/hardware?
- Save in notification center?

### D. **Resource Management**
- Limit concurrent tasks per user (prevent abuse)
- Priority queues (paid users get faster processing)
- Clean up old completed tasks (>30 days)

### E. **Monitoring & Observability**
- Worker health checks
- Queue depth monitoring (too many pending tasks?)
- Failed task alerts
- Performance metrics (task duration, success rate)

### F. **Security**
- Workers need same OAuth credentials as API
- Encrypt sensitive task data
- Ensure workers can't access other users' data

### G. **Testing Strategy**
- Test worker crash scenarios (what happens to in-progress task?)
- Test queue overflow (1000 tasks pending)
- Test network failures during tool execution
- Test user disconnecting mid-task
