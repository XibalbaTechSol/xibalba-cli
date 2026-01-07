import React, { useState, useRef, useEffect } from 'react';
import {
    Inbox,
    Plus,
    ChevronDown,
    ChevronRight,
    BookOpen,
    Settings,

    PanelLeftClose,
    File,
    Image as ImageIcon,
    Bot,
    FolderPlus,
    User
} from 'lucide-react';
import { Instance } from '../InstanceList';
import SettingsModal from '../Modals/SettingsModal';
import ProfileModal from '../Modals/ProfileModal';
import KnowledgeModal from '../Modals/KnowledgeModal';

interface SidebarProps {
    instances: Instance[];
    selectedId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onOpenFolder: () => void;
    onOpenFile: (path: string) => void;
    projectName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    instances,
    selectedId,
    onSelect,
    onAdd,
    onOpenFile,
    onOpenFolder,
    projectName = 'test-app'
}) => {
    const [workspacesOpen, setWorkspacesOpen] = useState(true);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [knowledgeOpen, setKnowledgeOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };

        if (profileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [profileMenuOpen]);

    return (
        <div className={`h-full bg-[#2E3440] border-r border-[#2E3440] flex flex-col text-[#D8DEE9] select-none shadow-xl transition-all duration-300 relative ${collapsed ? 'w-16' : 'w-full'}`}>
            {/* Collapse Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-4 z-50 bg-[#3B4252] border border-[#434C5E] rounded-full p-1.5 hover:bg-[#434C5E] transition-colors shadow-lg"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? (
                    <ChevronRight size={14} className="text-[#D8DEE9]" />
                ) : (
                    <PanelLeftClose size={14} className="text-[#D8DEE9]" />
                )}
            </button>

            {/* Top Section */}
            <div className="p-4 space-y-4">{!collapsed && (
                <>
                    <div className="flex items-center justify-between hover:text-[#ECEFF4] cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <Inbox size={18} className="text-[#D8DEE9] group-hover:text-[#88C0D0] transition-colors" />
                            <span className="text-sm font-medium">Inbox</span>
                        </div>
                        <PanelLeftClose size={18} className="text-[#4C566A] group-hover:text-[#ECEFF4]" />
                    </div>

                    <div className="flex items-center gap-3 hover:text-[#ECEFF4] cursor-pointer group" onClick={onAdd}>
                        <Plus size={18} className="text-[#D82DEE9] group-hover:text-[#A3BE8C] transition-colors" />
                        <span className="text-sm font-medium">Start conversation</span>
                    </div>
                </>
            )}
            </div>

            {/* Workspaces Section */}
            <div className="flex-1 overflow-y-auto px-2">
                <div className="mt-4 mb-2">
                    <div
                        className="flex items-center justify-between px-2 py-1 hover:text-[#ECEFF4] cursor-pointer group"
                        onClick={() => setWorkspacesOpen(!workspacesOpen)}
                    >
                        <div className="flex items-center gap-2">
                            {workspacesOpen ? <ChevronDown size={14} className="text-[#81A1C1]" /> : <ChevronRight size={14} />}
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4C566A] group-hover:text-[#D8DEE9]">Workspaces</span>
                        </div>
                        <FolderPlus
                            size={14}
                            className="text-[#4C566A] hover:text-[#ECEFF4] transition-colors"
                            onClick={(e) => { e.stopPropagation(); onOpenFolder(); }}
                        />
                    </div>

                    {workspacesOpen && (
                        <div className="mt-2 space-y-4">
                            {/* Project Header */}
                            <div className="flex items-center justify-between px-6 py-1 hover:bg-[#3B4252] rounded-md cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <ChevronDown size={14} className="text-[#D8DEE9]" />
                                    <span className="text-sm font-bold text-[#ECEFF4] underline decoration-[#88C0D0]/50 underline-offset-4">{projectName}</span>
                                </div>
                                <Plus size={14} className="text-[#4C566A] group-hover:text-[#ECEFF4]" />
                            </div>

                            {/* Section: Files */}
                            <div className="space-y-0.5">
                                <div className="px-10 py-1 text-[10px] font-bold text-[#4C566A] uppercase tracking-tighter flex items-center gap-2">
                                    <File size={10} />
                                    Files
                                </div>
                                <div className="pl-14 space-y-0.5">
                                    <div
                                        onClick={() => onOpenFile('/home/xibalbasolutions/Desktop/xibalba-cli/test-app/task.md')}
                                        className="px-2 py-1 rounded-md cursor-pointer text-[12px] truncate hover:bg-[#3B4252] hover:text-[#ECEFF4] transition-colors"
                                    >
                                        task.md
                                    </div>
                                    <div
                                        onClick={() => onOpenFile('/home/xibalbasolutions/Desktop/xibalba-cli/test-app/implementation_plan.md')}
                                        className="px-2 py-1 rounded-md cursor-pointer text-[12px] truncate hover:bg-[#3B4252] hover:text-[#ECEFF4] transition-colors"
                                    >
                                        implementation_plan.md
                                    </div>
                                </div>
                            </div>

                            {/* Section: Screenshots */}
                            <div className="space-y-0.5">
                                <div className="px-10 py-1 text-[10px] font-bold text-[#4C566A] uppercase tracking-tighter flex items-center gap-2">
                                    <ImageIcon size={10} />
                                    Screenshots
                                </div>
                                <div className="pl-14 space-y-0.5">
                                    <div className="px-2 py-1 rounded-md cursor-pointer text-[12px] italic text-[#4C566A] hover:bg-[#3B4252] hover:text-[#ECEFF4] transition-colors">
                                        No recent captures
                                    </div>
                                </div>
                            </div>

                            {/* Section: Agents */}
                            <div className="space-y-0.5">
                                <div className="px-10 py-1 text-[10px] font-bold text-[#4C566A] uppercase tracking-tighter flex items-center gap-2">
                                    <Bot size={10} />
                                    Active Agents
                                </div>
                                <div className="pl-14 space-y-0.5">
                                    {instances.map(instance => (
                                        <div
                                            key={instance.id}
                                            onClick={() => onSelect(instance.id)}
                                            className={`px-2 py-1 rounded-md cursor-pointer text-[12px] truncate transition-colors ${selectedId === instance.id
                                                ? 'bg-[#3B4252] text-[#88C0D0] border border-[#81A1C1]/20'
                                                : 'hover:bg-[#3B4252] hover:text-[#ECEFF4]'
                                                }`}
                                        >
                                            {instance.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Profile Section - Compact with Dropdown */}
            <div className="p-3 border-t border-[#3B4252] relative" ref={profileMenuRef}>
                {/* Dropdown Menu */}
                {profileMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-[#434C5E] border border-[#4C566A] rounded-lg shadow-2xl overflow-hidden">
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => { setProfileOpen(true); setProfileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#D8DEE9] hover:bg-[#4C566A] rounded-md transition-colors"
                            >
                                <User size={16} />
                                <span>Profile</span>
                            </button>
                            <button
                                onClick={() => { setSettingsOpen(true); setProfileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#D8DEE9] hover:bg-[#4C566A] rounded-md transition-colors"
                            >
                                <Settings size={16} />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={() => { setKnowledgeOpen(true); setProfileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#D8DEE9] hover:bg-[#4C566A] rounded-md transition-colors"
                            >
                                <BookOpen size={16} />
                                <span>Knowledge</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile Button */}
                <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-3 w-full hover:bg-[#3B4252] p-2 rounded-md transition-all group"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#88C0D0] to-[#5E81AC] flex items-center justify-center text-white font-bold shadow-lg">
                        X
                    </div>
                    <div className="flex flex-col items-start overflow-hidden flex-1">
                        <span className="text-sm font-medium text-[#ECEFF4] group-hover:text-white transition-colors truncate w-full text-left">
                            Xibalba User
                        </span>
                        <span className="text-[10px] text-[#81A1C1] uppercase tracking-wider">
                            Online
                        </span>
                    </div>
                </button>
            </div>

            {/* Modals */}
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
            <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
            <KnowledgeModal
                isOpen={knowledgeOpen}
                onClose={() => setKnowledgeOpen(false)}
                onViewArtifact={onOpenFile}
            />
        </div>
    );
};

export default Sidebar;
