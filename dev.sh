#!/bin/bash

# Kuma AI - Quick Development Script
# Starts services in separate terminals (tmux)

set -e

echo "🚀 Starting Kuma AI in development mode..."

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed. Installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y tmux
    elif command -v brew &> /dev/null; then
        brew install tmux
    else
        echo "Please install tmux manually or use start.sh instead"
        exit 1
    fi
fi

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo "🔄 Starting Redis..."
    redis-server --daemonize yes
    sleep 2
fi

# Kill existing session if it exists
tmux kill-session -t kuma 2>/dev/null || true

# Create new tmux session
echo "Creating tmux session 'kuma'..."
tmux new-session -d -s kuma -n backend

# Window 1: Backend
tmux send-keys -t kuma:backend "cd $(pwd)/backend" C-m
tmux send-keys -t kuma:backend "clear" C-m
tmux send-keys -t kuma:backend "echo '🔧 Backend Server'" C-m
tmux send-keys -t kuma:backend "echo '================'" C-m
tmux send-keys -t kuma:backend "npx prisma generate" C-m
tmux send-keys -t kuma:backend "npm run dev" C-m

# Window 2: Worker
tmux new-window -t kuma -n worker
tmux send-keys -t kuma:worker "cd $(pwd)/backend" C-m
tmux send-keys -t kuma:worker "sleep 3" C-m
tmux send-keys -t kuma:worker "clear" C-m
tmux send-keys -t kuma:worker "echo '⚙️  Worker Process'" C-m
tmux send-keys -t kuma:worker "echo '================='" C-m
tmux send-keys -t kuma:worker "npm run worker:dev" C-m

# Window 3: Frontend
tmux new-window -t kuma -n frontend
tmux send-keys -t kuma:frontend "cd $(pwd)/frontend" C-m
tmux send-keys -t kuma:frontend "sleep 2" C-m
tmux send-keys -t kuma:frontend "clear" C-m
tmux send-keys -t kuma:frontend "echo '🎨 Frontend Server'" C-m
tmux send-keys -t kuma:frontend "echo '================='" C-m
tmux send-keys -t kuma:frontend "npm run dev" C-m

# Select backend window
tmux select-window -t kuma:backend

echo ""
echo "✅ Kuma AI started in tmux session 'kuma'"
echo ""
echo "To view the services:"
echo "  tmux attach -t kuma"
echo ""
echo "Inside tmux:"
echo "  - Switch windows: Ctrl+B then 0/1/2"
echo "  - Detach: Ctrl+B then D"
echo "  - Scroll: Ctrl+B then ["
echo ""
echo "To stop all services:"
echo "  tmux kill-session -t kuma"
echo ""
echo "Services will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo ""

# Attach to the session
tmux attach -t kuma
