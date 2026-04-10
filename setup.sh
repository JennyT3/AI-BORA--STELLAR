#!/bin/bash

# AI BORA Setup Script for Stellar Hacks
# This script sets up everything needed for the demo

set -e

echo "🚀 AI BORA Setup Script"
echo "======================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ .env file not found!${NC}"
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo -e "${YELLOW}⚠️ Please edit .env and add your keys:${NC}"
  echo "  - VENDOR_SECRET (Stellar testnet secret key)"
  echo "  - CLIENT_SECRET (Stellar testnet secret key)"
  echo "  - VITE_FIREBASE_API_KEY"
  echo "  - VITE_CLERK_PUBLISHABLE_KEY"
  echo ""
  echo "After adding keys, run this script again."
  exit 1
fi

# Load environment variables
source .env

echo -e "${GREEN}✅ .env found${NC}"
echo ""

# Step 1: Check dependencies
echo "📦 Step 1: Checking dependencies..."
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not installed${NC}"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm not installed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
echo -e "${GREEN}✅ npm $(npm -v)${NC}"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Fund Stellar accounts with Friendbot
echo "💰 Step 3: Funding Stellar testnet accounts..."

if [ -n "$VENDOR_PUBLIC" ]; then
  echo "Funding vendor account: $VENDOR_PUBLIC"
  curl -s "https://friendbot.stellar.org/?addr=$VENDOR_PUBLIC" > /dev/null && echo -e "${GREEN}✅ Vendor account funded${NC}" || echo -e "${YELLOW}⚠️ Vendor account may already be funded${NC}"
else
  echo -e "${YELLOW}⚠️ VENDOR_PUBLIC not set in .env${NC}"
fi

if [ -n "$CLIENT_PUBLIC" ]; then
  echo "Funding client account: $CLIENT_PUBLIC"
  curl -s "https://friendbot.stellar.org/?addr=$CLIENT_PUBLIC" > /dev/null && echo -e "${GREEN}✅ Client account funded${NC}" || echo -e "${YELLOW}⚠️ Client account may already be funded${NC}"
else
  echo -e "${YELLOW}⚠️ CLIENT_PUBLIC not set in .env${NC}"
fi

if [ -n "$STELLAR_ADMIN_PUBLIC" ]; then
  echo "Funding admin account: $STELLAR_ADMIN_PUBLIC"
  curl -s "https://friendbot.stellar.org/?addr=$STELLAR_ADMIN_PUBLIC" > /dev/null && echo -e "${GREEN}✅ Admin account funded${NC}" || echo -e "${YELLOW}⚠️ Admin account may already be funded${NC}"
fi

echo ""

# Step 4: Add USDC trustline
echo "🏦 Step 4: Setting up USDC trustline..."

if [ -f "add-usdc-trustline.mjs" ]; then
  echo "Running add-usdc-trustline.mjs..."
  node add-usdc-trustline.mjs && echo -e "${GREEN}✅ USDC trustline added${NC}" || echo -e "${YELLOW}⚠️ Trustline setup may have issues${NC}"
else
  echo -e "${YELLOW}⚠️ add-usdc-trustline.mjs not found, skipping${NC}"
fi

echo ""

# Step 5: Build contracts (if needed)
echo "🔧 Step 5: Checking Soroban contracts..."
if command -v cargo &> /dev/null; then
  if [ -f "Cargo.toml" ]; then
    echo "Building Rust contracts..."
    cargo build --release 2>/dev/null && echo -e "${GREEN}✅ Contracts built${NC}" || echo -e "${YELLOW}⚠️ Contract build may have issues${NC}"
  else
    echo -e "${YELLOW}⚠️ Cargo.toml not found, skipping${NC}"
  fi
else
  echo -e "${YELLOW}⚠️ Cargo not installed, skipping contract build${NC}"
fi

echo ""

# Step 6: Start servers in background
echo "🚀 Step 6: Starting servers..."

# Kill any existing processes on these ports
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true

echo "Starting frontend on port 3000..."
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

echo "Starting x402 server on port 3002..."
if [ -f "server-x402.ts" ]; then
  npx tsx server-x402.ts > /dev/null 2>&1 &
  X402_PID=$!
  echo -e "${GREEN}✅ x402 server started (PID: $X402_PID)${NC}"
fi

echo "Starting MPP server on port 3003..."
if [ -f "server-mpp.ts" ]; then
  npx tsx server-mpp.ts > /dev/null 2>&1 &
  MPP_PID=$!
  echo -e "${GREEN}✅ MPP server started (PID: $MPP_PID)${NC}"
fi

sleep 3

echo ""
echo "======================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "======================================="
echo ""
echo "🎉 Services running:"
echo "  • Frontend:     http://localhost:3000"
echo "  • x402 Server:  http://localhost:3002"
echo "  • MPP Server:   http://localhost:3003"
echo ""
echo "📋 Test flows:"
echo "  1. Open http://localhost:3000"
echo "  2. Click 'Get Started' → Register with Passkey"
echo "  3. Create proposal → View PDF hash on Stellar"
echo "  4. Test payment → See 70/30 split on-chain"
echo "  5. Run: npx tsx agent-x402-v2.ts"
echo "     (Agent discovers service, pays, triggers split)"
echo ""
echo "🔗 View transactions:"
echo "  • Stellar Expert: https://stellar.expert/explorer/testnet"
echo "  • ProposalRegistry: CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5"
echo "  • PaymentSplitter: CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P"
echo ""
echo "📚 Documentation:"
echo "  • README.md"
echo "  • contracts/proposal_registry/README.md"
echo "  • contracts/proposal_registry/CONTRACT.md"
echo ""
echo "To stop all servers:"
echo "  kill $FRONTEND_PID $X402_PID $MPP_PID"
echo ""