#!/bin/bash

# Simple startup script for Kuma AI

echo "🚀 Starting Kuma AI..."
echo ""

# Create logs directory
mkdir -p logs

# Start Redis if not running
if ! redis-cli ping &> /dev/null; then
    echo "Starting Redis..."
    redis-server --daemonize yes
    sleep 2
fi

# Start Backend
echo "Starting Backend..."
cd backend
bun run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"
cd ..

sleep 3

# Start Worker
echo "Starting Worker..."
cd backend
bun run worker:dev > ../logs/worker.log 2>&1 &
WORKER_PID=$!
echo "Worker started (PID: $WORKER_PID)"
cd ..

sleep 2

# Start Frontend
echo "Starting Frontend..."
cd frontend
bun run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"
cd ..

# Save PIDs
echo "BACKEND_PID=$BACKEND_PID" > .pids
echo "WORKER_PID=$WORKER_PID" >> .pids
echo "FRONTEND_PID=$FRONTEND_PID" >> .pids

echo ""
echo "✅ All services started!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""
echo "View logs:"
echo "  tail -f logs/backend.log"
echo "  tail -f logs/frontend.log"
echo "  tail -f logs/worker.log"
echo ""
echo "Stop all: ./stop.sh"
