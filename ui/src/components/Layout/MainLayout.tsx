import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BashTerminal from '../Terminal/BashTerminal';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { LayoutTemplate, Terminal, X, ArrowLeft, ArrowRight, RotateCw, Globe } from 'lucide-react';

const ORCHESTRATOR_URL = "http://localhost:3000";

interface MainLayoutProps {
    instances: Instance[];
    selectedId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onRemove: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
    onOpenFolder: () => void;
}

import Sidebar from './Sidebar';
import ArtifactViewer from './ArtifactViewer';
import CodeEditor from '../Editor/CodeEditor';
import HeaderPane from './HeaderPane';
import ScriptEditor from '../Editor/ScriptEditor';
import CLIInstance from '../CLIInstance';
import { Instance } from '../InstanceList';
import PlaybackViewer from '../PlaybackViewer';
import DevTools from '../DevTools';

const MainLayout: React.FC<MainLayoutProps> = (props) => {
    const [showTerminal, setShowTerminal] = useState(false);
    const [showInbox, setShowInbox] = useState(false);
    const [viewMode, setViewMode] = useState<'artifacts' | 'editor' | 'browser'>('browser');
    const [currentFilePath, setCurrentFilePath] = useState<string>('/home/xibalbasolutions/Desktop/xibalba-cli/IMPLEMENTATION_PLAN.md');
    const [currentFileContent, setCurrentFileContent] = useState<string>('');
    const [inputValue, setInputValue] = useState('http://localhost:3001');
    const [browserTab, setBrowserTab] = useState<'playback' | 'devtools'>('playback');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);

    const handleStartRecording = async () => {
        try {
            const response = await axios.post(`${ORCHESTRATOR_URL}/browser/session/start`);
            setSessionId(response.data.session_id);
            setIsRecording(true);
            setScreenshotUrls([]); // Clear previous screenshots
        } catch (error) {
            console.error("Failed to start recording session:", error);
        }
    };

    const handleStopRecording = async () => {
        try {
            await axios.post(`${ORCHESTRATOR_URL}/browser/session/end`);
            setIsRecording(false);
            if (sessionId) {
                const response = await axios.get(`${ORCHESTRATOR_URL}/browser/session/${sessionId}`);
                const imageUrls = response.data.images.map((base64: string) => `data:image/png;base64,${base64}`);
                setScreenshotUrls(imageUrls);
            }
        } catch (error) {
            console.error("Failed to stop recording session:", error);
        }
    };

    const selectedInstance = props.instances.find(i => i.id === props.selectedId);

    useEffect(() => {
        fetchBrowserInfo();
        const interval = setInterval(fetchBrowserInfo, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchBrowserInfo = async () => {
        try {
            const res = await axios.get(`${ORCHESTRATOR_URL}/browser/info`);
            if (res.data.url && res.data.url !== 'error') {
                setInputValue(res.data.url);
            }
        } catch (err) {
            console.error("Failed to fetch browser info", err);
        }
    };

    const handleNavigate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue) return;

        setIsLoading(true);
        try {
            let targetUrl = inputValue;
            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                targetUrl = 'https://' + targetUrl;
            }
            await axios.post(`${ORCHESTRATOR_URL}/browser/navigate`, { url: targetUrl });
        } catch (err) {
            console.error("Navigation failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleControl = async (action: 'back' | 'forward' | 'reload') => {
        try {
            await axios.post(`${ORCHESTRATOR_URL}/browser/control`, { action });
            fetchBrowserInfo();
        } catch (err) {
            console.error(`Control action ${action} failed`, err);
        }
    };

    const handleOpenFile = async (path: string) => {
        setCurrentFilePath(path);
        // If it's an artifact or image, show artifact viewer
        if (path.includes('.md') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            setViewMode('artifacts');
        } else {
            // Fetch file content for editor
            try {
                const res = await axios.get(`http://localhost:3000/files/read?path=${encodeURIComponent(path)}`);
                setCurrentFileContent(res.data.content);
                setViewMode('editor');
            } catch (err) {
                console.error("Failed to read file", err);
                setViewMode('artifacts'); // Fallback
            }
        }
    };

    return (
        <div className="h-screen w-screen bg-[#2E3440] text-[#D8DEE9] overflow-hidden font-sans flex flex-col text-sm">
            <HeaderPane
                onToggleTerminal={() => setShowTerminal(!showTerminal)}
                onToggleEditor={() => {
                    if (viewMode === 'editor') setViewMode('browser');
                    else setViewMode('editor');
                }}
                onToggleBrowser={() => {
                    setViewMode('browser');
                }}
                onToggleInbox={() => setShowInbox(!showInbox)}
                viewMode={viewMode}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-[280px] flex flex-col shrink-0">
                    <Sidebar
                        instances={props.instances}
                        selectedId={props.selectedId}
                        onSelect={props.onSelect}
                        onAdd={props.onAdd}
                        onOpenFolder={props.onOpenFolder}
                        onOpenFile={handleOpenFile}
                    />
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <PanelGroup direction="vertical" className="flex-1">
                        {/* Top Pane: Split View (Toad | Browser/Editor/Artifacts) */}
                        <Panel defaultSize={70} minSize={30} className="flex flex-col relative bg-[#2E3440]">
                            <PanelGroup direction="horizontal" className="h-full w-full">
                                {/* Left: Toad CLI */}
                                <Panel defaultSize={40} minSize={20} className="flex flex-col border-r border-[#3B4252]">
                                    <div className="h-9 bg-[#3B4252] border-b border-[#434C5E] flex items-center px-4 justify-between flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Terminal size={14} className="text-[#88C0D0]" />
                                            <span className="text-[11px] font-bold text-[#D8DEE9] uppercase tracking-widest">Agent Console</span>
                                        </div>
                                        {selectedInstance && (
                                            <span className="text-[11px] bg-[#88C0D0]/10 text-[#88C0D0] px-2 py-0.5 rounded-full border border-[#88C0D0]/20">{selectedInstance.name}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 relative bg-[#2E3440]">
                                        {selectedInstance ? (
                                            <CLIInstance url={selectedInstance.url} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-[#4C566A] flex-col gap-2">
                                                <LayoutTemplate size={32} />
                                                <span>Select an active agent instance</span>
                                            </div>
                                        )}
                                    </div>
                                </Panel>

                                <PanelResizeHandle className="w-[2px] bg-[#3B4252] hover:bg-[#88C0D0] transition-colors cursor-col-resize" />

                                {/* Right: Variable View */}
                                <Panel defaultSize={60} minSize={20} className="flex flex-col overflow-hidden">
                                    {/* Browser Navigation Bar - Only shown for browser view */}
                                    {viewMode === 'browser' && (
                                        <div className="h-10 bg-[#2E3440] border-b border-[#3B4252] flex items-center px-4 shrink-0 gap-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleControl('back')} className="p-1.5 hover:bg-[#3B4252] rounded-md text-[#D8DEE9] hover:text-[#ECEFF4] transition-colors">
                                                    <ArrowLeft size={16} />
                                                </button>
                                                <button onClick={() => handleControl('forward')} className="p-1.5 hover:bg-[#3B4252] rounded-md text-[#D8DEE9] hover:text-[#ECEFF4] transition-colors">
                                                    <ArrowRight size={16} />
                                                </button>
                                                <button onClick={() => handleControl('reload')} className="p-1.5 hover:bg-[#3B4252] rounded-md text-[#D8DEE9] hover:text-[#ECEFF4] transition-colors">
                                                    <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                                </button>
                                            </div>

                                            <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-[#3B4252] rounded-md border border-[#434C5E] px-3 py-1 gap-2 focus-within:border-[#88C0D0] transition-colors">
                                                <Globe size={14} className="text-[#D8DEE9]" />
                                                <input
                                                    type="text"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    placeholder="Enter URL..."
                                                    className="bg-transparent border-none outline-none text-[12px] text-[#ECEFF4] w-full font-mono placeholder-[#4C566A]"
                                                />
                                            </form>
                                        </div>
                                    )}

                                    {/* Browser/Editor Tab Headers */}
                                    {viewMode === 'browser' && (
                                        <div className="h-9 bg-[#3B4252] border-b border-[#434C5E] flex items-center px-4 gap-4 flex-shrink-0">
                                            <button onClick={() => setBrowserTab('playback')} className={`text-xs font-bold ${browserTab === 'playback' ? 'text-[#88C0D0]' : 'text-[#D8DEE9]'}`}>Playback</button>
                                            <button onClick={() => setBrowserTab('devtools')} className={`text-xs font-bold ${browserTab === 'devtools' ? 'text-[#88C0D0]' : 'text-[#D8DEE9]'}`}>DevTools</button>
                                            <div className="flex-grow"></div>
                                            {!isRecording ? (
                                                <button onClick={handleStartRecording} className="text-xs font-bold text-[#A3BE8C]">Start Recording</button>
                                            ) : (
                                                <button onClick={handleStopRecording} className="text-xs font-bold text-[#BF616A]">Stop Recording</button>
                                            )}
                                        </div>
                                    )}

                                    {/* Content Area */}
                                    <div className="flex-1 overflow-auto">
                                        {viewMode === 'browser' ? (
                                            browserTab === 'playback' ? (
                                                <PlaybackViewer screenshotUrls={screenshotUrls} />
                                            ) : (
                                                <DevTools />
                                            )
                                        ) : viewMode === 'editor' && !currentFilePath ? (
                                            <ScriptEditor />
                                        ) : viewMode === 'editor' ? (
                                            <CodeEditor
                                                filePath={currentFilePath}
                                                content={currentFileContent}
                                                onChange={setCurrentFileContent}
                                                onClose={() => setViewMode('artifacts')}
                                            />
                                        ) : (
                                            <ArtifactViewer filePath={currentFilePath} />
                                        )}
                                    </div>
                                </Panel>
                            </PanelGroup>
                        </Panel>

                        {showTerminal && (
                            <>
                                <PanelResizeHandle className="h-[2px] bg-[#3B4252] hover:bg-[#88C0D0] transition-colors cursor-row-resize" />
                                <Panel defaultSize={30} minSize={10} maxSize={60} className="bg-[#2E3440]">
                                    <div className="h-[calc(100%)]">
                                        <BashTerminal />
                                    </div>
                                </Panel>
                            </>
                        )}
                    </PanelGroup>
                </div>
            </div>
            {showInbox && (
                <div className="absolute top-12 right-12 w-96 bg-[#3B4252] border border-[#434C5E] rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]">
                    <div className="p-3 border-b border-[#434C5E] flex items-center justify-between bg-[#2E3440]">
                        <span className="text-xs font-bold text-[#88C0D0] uppercase tracking-tight">Recent Agent Activity</span>
                        <X size={14} className="text-[#D8DEE9] hover:text-[#ECEFF4] cursor-pointer" onClick={() => setShowInbox(false)} />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="space-y-1">
                            <div className="text-[11px] text-[#4C566A]">2 minutes ago</div>
                            <div className="p-2 bg-[#434C5E] rounded text-xs text-[#ECEFF4]">
                                <span className="text-[#88C0D0] font-bold">Primary Agent:</span> I've finished the UI implementation. Please review the changes in <span className="underline cursor-pointer">walkthrough.md</span>.
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[11px] text-[#4C566A]">10 minutes ago</div>
                            <div className="p-2 bg-[#434C5E] rounded text-xs text-[#ECEFF4]">
                                <span className="text-[#88C0D0] font-bold">Primary Agent:</span> Found 5 TypeScript errors during build. Starting fix...
                            </div>
                        </div>
                    </div>
                    <div className="p-3 bg-[#2E3440] border-t border-[#434C5E] text-center">
                        <span className="text-[10px] text-[#D8DEE9] hover:text-[#ECEFF4] cursor-pointer underline">View all notifications</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainLayout;
