import React from 'react';
import { Plus, Trash2, Terminal, Pause, Play, FolderOpen } from 'lucide-react';

export interface Instance {
    id: string;
    name: string;
    url: string;
    status: 'running' | 'paused';
}

interface InstanceListProps {
    instances: Instance[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onRemove: (id: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
    onOpenFolder: () => void;
}

const InstanceList: React.FC<InstanceListProps> = ({
    instances,
    selectedId,
    onSelect,
    onAdd,
    onRemove,
    onPause,
    onResume,
    onOpenFolder
}) => {
    return (
        <div className="flex flex-col h-full w-full">
            {/* Header / Actions */}
            <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Instances</span>
                <div className="flex gap-1">
                    <button
                        onClick={onOpenFolder}
                        className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                        title="Open Project Folder"
                    >
                        <FolderOpen size={14} />
                    </button>
                    <button
                        onClick={onAdd}
                        className="p-1 hover:bg-gray-800 rounded text-blue-400 hover:text-blue-300 transition-colors"
                        title="New Instance"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {instances.map(instance => (
                    <div
                        key={instance.id}
                        onClick={() => onSelect(instance.id)}
                        className={`
                            group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all border
                            ${selectedId === instance.id
                                ? 'bg-blue-900/20 text-blue-100 border-blue-800/40 shadow-sm'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-transparent'}
                        `}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`relative flex items-center justify-center w-6 h-6 rounded bg-gray-800 ${selectedId === instance.id ? 'text-blue-400' : 'text-gray-500'}`}>
                                <Terminal size={14} />
                                {instance.status === 'paused' && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border border-gray-900" />
                                )}
                            </div>
                            <span className="truncate text-xs font-medium">{instance.name}</span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {instance.status === 'running' ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPause(instance.id); }}
                                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-yellow-400"
                                    title="Pause"
                                >
                                    <Pause size={12} />
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onResume(instance.id); }}
                                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-green-400"
                                    title="Resume"
                                >
                                    <Play size={12} />
                                </button>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(instance.id);
                                }}
                                className={`p-1 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400 ${instances.length === 1 ? 'hidden' : ''}`}
                                title="Kill Instance"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InstanceList;
