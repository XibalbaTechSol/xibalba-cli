import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Terminal as TerminalIcon, FileCode } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import ScriptEditor from '../Scripts/ScriptEditor';

interface Tab {
    id: string;
    type: 'terminal' | 'scripts';
    name: string;
}

const BashTerminal: React.FC = () => {
    const [tabs, setTabs] = useState<Tab[]>([
        { id: 'primary-session', type: 'terminal', name: 'Terminal' },
        { id: 'scripts-tab', type: 'scripts', name: 'Scripts' }
    ]);
    const [activeTabId, setActiveTabId] = useState<string>('primary-session');

    const handleAddTerminal = () => {
        const id = `terminal-${Date.now()}`;
        setTabs([...tabs, { id, type: 'terminal', name: `Terminal ${tabs.filter(t => t.type === 'terminal').length}` }]);
        setActiveTabId(id);
    };

    const handleRemoveTab = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (tabs.length <= 1) return;
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs[0].id);
        }
    };

    return (
        <div className="h-full w-full bg-black flex flex-col overflow-hidden">
            {/* Tab Bar - Now using Nord colors and adjusted layout */}
            <div className="h-9 bg-[#3B4252] border-b border-[#434C5E] flex items-center px-4 gap-2 overflow-x-auto no-scrollbar shrink-0 justify-end">
                <div className="mr-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#A3BE8C] animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-[#D8DEE9] tracking-widest">Local Terminal</span>
                </div>
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-t-md cursor-pointer transition-colors h-full group ${activeTabId === tab.id
                            ? 'bg-[#2E3440] text-[#88C0D0] border-t-2 border-[#88C0D0]'
                            : 'text-[#D8DEE9] hover:bg-[#434C5E] hover:text-[#ECEFF4]'
                            }`}
                    >
                        {tab.type === 'terminal' ? <TerminalIcon size={14} /> : <FileCode size={14} />}
                        <span className="text-xs font-mono whitespace-nowrap">{tab.name}</span>
                        {tabs.length > 1 && (
                            <button
                                onClick={(e) => handleRemoveTab(tab.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#BF616A] rounded text-[#D8DEE9] hover:text-white transition-all"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={handleAddTerminal}
                    className="p-1.5 hover:bg-[#434C5E] text-[#D8DEE9] hover:text-[#88C0D0] rounded-md transition-colors ml-1"
                    title="Open New Terminal"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Content View */}
            <div className="flex-1 relative bg-black">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`absolute inset-0 w-full h-full ${activeTabId === tab.id ? 'block' : 'hidden'}`}
                    >
                        {tab.type === 'terminal' ? (
                            <XtermInstance sessionId={tab.id} />
                        ) : (
                            <ScriptEditor />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const XtermInstance: React.FC<{ sessionId: string }> = ({ sessionId }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalInstance = useRef<Terminal | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 13,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#000000',
                foreground: '#ffffff',
                cursor: '#ffffff',
            },
            allowProposedApi: true
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);

        // Use ResizeObserver for more reliable fitting
        const resizeObserver = new ResizeObserver(() => {
            if (terminalRef.current?.offsetWidth && terminalRef.current?.offsetHeight) {
                fitAddon.fit();
            }
        });
        resizeObserver.observe(terminalRef.current);

        terminalInstance.current = term;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${protocol}//${window.location.hostname}:3000/ws/terminal/${sessionId}`);
        socketRef.current = socket;

        socket.onopen = () => {
            const dims = { type: 'resize', rows: term.rows, cols: term.cols };
            socket.send(JSON.stringify(dims));
        };

        socket.onmessage = (event) => {
            term.write(event.data);
        };

        socket.onclose = () => {
            // Avoid writing if term is disposed
            try {
                term.write('\r\n\x1b[31mTerminal connection closed.\x1b[0m\r\n');
            } catch (e) { }
        };

        term.onData((data) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'input', data }));
            }
        });

        term.onResize((size) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'resize', rows: size.rows, cols: size.cols }));
            }
        });

        return () => {
            resizeObserver.disconnect();
            socket.close();
            term.dispose();
        };
    }, [sessionId]);

    return <div className="h-full w-full p-2" ref={terminalRef} />;
};

export default BashTerminal;
