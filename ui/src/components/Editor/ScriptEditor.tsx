import React, { useState } from 'react';
import { Play, Save, FileCode, Terminal as TerminalIcon } from 'lucide-react';
import axios from 'axios';

const ORCHESTRATOR_URL = "http://localhost:3000";

const ScriptEditor: React.FC = () => {
    const [scriptName, setScriptName] = useState('new_script.py');
    const [code, setCode] = useState(`from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp("http://localhost:9222")
        page = browser.contexts[0].pages[0]
        
        # Add your automation logic here
        print(f"Current page title: {page.title()}")
        
run()`);
    const [output, setOutput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    const handleSave = async () => {
        try {
            await axios.post(`${ORCHESTRATOR_URL}/scripts/save`, {
                name: scriptName,
                content: code
            });
            alert('Script saved successfully!');
        } catch (err) {
            console.error("Failed to save script", err);
            alert('Failed to save script');
        }
    };

    const handleRun = async () => {
        setIsExecuting(true);
        setOutput('Executing script...\n');
        try {
            const res = await axios.post(`${ORCHESTRATOR_URL}/browser/script`, {
                script: code
            });
            setOutput(prev => prev + (res.data.output || res.data.result || 'Success (No output)'));
        } catch (err: any) {
            console.error("Execution failed", err);
            setOutput(prev => prev + `Error: ${err.response?.data?.detail || err.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="h-full w-full bg-[#0d0d0d] flex flex-col font-mono text-sm overflow-hidden">
            {/* Toolbar */}
            <div className="h-10 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <FileCode size={16} className="text-blue-400" />
                    <input
                        type="text"
                        value={scriptName}
                        onChange={(e) => setScriptName(e.target.value)}
                        className="bg-transparent border-none outline-none text-[#cccccc] w-48 focus:text-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#cccccc] rounded transition-colors"
                    >
                        <Save size={14} />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isExecuting}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${isExecuting ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
                            } text-white`}
                    >
                        <Play size={14} fill="currentColor" />
                        <span>{isExecuting ? 'Running...' : 'Run Script'}</span>
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 bg-transparent border-none outline-none resize-none p-4 text-[#9cdcfe] selection:bg-[#264f78]"
                    style={{ whiteSpace: 'pre', overflowWrap: 'initial' }}
                />
            </div>

            {/* Output Panel */}
            <div className="h-40 bg-[#111111] border-t border-[#2d2d2d] flex flex-col shrink-0">
                <div className="h-8 bg-[#1e1e1e] flex items-center px-4 gap-2 border-b border-[#2d2d2d]">
                    <TerminalIcon size={12} className="text-gray-500" />
                    <span className="text-[10px] uppercase font-bold text-gray-500">Execution Output</span>
                </div>
                <div className="flex-1 p-3 overflow-auto text-gray-400 text-xs whitespace-pre-wrap leading-tight">
                    {output || 'No output yet. Run a script to see results.'}
                </div>
            </div>
        </div>
    );
};

export default ScriptEditor;
