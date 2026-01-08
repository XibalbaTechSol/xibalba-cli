#!/bin/bash

# Configuration
DISPLAY_NUM=":101"
RESOLUTION="1280x720x24"
WEB_PORT="6080"
CHROME_DEBUG_PORT="9222"

echo "Starting Browser Environment..."

# Cleanup
echo "Cleaning up..."
pkill -9 -x Xvfb || true
pkill -9 -f "remote-debugging-port=$CHROME_DEBUG_PORT" || true
pkill -9 -x x11vnc || true
pkill -9 -f "websockify.*$WEB_PORT" || true
rm -f /tmp/.X101-lock /tmp/.X11-unix/X101 2>/dev/null

sleep 1

echo "Starting Xvfb on $DISPLAY_NUM..."
Xvfb $DISPLAY_NUM -screen 0 $RESOLUTION -ac +extension GLX +render -noreset > xvfb.log 2>&1 &
Xvfb_PID=$!
sleep 3

echo "Starting Chromium..."
export DISPLAY=$DISPLAY_NUM
./chromium/chrome \
    --no-sandbox \
    --disable-gpu \
    --remote-debugging-port=$CHROME_DEBUG_PORT \
    --remote-debugging-address=0.0.0.0 \
    --user-data-dir="$PWD/.chrome-profile" \
    --disable-dev-shm-usage \
    --no-first-run \
    http://localhost:3001 > chrome.log 2>&1 &
CHROME_PID=$!
sleep 2

echo "Starting x11vnc..."
env -u WAYLAND_DISPLAY -u XDG_SESSION_TYPE /usr/bin/x11vnc -display $DISPLAY_NUM -forever -nopw -shared -bg -o x11vnc.log 2>&1
X11VNC_PID=$!

echo "Starting websockify..."
websockify --web ./novnc $WEB_PORT 127.0.0.1:5900 > websockify.log 2>&1 &
WEBSOCK_PID=$!

echo "Browser ready."
wait