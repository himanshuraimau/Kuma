#!/bin/bash

echo "Stopping all services..."

# Load PIDs and kill
if [ -f .pids ]; then
    source .pids
    kill $BACKEND_PID 2>/dev/null
    kill $WORKER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    rm .pids
fi

# Kill any remaining processes
pkill -f "bun.*dev" 2>/dev/null
pkill -f "tsx.*dev" 2>/dev/null

echo "All services stopped!"
