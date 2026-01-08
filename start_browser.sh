#!/bin/bash

# Configuration
CHROME_DEBUG_PORT="9222"

echo "Starting Headless Chrome..."

# Cleanup existing Chrome processes
pkill -9 -f "remote-debugging-port=$CHROME_DEBUG_PORT" || true
sleep 1

# Find a suitable Chrome executable
if command -v google-chrome >/dev/null 2>&1; then
    CHROME_EXEC="google-chrome"
elif command -v chromium-browser >/dev/null 2>&1; then
    CHROME_EXEC="chromium-browser"
elif [ -f "./chromium/chrome" ]; then
    CHROME_EXEC="./chromium/chrome"
else
    echo "Error: No suitable Chrome or Chromium executable found."
    exit 1
fi

echo "Using Chrome executable: $CHROME_EXEC"

# Start headless Chrome with remote debugging
$CHROME_EXEC \
    --headless \
    --no-sandbox \
    --disable-gpu \
    --remote-debugging-port=$CHROME_DEBUG_PORT \
    --remote-debugging-address=0.0.0.0 \
    --user-data-dir="$PWD/.chrome-profile" \
    --disable-dev-shm-usage \
    --no-first-run \
    http://localhost:3001 > chrome.log 2>&1 &

echo "Starting x11vnc..."
env -u WAYLAND_DISPLAY -u XDG_SESSION_TYPE /usr/bin/x11vnc -display $DISPLAY_NUM -forever -nopw -shared -bg -o x11vnc.log 2>&1
X11VNC_PID=$!

echo "Headless Chrome started with PID $CHROME_PID on debug port $CHROME_DEBUG_PORT."
echo "Browser is ready for automation."

wait $CHROME_PID
