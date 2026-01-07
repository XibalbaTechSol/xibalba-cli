# Implementation Plan - Xibalba

## Goal
A modern replacement for VS Code / Google Antigravity that runs a dashboard managing multiple unmodified Toad CLI instances and a fully debuggable Chromium browser.

## Status
- [x] Fresh clone of Toad CLI.
- [x] React UI scaffolding with `ChromiumFrame` and `CLIInstance`.
- [x] Unified `start.sh` for full environment launch.
- [x] DevTools integration (port 9222) in the UI.
- [x] **Antigravity Mirror:** Toad CLI agents now automatically receive instructions to maintain `IMPLEMENTATION_PLAN.md`, Task Lists, and `README.md`.

## Roadmap

### 1. Parallel Toad Instances
- [x] Implement a lightweight backend (FastAPI) to manage multiple Toad processes.
- [x] Dynamically allocate ports for each `toad serve` instance.
- [x] UI: Add a sidebar to "Spawn New Toad" and switch between them.

### 2. Browser Advanced Features
- [ ] UI: Add navigation bar (URL input, Back, Forward, Refresh) for the Chromium instance.
- [ ] UI: Integrate Playwright/Puppeteer script runner to automate the browser from the dashboard.

### 3. Polish
- [ ] Use `xterm.js` or improved iframe handling for the CLI to ensure responsive resizing.
- [ ] Persistent session storage for browser and CLI state.