import { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Save, FileText, ChevronRight } from 'lucide-react';

const ORCHESTRATOR_URL = "http://localhost:3000";

const ScriptEditor = () => {
    const [scripts, setScripts] = useState<string[]>([]);
    const [selectedScript, setSelectedScript] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [status, setStatus] = useState<string>("");

    useEffect(() => {
        fetchScripts();
    }, []);

    const fetchScripts = async () => {
        try {
            const res = await axios.get(`${ORCHESTRATOR_URL}/scripts`);
            setScripts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectScript = async (name: string) => {
        setSelectedScript(name);
        if (!name) {
            setCode("");
            return;
        }
        try {
            const res = await axios.get(`${ORCHESTRATOR_URL}/scripts/${name}`);
            setCode(res.data.code);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        let name = selectedScript;
        if (!name) {
            const val = prompt("Enter script name (e.g. hello.py or setup.sh):");
            if (!val) return;
            name = val;
            setSelectedScript(name);
        }
        try {
            await axios.post(`${ORCHESTRATOR_URL}/scripts/save`, { name, code });
            setStatus("Saved!");
            fetchScripts();
            setTimeout(() => setStatus(""), 2000);
        } catch (err) {
            setStatus("Error saving");
        }
    };

    const handleRun = async () => {
        if (!selectedScript) {
            alert("Please save the script first.");
            return;
        }
        try {
            // Pipe to primary-session terminal
            await axios.post(`${ORCHESTRATOR_URL}/scripts/run?name=${selectedScript}&session_id=primary-session`);
            setStatus("Running in terminal...");
            setTimeout(() => setStatus(""), 2000);
        } catch (err) {
            setStatus("Error running");
        }
    };

    return (
        <div className="h-full w-full bg-[#2E3440] flex flex-row text-sm overflow-hidden text-[#D8DEE9]">
            {/* Sidebar for scripts */}
            <div className="w-48 border-r border-[#434C5E] bg-[#3B4252] flex flex-col shrink-0">
                <div className="h-8 border-b border-[#434C5E] flex items-center px-4 justify-between bg-[#3B4252]">
                    <span className="text-xs font-semibold text-[#81A1C1] uppercase tracking-wider">Scripts</span>
                    <button onClick={() => handleSelectScript("")} className="text-[#D8DEE9] hover:text-[#88C0D0]">
                        <FileText size={14} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    {scripts.length === 0 && <div className="px-4 py-2 text-[#4C566A] italic">No scripts</div>}
                    {scripts.map(s => (
                        <div
                            key={s}
                            onClick={() => handleSelectScript(s)}
                            className={`px-4 py-1.5 cursor-pointer flex items-center gap-2 border-l-2 transition-all ${selectedScript === s
                                ? 'bg-[#2E3440] text-[#88C0D0] border-[#88C0D0]'
                                : 'text-[#D8DEE9] border-transparent hover:bg-[#434C5E] hover:text-[#ECEFF4]'
                                }`}
                        >
                            <ChevronRight size={12} />
                            <span className="truncate">{s}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="h-8 bg-[#3B4252] border-b border-[#434C5E] flex items-center px-4 justify-between overflow-hidden">
                    <div className="flex items-center gap-4">
                        <span className="text-[#D8DEE9] font-mono text-xs truncate">
                            {selectedScript || "New Script"}
                        </span>
                        <div className="flex gap-3">
                            <button onClick={handleSave} className="flex items-center gap-1.5 text-[#88C0D0] hover:text-[#81A1C1] transition-colors">
                                <Save size={14} /> <span>Save</span>
                            </button>
                            <button onClick={handleRun} className="flex items-center gap-1.5 text-[#A3BE8C] hover:text-[#8FBCBB] transition-colors">
                                <Play size={14} /> <span>Run</span>
                            </button>
                        </div>
                    </div>
                    <span className="text-[#D8DEE9] text-xs shrink-0">{status}</span>
                </div>
                <textarea
                    className="flex-1 bg-[#2E3440] text-[#D8DEE9] font-mono p-4 outline-none resize-none selection:bg-[#434C5E] placeholder-[#4C566A]"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="# Enter your script here... (e.g. print('hello'))"
                    spellCheck={false}
                />
            </div>
        </div>
    );
};

export default ScriptEditor;
