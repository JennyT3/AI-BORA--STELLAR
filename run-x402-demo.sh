#!/bin/bash

# AI BORA Demo - Start servers and run demo

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  🤖 AI BORA x402 Demo"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  This will start:"
echo "    1. x402 Server (port 3002)"
echo "    2. Frontend (port 3000)"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""

# Kill existing processes
echo "🛑 Stopping existing servers..."
pkill -f "tsx server-x402" 2>/dev/null
pkill -f "vite.*3000" 2>/dev/null
sleep 1

# Start x402 server
echo ""
echo "🚀 Starting x402 server on port 3002..."
npx tsx server-x402-simple.ts &
SERVER_PID=$!
sleep 2

# Check if server started
if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
  echo "✅ Server started successfully"
  echo ""
  curl -s http://localhost:3002/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3002/api/health
  echo ""
else
  echo "❌ Server failed to start"
  echo "   Check if port 3002 is available"
  exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  Servers running:"
echo "    x402 Server: http://localhost:3002"
echo "    Frontend:    Run 'npm run dev' in another terminal"
echo ""
echo "  Open in browser:"
echo "    http://localhost:3000/agent-x402-demo"
echo ""
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Wait for user to stop
wait $SERVER_PID