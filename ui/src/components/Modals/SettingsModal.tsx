import React from 'react';
import { X, Settings, User, FileText } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#2E3440] rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-[#3B4252] px-6 py-4 flex items-center justify-between border-b border-[#434C5E]">
                    <div className="flex items-center gap-3">
                        <Settings size={20} className="text-[#88C0D0]" />
                        <h2 className="text-lg font-bold text-[#ECEFF4]">System Settings</h2>
                    </div>
                    <button onClick={onClose} className="text-[#D8DEE9] hover:text-[#ECEFF4] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                    <div className="space-y-6">
                        {/* Environment Configuration */}
                        <div>
                            <h3 className="text-sm font-bold text-[#81A1C1] uppercase tracking-wide mb-3">Environment</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-[#D8DEE9] block mb-1">Gemini API Key</label>
                                    <input
                                        type="password"
                                        placeholder="AIzaSy..."
                                        className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#ECEFF4] focus:border-[#88C0D0] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Service Ports */}
                        <div>
                            <h3 className="text-sm font-bold text-[#81A1C1] uppercase tracking-wide mb-3">Service Ports</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-[#D8DEE9] block mb-1">UI Dashboard</label>
                                    <input type="number" value="5173" readOnly className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#4C566A]" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#D8DEE9] block mb-1">Toad Server</label>
                                    <input type="number" value="8000" readOnly className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#4C566A]" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#D8DEE9] block mb-1">Orchestrator</label>
                                    <input type="number" value="3000" readOnly className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#4C566A]" />
                                </div>
                                <div>
                                    <label className="text-xs text-[#D8DEE9] block mb-1">Test App</label>
                                    <input type="number" value="3001" readOnly className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#4C566A]" />
                                </div>
                            </div>
                        </div>

                        {/* UI Preferences */}
                        <div>
                            <h3 className="text-sm font-bold text-[#81A1C1] uppercase tracking-wide mb-3">UI Preferences</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[#D8DEE9]">Auto-hide Terminal</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-[#3B4252] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#88C0D0]"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[#D8DEE9]">Show Line Numbers</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-[#3B4252] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#88C0D0]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#3B4252] px-6 py-4 border-t border-[#434C5E] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-[#D8DEE9] hover:text-[#ECEFF4] transition-colors">
                        Cancel
                    </button>
                    <button className="px-4 py-2 text-sm bg-[#88C0D0] text-[#2E3440] rounded hover:bg-[#8FBCBB] transition-colors font-medium">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
