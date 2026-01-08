import asyncio
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import subprocess
import os
import sys
import signal
import platform
import json
import uuid
import base64
from pydantic import BaseModel
from typing import Dict, Optional, List
from playwright.async_api import async_playwright, Page, Browser

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---
class InstanceRequest(BaseModel):
    port: int

class PathRequest(BaseModel):
    path: str

class NavigateRequest(BaseModel):
    url: str

class ControlRequest(BaseModel):
    action: str

# --- Global State ---
instances: Dict[int, subprocess.Popen] = {}
playwright_instance = None
browser: Optional[Browser] = None
page: Optional[Page] = None

# Screenshot session data
sessions: Dict[str, List[bytes]] = {}
current_session_id: Optional[str] = None

# WebSocket connections for console
console_websockets: List[WebSocket] = []

# --- Helper Functions ---
async def get_page() -> Page:
    """Connects to the browser and returns the primary page."""
    global playwright_instance, browser, page
    if page and not page.is_closed():
        return page

    if not playwright_instance:
        playwright_instance = await async_playwright().start()

    if not browser or not browser.is_connected():
        try:
            browser = await playwright_instance.chromium.connect_over_cdp("http://localhost:9222")
            browser.on("disconnected", lambda: print("Browser disconnected."))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not connect to browser: {e}")

    try:
        # Get the first page if it exists, otherwise create one
        contexts = browser.contexts
        if contexts and contexts[0].pages:
            page = contexts[0].pages[0]
        else:
            page = await browser.new_page()
        
        # Attach console listener if not already attached
        if not hasattr(page, "_console_listener_attached"):
             page.on("console", handle_console_message)
             page._console_listener_attached = True

        return page
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not get page: {e}")

async def handle_console_message(msg):
    """Callback to forward console messages to connected WebSockets."""
    message = f"[{msg.type()}] {msg.text()}"
    # Use asyncio.gather to send to all websockets concurrently
    await asyncio.gather(*[ws.send_text(message) for ws in console_websockets])

async def capture_screenshot_if_recording():
    """Captures a screenshot if a recording session is active."""
    if current_session_id:
        p = await get_page()
        screenshot_bytes = await p.screenshot()
        sessions[current_session_id].append(screenshot_bytes)


# --- FastAPI Lifecycle Events ---
@app.on_event("startup")
async def startup_event():
    """Initialize browser connection on startup."""
    try:
        await get_page()
        print("Successfully connected to browser on startup.")
    except Exception as e:
        print(f"Failed to connect to browser on startup: {e}")

# --- API Endpoints ---

# Agent Instance Management
@app.post("/spawn")
def spawn_instance(req: InstanceRequest):
    if req.port in instances and instances[req.port].poll() is None:
        return {"status": "already_running", "port": req.port}
    
    cmd = ["uv", "run", "toad", "serve", "--port", str(req.port), "--host", "0.0.0.0"]
    cwd = os.path.join(os.getcwd(), "toad") if "toad" in os.listdir() else os.getcwd()
    proc = subprocess.Popen(cmd, cwd=cwd, start_new_session=True)
    instances[req.port] = proc
    return {"status": "started", "port": req.port, "pid": proc.pid}

@app.delete("/kill/{port}")
def kill_instance(port: int):
    if port in instances:
        os.killpg(os.getpgid(instances[port].pid), signal.SIGTERM)
        del instances[port]
        return {"status": "killed"}
    return {"status": "not_found"}

# Browser Control
@app.post("/browser/navigate")
async def browser_navigate(req: NavigateRequest):
    p = await get_page()
    await p.goto(req.url)
    await capture_screenshot_if_recording()
    return {"status": "success"}

@app.get("/browser/dom")
async def browser_dom():
    p = await get_page()
    content = await p.content()
    return Response(content=content, media_type="text/plain")

@app.get("/browser/info")
async def browser_info():
    try:
        p = await get_page()
        return {"url": p.url, "title": await p.title()}
    except Exception as e:
        return {"url": "error", "error": str(e)}

# Screenshot Session Management
@app.post("/browser/session/start")
async def start_session():
    global current_session_id
    current_session_id = str(uuid.uuid4())
    sessions[current_session_id] = []
    await capture_screenshot_if_recording()  # Capture initial state
    return {"session_id": current_session_id}

@app.post("/browser/session/capture")
async def capture_screenshot_endpoint():
    if not current_session_id:
        raise HTTPException(status_code=400, detail="No active session")

    await capture_screenshot_if_recording()
    return {"status": "captured", "session_id": current_session_id, "frames": len(sessions[current_session_id])}

@app.post("/browser/session/end")
async def end_session():
    global current_session_id
    if not current_session_id:
        return {"status": "no_active_session"}
    session_id = current_session_id
    current_session_id = None
    return {"status": "ended", "session_id": session_id}

@app.get("/browser/session/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Return images as a list of base64 encoded strings
    images_base64 = [base64.b64encode(img).decode('utf-8') for img in sessions[session_id]]
    return {"session_id": session_id, "images": images_base64}

# Console WebSocket
@app.websocket("/browser/console")
async def console_websocket(websocket: WebSocket):
    await websocket.accept()
    console_websockets.append(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        console_websockets.remove(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
