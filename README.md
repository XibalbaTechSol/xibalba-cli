# Xibalba CLI

**AI-Powered Development Environment** - A comprehensive CLI framework integrating Toad AI agent with Gemini, browser automation, and an intuitive UI dashboard.

## Features

- 🤖 **Toad AI Integration** - Pre-configured with Google Gemini CLI
- 🎨 **Modern UI Dashboard** - React-based interface with Nord color scheme
- 🌐 **Browser Automation** - Headless Chrome with VNC access
- 💻 **Integrated Terminal** - Web-based terminal with ttyd
- 📝 **Artifact Viewer** - Markdown renderer for documentation
- ⚙️ **Orchestrator Service** - Central API for component management

## Quick Start

```bash
# Start all services
./start.sh
```

**Access Points:**
- UI Dashboard: http://localhost:5173
- Toad Server: http://localhost:8000
- Test App: http://localhost:3001
- Browser VNC: http://localhost:6080/vnc.html
- Terminal: http://localhost:7681

## Configuration

### Gemini API Key
Create a `.env` file in the project root:
```bash
GEMINI_API_KEY=your-api-key-here
```

Get your key from: https://aistudio.google.com/apikey

### Services

The `start.sh` script launches 6 services:
1. **Browser** - Chrome with VNC (ports 6080, 9222)
2. **Orchestrator** - Management API (port 3000)
3. **Test App** - React workspace (port 3001)
4. **Toad Server** - AI agent (port 8000)
5. **Terminal** - ttyd bash session (port 7681)
6. **UI Dashboard** - Main interface (port 5173)

## Project Structure

```
xibalba-cli/
├── start.sh              # Main startup script
├── orchestrator.py       # Central API service
├── ui/                   # React dashboard
│   └── src/
│       ├── components/   # UI components
│       └── App.tsx      
├── test-app/            # Development workspace
├── toad/                # Toad CLI framework (submodule)
└── chromium/            # Headless browser binaries
```

## Technology Stack

- **Backend:** Python (FastAPI), Toad CLI framework
- **Frontend:** React + TypeScript, Vite, Tailwind CSS
- **AI:** Google Gemini CLI with ACP protocol
- **Browser:** Chromium + VNC + noVNC
- **Terminal:** ttyd, xterm.js

## Development

### Requirements
- Python 3.11+
- Node.js 18+
- uv (Python package installer)
- ttyd

### Build UI
```bash
cd ui
npm install
npm run dev
```

## License

GPL-3.0 License

## Author

Xibalba Solutions
https://github.com/XibalbaTechSol
# xibalba-cli
