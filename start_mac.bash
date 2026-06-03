#!/bin/bash

# FacilityDesk Development Environment Startup Script for macOS
# Automatically installs dependencies (Homebrew, Python, Node) and starts the app.

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              🏢 FacilityDesk macOS Startup Script            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. System Dependencies
echo -e "${BLUE}🔍 Checking System Dependencies...${NC}"

# Check Homebrew
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}⚠️  Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo -e "${GREEN}✓ Homebrew installed${NC}"
else
    echo -e "${GREEN}✓ Homebrew is already installed${NC}"
fi

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3 not found. Installing Python...${NC}"
    brew install python
    echo -e "${GREEN}✓ Python installed${NC}"
else
    echo -e "${GREEN}✓ Python 3 is already installed${NC}"
fi

# Check Node.js / npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js (npm) not found. Installing Node...${NC}"
    brew install node
    echo -e "${GREEN}✓ Node.js installed${NC}"
else
    echo -e "${GREEN}✓ Node.js (npm) is already installed${NC}"
fi

# Check Redis
if ! command -v redis-server &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis not found. Installing Redis...${NC}"
    brew install redis
    echo -e "${GREEN}✓ Redis installed${NC}"
else
    echo -e "${GREEN}✓ Redis is already installed${NC}"
fi

# Check if port is in use
check_port() {
  if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $1 is already in use, stopping existing process...${NC}"
    lsof -ti:$1 | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

check_port 5173
check_port 8000

# Start Redis if not running on port 6379
if ! lsof -Pi :6379 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${BLUE}🚀 Starting Redis server...${NC}"
    redis-server > redis.log 2>&1 &
    REDIS_PID=$!
    echo -e "${GREEN}✓ Redis PID: $REDIS_PID${NC}"
else
    echo -e "${GREEN}✓ Redis is already running${NC}"
fi

# 2. Backend Setup
if [ -d "backend" ]; then
    echo -e "\n${BLUE}📦 Setting up Backend...${NC}"
    cd backend

    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from template${NC}"
    fi

    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating Python virtual environment...${NC}"
        python3 -m venv venv
    fi

    echo -e "${BLUE}Installing Python dependencies...${NC}"
    source venv/bin/activate
    pip install --upgrade pip
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    elif [ -f "pyproject.toml" ]; then
        pip install poetry && poetry install
    fi
    
    echo -e "${BLUE}🚀 Starting Backend server...${NC}"
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend PID: $BACKEND_PID${NC}"
    
    echo -e "${BLUE}🚀 Starting Celery Worker...${NC}"
    celery -A celery_worker.celery_app worker --loglevel=info > ../celery.log 2>&1 &
    CELERY_PID=$!
    echo -e "${GREEN}✓ Celery PID: $CELERY_PID${NC}"
    
    deactivate 2>/dev/null || true
    cd ..
    sleep 3
else
    echo -e "${RED}❌ Error: 'backend' directory not found${NC}"
    exit 1
fi

# 3. Frontend Setup
if [ -d "app" ]; then
    echo -e "\n${BLUE}🎨 Setting up Frontend...${NC}"
    cd app

    if [ ! -f ".env" ]; then
        cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_ENV=development
EOF
        echo -e "${GREEN}✓ Created default frontend .env${NC}"
    fi

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
    fi

    echo -e "${BLUE}🚀 Starting Frontend server...${NC}"
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓ Frontend PID: $FRONTEND_PID${NC}"
    cd ..
else
    echo -e "${RED}❌ Error: 'app' directory not found${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ All Servers Running!${NC}"
echo -e "${BLUE}Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}Backend:  http://localhost:8000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers.${NC}"

cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $CELERY_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    if [ ! -z "$REDIS_PID" ]; then
        kill $REDIS_PID 2>/dev/null || true
    fi
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✓ All servers stopped. Goodbye!${NC}"
    exit 0
}

trap cleanup INT TERM
wait
