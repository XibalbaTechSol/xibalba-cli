import asyncio
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import subprocess
import os
import sys
import signal
import platform
import pty
import fcntl
import termios
import struct
import json
from pydantic import BaseModel
from typing import Dict, Optional, List
from playwright.async_api import async_playwright

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InstanceRequest(BaseModel):
    port: int

class PathRequest(BaseModel):
    path: str

class NavigateRequest(BaseModel):
    url: str

class ControlRequest(BaseModel):
    action: str # back, forward, reload

# Track running processes: port -> Popen object
instances: Dict[int, subprocess.Popen] = {}
terminals: Dict[int, subprocess.Popen] = {}

class TerminalRequest(BaseModel):
    port: int
    cwd: Optional[str] = None

@app.post("/spawn")
def spawn_instance(req: InstanceRequest):
    # ... existing implementation ...
    port = req.port
    if port in instances:
        if instances[port].poll() is None:
            return {"status": "already_running", "port": port}
        else:
            del instances[port]

    cmd = ["uv", "run", "toad", "serve", "--port", str(port), "--host", "0.0.0.0"]
    cwd = os.getcwd() if os.path.basename(os.getcwd()) == "toad" else os.path.join(os.getcwd(), "toad")
    
    try:
        proc = subprocess.Popen(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True)
        instances[port] = proc
        return {"status": "started", "port": port, "pid": proc.pid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/terminal/spawn")
def spawn_terminal(req: TerminalRequest):
    port = req.port
    if port in terminals:
        if terminals[port].poll() is None:
            return {"status": "already_running", "port": port}
        else:
            del terminals[port]

    target_cwd = req.cwd or os.getcwd()
    # ttyd --port 7681 --writable -t fontSize=14 -d test-app bash
    cmd = [
        "ttyd",
        "--port", str(port),
        "--writable",
        "-t", "fontSize=14",
        "-d", target_cwd,
        "bash"
    ]
    
    try:
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True)
        terminals[port] = proc
        return {"status": "started", "port": port, "pid": proc.pid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/terminal/kill/{port}")
def kill_terminal(port: int):
    if port in terminals:
        proc = terminals[port]
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        del terminals[port]
        return {"status": "killed", "port": port}
    return {"status": "not_found"}

@app.get("/terminals")
def list_terminals():
    active = {}
    for p, proc in list(terminals.items()):
        if proc.poll() is None:
            active[p] = proc.pid
        else:
            del terminals[p]
    return active

# Playwright globals
browser_context = None
playwright_instance = None

class TerminalSession:
    def __init__(self, session_id: str, cmd=["bash"], cwd=None):
        self.session_id = session_id
        self.fd = None
        self.pid = None
        self.cmd = cmd
        self.cwd = cwd
        self.websockets: List[WebSocket] = []

    def start(self):
        if self.fd is not None:
            return
        
        self.pid, self.fd = pty.fork()
        if self.pid == 0:  # Child process
            if self.cwd:
                os.chdir(self.cwd)
            # Set environment variables if needed
            os.environ["TERM"] = "xterm-256color"
            os.execvp(self.cmd[0], self.cmd)
        else:  # Parent process
            # Set the terminal to non-blocking mode
            fl = fcntl.fcntl(self.fd, fcntl.F_GETFL)
            fcntl.fcntl(self.fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)

    def write(self, data: str):
        if self.fd is not None:
            os.write(self.fd, data.encode())

    def resize(self, rows: int, cols: int):
        if self.fd is not None:
            winsize = struct.pack("HHHH", rows, cols, 0, 0)
            fcntl.ioctl(self.fd, termios.TIOCSWINSZ, winsize)

    async def read_loop(self):
        while self.fd is not None:
            try:
                # Use asyncio for non-blocking read
                loop = asyncio.get_event_loop()
                data = await loop.run_in_executor(None, self._read_from_fd)
                if data:
                    # Broadcast to all connected websockets
                    disconnected = []
                    for ws in self.websockets:
                        try:
                            await ws.send_text(data.decode(errors='replace'))
                        except:
                            disconnected.append(ws)
                    for ws in disconnected:
                        if ws in self.websockets:
                            self.websockets.remove(ws)
                else:
                    await asyncio.sleep(0.01)
            except Exception as e:
                print(f"Read error: {e}")
                break

    def _read_from_fd(self):
        try:
            return os.read(self.fd, 4096)
        except (OSError, IOError):
            return None

    def stop(self):
        if self.pid:
            try:
                os.kill(self.pid, signal.SIGTERM)
            except:
                pass
        if self.fd:
            os.close(self.fd)
        self.fd = None
        self.pid = None

terminal_sessions: Dict[str, TerminalSession] = {}

async def get_browser_page():
    global browser_context, playwright_instance
    if not playwright_instance:
        playwright_instance = await async_playwright().start()
    
    if not browser_context:
        try:
            # Connect to the existing browser
            browser = await playwright_instance.chromium.connect_over_cdp("http://localhost:9222")
            # We don't use contexts in connect_over_cdp the same way, we get a browser object
            # which already has pages if it was launched with pages.
            # However, for control, we can just use the first page.
            pages = browser.contexts[0].pages if browser.contexts else []
            if not pages:
                page = await browser.new_page()
            else:
                page = pages[0]
            return page
        except Exception as e:
            print(f"Error connecting to browser: {e}")
            return None
    return None # Simplified for now

@app.post("/spawn")
def spawn_instance(req: InstanceRequest):
    # ... existing implementation ...
    port = req.port
    if port in instances:
        if instances[port].poll() is None:
            return {"status": "already_running", "port": port}
        else:
            del instances[port]

    cmd = ["uv", "run", "toad", "serve", "--port", str(port), "--host", "0.0.0.0"]
    cwd = os.getcwd() if os.path.basename(os.getcwd()) == "toad" else os.path.join(os.getcwd(), "toad")
    
    try:
        proc = subprocess.Popen(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True)
        instances[port] = proc
        return {"status": "started", "port": port, "pid": proc.pid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/kill/{port}")
def kill_instance(port: int):
    if port in instances:
        proc = instances[port]
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        del instances[port]
        return {"status": "killed", "port": port}
    return {"status": "not_found"}

@app.post("/pause/{port}")
def pause_instance(port: int):
    if port in instances:
        proc = instances[port]
        if proc.poll() is None:
            os.kill(proc.pid, signal.SIGSTOP)
            return {"status": "paused", "port": port}
    return {"status": "not_found_or_dead"}

@app.post("/resume/{port}")
def resume_instance(port: int):
    if port in instances:
        proc = instances[port]
        if proc.poll() is None:
            os.kill(proc.pid, signal.SIGCONT)
            return {"status": "resumed", "port": port}
    return {"status": "not_found_or_dead"}

@app.post("/open-folder")
def open_folder(req: PathRequest):
    path = req.path
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Path not found")
    try:
        if platform.system() == "Linux":
            subprocess.Popen(["xdg-open", path])
        elif platform.system() == "Darwin":
            subprocess.Popen(["open", path])
        elif platform.system() == "Windows":
            os.startfile(path)
        return {"status": "opened", "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/instances")
def list_instances():
    active = {}
    for p, proc in list(instances.items()):
        if proc.poll() is None:
            active[p] = proc.pid
        else:
            del instances[p]
    return active

class ScriptRequest(BaseModel):
    code: str

# Browser Endpoints
@app.post("/browser/navigate")
async def browser_navigate(req: NavigateRequest):
    async with async_playwright() as p:
        try:
            browser = await p.chromium.connect_over_cdp("http://localhost:9222")
            page = browser.contexts[0].pages[0] if browser.contexts and browser.contexts[0].pages else await browser.new_page()
            await page.goto(req.url)
            return {"status": "success", "url": req.url}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/browser/control")
async def browser_control(req: ControlRequest):
    async with async_playwright() as p:
        try:
            browser = await p.chromium.connect_over_cdp("http://localhost:9222")
            page = browser.contexts[0].pages[0] if browser.contexts and browser.contexts[0].pages else await browser.new_page()
            if req.action == "back":
                await page.go_back()
            elif req.action == "forward":
                await page.go_forward()
            elif req.action == "reload":
                await page.reload()
            return {"status": "success", "action": req.action}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/browser/script")
async def browser_script(req: ScriptRequest):
    # This is powerful/dangerous. In this POC, we allow executing arbitrary code.
    # The code receives 'page' as a variable.
    async with async_playwright() as p:
        try:
            browser = await p.chromium.connect_over_cdp("http://localhost:9222")
            page = browser.contexts[0].pages[0] if browser.contexts and browser.contexts[0].pages else await browser.new_page()
            
            # Context for execution
            # We wrap the code in an async function
            exec_globals = {"page": page, "asyncio": asyncio}
            wrapped_code = f"async def _run_script():\n" + "\n".join([f"    {line}" for line in req.code.splitlines()])
            exec(wrapped_code, exec_globals)
            result = await exec_globals["_run_script"]()
            
            return {"status": "success", "result": str(result)}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/browser/info")
async def browser_info():
    async with async_playwright() as p:
        try:
            browser = await p.chromium.connect_over_cdp("http://localhost:9222")
            page = browser.contexts[0].pages[0] if browser.contexts and browser.contexts[0].pages else None
            if page:
                return {"url": page.url, "title": await page.title()}
            return {"url": "", "title": ""}
        except Exception as e:
            return {"url": "error", "error": str(e)}

@app.get("/system-info")
def system_info():
    return {
        "cwd": os.getcwd(),
        "platform": platform.system(),
        "python": sys.version
    }

# Terminal WebSocket
@app.websocket("/ws/terminal/{session_id}")
async def terminal_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    
    if session_id not in terminal_sessions:
        # For now, default to bash in test-app if it exists
        cwd = os.path.join(os.getcwd(), "test-app")
        if not os.path.exists(cwd):
            cwd = os.getcwd()
        session = TerminalSession(session_id, cwd=cwd)
        session.start()
        terminal_sessions[session_id] = session
        asyncio.create_task(session.read_loop())
    else:
        session = terminal_sessions[session_id]
    
    session.websockets.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg["type"] == "input":
                session.write(msg["data"])
            elif msg["type"] == "resize":
                session.resize(msg["rows"], msg["cols"])
    except WebSocketDisconnect:
        if websocket in session.websockets:
            session.websockets.remove(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket in session.websockets:
            session.websockets.remove(websocket)

# Script Management
SCRIPTS_DIR = os.path.join(os.getcwd(), "scripts")
if not os.path.exists(SCRIPTS_DIR):
    os.makedirs(SCRIPTS_DIR)

class ScriptSaveRequest(BaseModel):
    name: str
    code: str

@app.get("/scripts")
def list_scripts():
    scripts = []
    for f in os.listdir(SCRIPTS_DIR):
        if f.endswith(".py") or f.endswith(".sh"):
            scripts.append(f)
    return scripts

@app.post("/scripts/save")
def save_script(req: ScriptSaveRequest):
    path = os.path.join(SCRIPTS_DIR, req.name)
    with open(path, "w") as f:
        f.write(req.code)
    return {"status": "saved", "name": req.name}

@app.get("/scripts/{name}")
def get_script(name: str):
    path = os.path.join(SCRIPTS_DIR, name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Script not found")
    with open(path, "r") as f:
        return {"code": f.read()}

@app.post("/scripts/run")
async def run_script(name: str, session_id: Optional[str] = None):
    path = os.path.join(SCRIPTS_DIR, name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Script not found")
    
    if session_id and session_id in terminal_sessions:
        session = terminal_sessions[session_id]
        if name.endswith(".py"):
            session.write(f"python3 {path}\n")
        else:
            session.write(f"bash {path}\n")
        return {"status": "running", "output": "piped to terminal"}
    else:
        # Run and return output
        cmd = ["python3", path] if name.endswith(".py") else ["bash", path]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        return {"status": "completed", "stdout": proc.stdout, "stderr": proc.stderr}

@app.get("/files/read")
async def read_file(path: str):
    """Read file contents"""
    try:
        file_path = os.path.expanduser(path)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {"content": content, "path": path}
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File is not a text file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
