import React, { useState, forwardRef } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface CLIInstanceProps {
    url?: string;
}

const CLIInstance = forwardRef<HTMLIFrameElement, CLIInstanceProps>(
    ({ url = "http://localhost:8000" }, ref) => {
        const [key, setKey] = useState(0);

        const refresh = () => setKey(prev => prev + 1);

        return (
            <div className="w-full h-full flex flex-col bg-black">
                <div className="h-8 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-3 flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono truncate max-w-[300px]">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        {url}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={refresh}
                            className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
                            title="Reload Frame"
                        >
                            <RefreshCw size={12} />
                        </button>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
                            title="Open in New Tab"
                        >
                            <ExternalLink size={12} />
                        </a>
                    </div>
                </div>
                <iframe
                    ref={ref}
                    key={key}
                    src={url}
                    className="flex-1 w-full h-full border-none"
                    title="Toad CLI"
                    allow="clipboard-read; clipboard-write; fullscreen"
                />
            </div>
        );
    }
);

export default CLIInstance;