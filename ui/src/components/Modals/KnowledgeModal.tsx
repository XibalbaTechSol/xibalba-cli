import React, { useState, useEffect } from 'react';
import { X, FileText, FolderOpen, Eye } from 'lucide-react';
import axios from 'axios';

interface KnowledgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onViewArtifact: (path: string) => void;
}

const KnowledgeModal: React.FC<KnowledgeModalProps> = ({ isOpen, onClose, onViewArtifact }) => {
    const [artifacts, setArtifacts] = useState<string[]>([]);
    const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Default artifacts - in production, fetch from filesystem
            setArtifacts([
                '/home/xibalbasolutions/Desktop/xibalba-cli/test-app/task.md',
                '/home/xibalbasolutions/Desktop/xibalba-cli/test-app/implementation_plan.md',
                '/home/xibalbasolutions/.gemini/antigravity/brain/58359331-f3cc-422a-a16d-d0bb0e9b1313/task.md',
                '/home/xibalbasolutions/.gemini/antigravity/brain/58359331-f3cc-422a-a16d-d0bb0e9b1313/implementation_plan.md',
                '/home/xibalbasolutions/.gemini/antigravity/brain/58359331-f3cc-422a-a16d-d0bb0e9b1313/walkthrough.md',
            ]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleViewArtifact = (path: string) => {
        onViewArtifact(path);
        onClose();
    };

    const getFileName = (path: string) => {
        return path.split('/').pop() || path;
    };

    const getDirectory = (path: string) => {
        const parts = path.split('/');
        return parts.slice(0, -1).join('/');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#2E3440] rounded-lg shadow-2xl w-[700px] max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-[#3B4252] px-6 py-4 flex items-center justify-between border-b border-[#434C5E]">
                    <div className="flex items-center gap-3">
                        <FileText size={20} className="text-[#88C0D0]" />
                        <h2 className="text-lg font-bold text-[#ECEFF4]">Knowledge Base</h2>
                    </div>
                    <button onClick={onClose} className="text-[#D8DEE9] hover:text-[#ECEFF4] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                    {artifacts.length === 0 ? (
                        <div className="text-center py-12 text-[#4C566A]">
                            <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No artifacts found</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {artifacts.map((artifact, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedArtifact === artifact
                                            ? 'bg-[#3B4252] border-[#88C0D0]'
                                            : 'bg-[#3B4252]/50 border-[#434C5E] hover:border-[#88C0D0]/50'
                                        }`}
                                    onClick={() => setSelectedArtifact(artifact)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText size={16} className="text-[#88C0D0] flex-shrink-0" />
                                                <span className="font-medium text-[#ECEFF4] text-sm truncate">
                                                    {getFileName(artifact)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-[#4C566A]">
                                                <FolderOpen size={12} />
                                                <span className="truncate">{getDirectory(artifact)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewArtifact(artifact);
                                            }}
                                            className="flex-shrink-0 px-3 py-1.5 bg-[#88C0D0] text-[#2E3440] rounded text-xs font-medium hover:bg-[#8FBCBB] transition-colors flex items-center gap-1"
                                        >
                                            <Eye size={12} />
                                            View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeModal;
