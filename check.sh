#!/bin/bash

# Kuma AI - Check Prerequisites Script

echo "🔍 Checking Kuma AI Prerequisites..."
echo "====================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ALL_GOOD=true

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    VERSION=$(node --version)
    echo -e "${GREEN}✅ Found: $VERSION${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
    echo "   Install from: https://nodejs.org/"
    ALL_GOOD=false
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    VERSION=$(npm --version)
    echo -e "${GREEN}✅ Found: v$VERSION${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
    ALL_GOOD=false
fi

# Check Bun (optional)
echo -n "Checking Bun (optional)... "
if command -v bun &> /dev/null; then
    VERSION=$(bun --version)
    echo -e "${GREEN}✅ Found: v$VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Not found (optional, will use Node.js)${NC}"
fi

# Check Redis
echo -n "Checking Redis... "
if command -v redis-server &> /dev/null; then
    VERSION=$(redis-server --version | cut -d ' ' -f 3 | cut -d '=' -f 2)
    echo -e "${GREEN}✅ Found: v$VERSION${NC}"
    
    # Check if Redis is running
    echo -n "Checking Redis status... "
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Running${NC}"
    else
        echo -e "${YELLOW}⚠️  Not running (will be started automatically)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Not found (will be installed automatically)${NC}"
fi

# Check if .env exists
echo -n "Checking .env file... "
if [ -f .env ]; then
    echo -e "${GREEN}✅ Found${NC}"
    
    # Check important variables
    source .env
    
    echo -n "  - DATABASE_URL... "
    if [ ! -z "$DATABASE_URL" ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ Missing${NC}"
        ALL_GOOD=false
    fi
    
    echo -n "  - GOOGLE_API_KEY... "
    if [ ! -z "$GOOGLE_API_KEY" ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  Missing (some features won't work)${NC}"
    fi
    
    echo -n "  - OPENAI_API_KEY... "
    if [ ! -z "$OPENAI_API_KEY" ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  Missing (multimodal features won't work)${NC}"
    fi
else
    echo -e "${RED}❌ Not found${NC}"
    echo "   Create a .env file with required variables"
    ALL_GOOD=false
fi

# Check if dependencies are installed
echo -n "Checking backend dependencies... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ Installed${NC}"
else
    echo -e "${YELLOW}⚠️  Not installed (run: cd backend && npm install)${NC}"
fi

echo -n "Checking frontend dependencies... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Installed${NC}"
else
    echo -e "${YELLOW}⚠️  Not installed (run: cd frontend && npm install)${NC}"
fi

# Check ports
echo ""
echo "Checking port availability..."
echo -n "  Port 3001 (Backend)... "
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  In use${NC}"
    echo "     Run: lsof -ti:3001 | xargs kill -9"
else
    echo -e "${GREEN}✅ Available${NC}"
fi

echo -n "  Port 5173 (Frontend)... "
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  In use${NC}"
    echo "     Run: lsof -ti:5173 | xargs kill -9"
else
    echo -e "${GREEN}✅ Available${NC}"
fi

echo -n "  Port 6379 (Redis)... "
if lsof -Pi :6379 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ In use (Redis running)${NC}"
else
    echo -e "${YELLOW}⚠️  Not in use (Redis not running)${NC}"
fi

echo ""
echo "========================================="
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✅ All critical prerequisites are met!${NC}"
    echo ""
    echo "You can now run:"
    echo "  ./dev.sh     - Start in tmux (recommended)"
    echo "  ./start.sh   - Start in background"
else
    echo -e "${RED}❌ Some prerequisites are missing${NC}"
    echo ""
    echo "Please fix the issues above before starting"
fi
echo "========================================="
