import React from 'react';

const ChromiumFrame = () => {
    // Using environment variables or defaults
    const vncUrl = "http://localhost:6080/vnc.html?autoconnect=true&resize=scale&reconnect=true";

    return (
        <div className="h-full w-full bg-black relative">
            <iframe
                src={vncUrl}
                className="absolute inset-0 w-full h-full border-none"
                title="Chromium VNC"
                allow="clipboard-read; clipboard-write; fullscreen"
            />
        </div>
    );
};

export default ChromiumFrame;