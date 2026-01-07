import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-[#2E3440] rounded-lg shadow-2xl w-[500px] max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-[#3B4252] px-6 py-4 flex items-center justify-between border-b border-[#434C5E]">
                    <div className="flex items-center gap-3">
                        <User size={20} className="text-[#88C0D0]" />
                        <h2 className="text-lg font-bold text-[#ECEFF4]">User Profile</h2>
                    </div>
                    <button onClick={onClose} className="text-[#D8DEE9] hover:text-[#ECEFF4] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
                    {/* Profile Photo */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#88C0D0] to-[#5E81AC] flex items-center justify-center text-[#2E3440] font-bold text-2xl">
                                XS
                            </div>
                            <button className="absolute bottom-0 right-0 bg-[#88C0D0] text-[#2E3440] rounded-full p-2 hover:bg-[#8FBCBB] transition-colors">
                                <User size={12} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="text-xs text-[#81A1C1] font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                                <Mail size={14} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                defaultValue="user@xibalbasolutions.com"
                                className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#ECEFF4] focus:border-[#88C0D0] focus:outline-none"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-xs text-[#81A1C1] font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                                <Lock size={14} />
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    defaultValue="••••••••"
                                    className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#ECEFF4] focus:border-[#88C0D0] focus:outline-none"
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#81A1C1] hover:text-[#88C0D0] text-xs"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="text-xs text-[#81A1C1] font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                                <User size={14} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                defaultValue="Xibalba Solutions"
                                className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#ECEFF4] focus:border-[#88C0D0] focus:outline-none"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-xs text-[#81A1C1] font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                                <Phone size={14} />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#ECEFF4] focus:border-[#88C0D0] focus:outline-none"
                            />
                        </div>

                        {/* Organization */}
                        <div>
                            <label className="text-xs text-[#81A1C1] font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                                <MapPin size={14} />
                                Organization
                            </label>
                            <input
                                type="text"
                                defaultValue="Xibalba Tech Solutions"
                                className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#ECEFF4] focus:border-[#88C0D0] focus:outline-none"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="text-xs text-[#81A1C1] font-bold uppercase tracking-wide mb-2 block">
                                Role
                            </label>
                            <select className="w-full bg-[#3B4252] border border-[#434C5E] rounded px-3 py-2 text-sm text-[#ECEFF4] focus:border-[#88C0D0] focus:outline-none">
                                <option>Administrator</option>
                                <option>Developer</option>
                                <option>User</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-[#3B4252] px-6 py-4 border-t border-[#434C5E] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-[#D8DEE9] hover:text-[#ECEFF4] transition-colors">
                        Cancel
                    </button>
                    <button className="px-4 py-2 text-sm bg-[#88C0D0] text-[#2E3440] rounded hover:bg-[#8FBCBB] transition-colors font-medium">
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
