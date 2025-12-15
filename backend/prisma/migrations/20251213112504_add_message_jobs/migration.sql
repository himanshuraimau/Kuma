-- CreateTable
CREATE TABLE "message_jobs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "message_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_jobs_jobId_key" ON "message_jobs"("jobId");

-- CreateIndex
CREATE INDEX "message_jobs_userId_idx" ON "message_jobs"("userId");

-- CreateIndex
CREATE INDEX "message_jobs_chatId_idx" ON "message_jobs"("chatId");

-- CreateIndex
CREATE INDEX "message_jobs_status_idx" ON "message_jobs"("status");

-- CreateIndex
CREATE INDEX "message_jobs_createdAt_idx" ON "message_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "message_jobs_jobId_idx" ON "message_jobs"("jobId");
