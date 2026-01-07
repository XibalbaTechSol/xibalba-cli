import React from 'react';
import {
    ChevronRight,
    Search,
    MoreHorizontal,
    X,
    Edit2
} from 'lucide-react';

interface CodeEditorProps {
    filePath: string;
    content: string;
    onChange: (content: string) => void;
    onClose: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    filePath,
    content,
    onChange,
    onClose
}) => {
    const fileName = filePath.split('/').pop() || 'Untitled';
    const lines = content.split('\n');

    return (
        <div className="h-full w-full bg-[#2E3440] flex flex-col overflow-hidden text-[#D8DEE9] font-mono">
            {/* Editor Header */}
            <div className="h-9 bg-[#3B4252] border-b border-[#434C5E] flex items-center px-3 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <ChevronRight size={14} className="text-[#81A1C1]" />
                        <div className="flex items-center gap-1.5 bg-[#434C5E] px-2 py-1 rounded-sm text-xs border border-[#4C566A]">
                            <div className="w-3 h-3 bg-[#88C0D0] rounded-[2px]" />
                            <span className="text-[#ECEFF4]">{fileName}</span>
                            <span className="text-[#D8DEE9] text-[10px] ml-1 opacity-60">{filePath.replace(fileName, '')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Edit2 size={14} className="text-[#88C0D0]" />
                    <MoreHorizontal size={14} className="text-[#D8DEE9]" />
                    <Search size={14} className="text-[#D8DEE9]" />
                    <X size={14} className="text-[#D8DEE9] hover:text-[#BF616A] cursor-pointer" onClick={onClose} />
                </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto flex select-text bg-[#2E3440]">
                {/* Line Numbers */}
                <div className="w-10 bg-[#2E3440] text-right pr-3 py-4 text-[#4C566A] text-xs shrink-0 select-none border-r border-[#3B4252]">
                    {lines.map((_, i) => (
                        <div key={i} className="h-5">{i + 1}</div>
                    ))}
                </div>

                {/* Text Area */}
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    spellCheck={false}
                    className="flex-1 bg-transparent border-none outline-none resize-none py-4 px-2 text-[13px] leading-5 text-[#ECEFF4] selection:bg-[#434C5E] placeholder-[#4C566A]"
                    style={{ whiteSpace: 'pre', overflowWrap: 'initial' }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
