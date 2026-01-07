import React from 'react';
import { Globe, Terminal, Box } from 'lucide-react';
import Jules from '../Icons/Jules';

interface HeaderPaneProps {
    onToggleTerminal?: () => void;
    onToggleEditor?: () => void;
    onToggleBrowser?: () => void;
    onToggleInbox?: () => void;
    onToggleJules?: () => void;
    viewMode?: 'browser' | 'editor' | 'artifacts' | 'jules';
}

const HeaderPane: React.FC<HeaderPaneProps> = ({
    onToggleTerminal,
    onToggleEditor,
    onToggleBrowser,
    onToggleInbox,
    onToggleJules,
    viewMode
}) => {
    return (
        <div className="flex flex-col shrink-0">
            {/* Top Bar: Branding, Menus, Toggles */}
            <div className="h-9 bg-[#2E3440] border-b border-[#2E3440] flex items-center px-4 shrink-0 select-none text-[#ECEFF4] text-[11px] font-normal justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[#88C0D0]">
                        <Box size={16} strokeWidth={2.5} />
                        <span className="font-bold tracking-tight text-[#ECEFF4] text-xs uppercase">XIBALBA</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onToggleInbox}
                            className="hover:text-[#ECEFF4] transition-colors flex items-center gap-1.5 text-[#D8DEE9]"
                        >
                            Inbox
                        </button>
                        <button
                            onClick={onToggleEditor}
                            className={`hover:text-[#ECEFF4] transition-colors flex items-center gap-1.5 ${viewMode === 'editor' ? 'text-[#88C0D0] font-bold underline' : 'text-[#D8DEE9]'}`}
                        >
                            Script Editor
                        </button>
                        <button
                            onClick={onToggleJules}
                            className={`hover:text-[#ECEFF4] transition-colors ${viewMode === 'jules' ? 'text-[#88C0D0]' : 'text-[#D8DEE9]'}`}
                            title="Jules AI"
                        >
                            <Jules size={14} strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={onToggleBrowser}
                            className={`hover:text-[#ECEFF4] transition-colors ${viewMode === 'browser' ? 'text-[#88C0D0]' : 'text-[#D8DEE9]'}`}
                            title="Browser Preview"
                        >
                            <Globe size={14} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 border-l border-[#434C5E] pl-6">
                        <div className="flex items-center gap-2 cursor-pointer group" onClick={onToggleTerminal}>
                            <Terminal size={14} className="text-[#D8DEE9] group-hover:text-[#ECEFF4]" />
                            <span className="text-[#D8DEE9] group-hover:text-[#ECEFF4] font-bold">Terminal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderPane;
