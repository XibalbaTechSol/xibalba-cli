import React, { useState } from 'react';
import { LogOut, Settings, X, Monitor } from 'lucide-react';

const UserProfile: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Mock User Data
    const user = {
        name: "Xibalba Admin",
        role: "Platform Engineer",
        avatar: null
    };

    return (
        <div className="mt-auto border-t border-gray-800 p-3 relative">

            {/* Popup Menu */}
            {isOpen && (
                <div className="absolute bottom-full left-3 mb-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-800/50">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-200">{user.name}</span>
                            <span className="text-xs text-gray-400">{user.role}</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-2 space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                            <Settings size={16} />
                            <span>Settings</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                            <Monitor size={16} />
                            <span>Display</span>
                        </button>
                    </div>

                    <div className="p-2 border-t border-gray-800 bg-gray-900/50">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-md transition-colors">
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}

            {/* User Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 w-full hover:bg-gray-800/50 p-2 rounded-md transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                    {user.name[0]}
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate w-full text-left">
                        {user.name}
                    </span>
                    <span className="text-[10px] text-gray-500 group-hover:text-gray-400 uppercase tracking-wider">
                        Online
                    </span>
                </div>
            </button>
        </div>
    );
};

export default UserProfile;
