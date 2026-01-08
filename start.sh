#!/bin/bash

echo "=== Starting Xibalba CLI ==="

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "Loading environment variables from .env..."
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
fi

# Enhanced cleanup - kill all related processes
echo "Cleaning up existing processes..."
pkill -9 -f chrome || true
pkill -9 -f chromium || true
pkill -9 -f "toad serve" || true
pkill -9 -f vite || true
pkill -9 -f uvicorn || true
pkill -9 -f "npm run dev" || true
pkill -9 -f ttyd || true
pkill -9 -f "python.*orchestrator" || true
rm -f /tmp/.X*.lock 2>/dev/null

sleep 2

# Create log directory
mkdir -p logs

# 1. Start Browser Environment
echo "[1/5] Starting Browser Environment..."
./start_browser.sh > logs/browser.log 2>&1 &
BROWSER_PID=$!

# Wait for browser to be ready
echo "  Waiting for browser..."
for i in {1..30}; do
    WS_ENDPOINT=$(curl -s localhost:9222/json/version 2>/dev/null | grep -o '"webSocketDebuggerUrl": "[^"]*"' | cut -d'"' -f4)
    if [ -n "$WS_ENDPOINT" ]; then
        echo "  ✓ Browser ready"
        break
    fi
    sleep 1
done

if [ -z "$WS_ENDPOINT" ]; then
    echo "  ✗ Browser failed to start - check logs/browser.log"
    exit 1
fi

# Save browser endpoint
echo "$WS_ENDPOINT" > .browser_ws_url
echo "$WS_ENDPOINT" > toad/.browser_ws_url

# 2. Start Orchestrator (Backend API for browser/terminal control)
echo "[2/6] Starting Orchestrator on port 3000..."
uv run python orchestrator.py > logs/orchestrator.log 2>&1 &
ORCHESTRATOR_PID=$!
echo "  ✓ Orchestrator started"

# 3. Start Test App (Vite dev server)
echo "[3/6] Starting Test App on port 3001..."
cd test-app
npm install --silent 2>/dev/null
npm run dev -- --port 3001 --host 0.0.0.0 > ../logs/test-app.log 2>&1 &
TEST_APP_PID=$!
cd ..
echo "  ✓ Test App started"

# 4. Start Toad Server in test-app directory (configured with Gemini CLI)
echo "[4/6] Starting Toad Server on port 8000..."
(cd test-app && uv --project ../toad run toad serve --port 8000 --host 0.0.0.0 --agent gemini > ../logs/toad-server.log 2>&1) &
TOAD_PID=$!
echo "  ✓ Toad Server started (Gemini CLI configured)"

# 5. Start ttyd terminal in test-app directory  
echo "[5/6] Starting Terminal (ttyd) on port 7681..."
(cd test-app && ttyd --port 7681 --writable -t fontSize=14 bash > ../logs/ttyd.log 2>&1) &
TTYD_PID=$!
echo "  ✓ Terminal started"

# 6. Start UI Dashboard
echo "[6/6] Starting UI Dashboard on port 5173..."
cd ui
npm run dev -- --port 5173 --host 0.0.0.0 > ../logs/ui.log 2>&1 &
UI_PID=$!
cd ..
echo "  ✓ UI Dashboard started"

echo ""
echo "=== All Services Running ==="
echo ""
echo "📊 Dashboard:     http://localhost:5173"
echo "🔧 Orchestrator:  http://localhost:3000"
echo "🌐 Test App:      http://localhost:3001"
echo "🤖 Toad Server:   http://localhost:8000"
echo "💻 Terminal:      http://localhost:7681"
echo "🖥️  Browser available for automation on port 9222"
echo ""
echo "📁 Logs location: ./logs/"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Trap to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down all services..."
    kill $UI_PID $TOAD_PID $TTYD_PID $TEST_APP_PID $ORCHESTRATOR_PID $BROWSER_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Wait for any process to exit
wait