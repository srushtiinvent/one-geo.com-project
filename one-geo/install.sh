#!/bin/bash
# Well-Log Analysis System - Installation & Run Script
# This script automates setup and running locally

set -e  # Exit on error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🌍 Well-Log Data Analysis System                  ║
║      Setup & Run Script                            ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check Node.js
echo -e "${YELLOW}[1/5] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install from nodejs.org${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"

# Check npm
echo -e "${YELLOW}[2/5] Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION} found${NC}"

# Create directories
echo -e "${YELLOW}[3/5] Creating directories...${NC}"
mkdir -p data uploads
echo -e "${GREEN}✓ Created data/ and uploads/ directories${NC}"

# Setup Backend
echo -e "${YELLOW}[4/5] Setting up backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install --silent
fi
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created .env file"
fi
echo -e "${GREEN}✓ Backend ready${NC}"
cd ..

# Setup Frontend
echo -e "${YELLOW}[5/5] Setting up frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --silent
fi
echo -e "${GREEN}✓ Frontend ready${NC}"
cd ..

# Success!
echo -e "${GREEN}"
cat << "EOF"

╔══════════════════════════════════════════════════════╗
║         ✓ Setup Complete!                           ║
╚══════════════════════════════════════════════════════╝

EOF
echo -e "${NC}"

echo "To start the application, run:"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "  cd backend && npm run dev"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "  cd frontend && npm run dev"
echo ""
echo -e "${GREEN}Then open: http://localhost:3000${NC}"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
echo ""
