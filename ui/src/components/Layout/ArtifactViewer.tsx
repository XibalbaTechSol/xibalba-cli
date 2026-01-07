import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ArtifactViewerProps {
    filePath: string;
}

const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ filePath }) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (filePath) {
            loadArtifact();
        }
    }, [filePath]);

    const loadArtifact = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use /files/read endpoint that exists in orchestrator
            const res = await axios.get(`http://localhost:3000/files/read?path=${encodeURIComponent(filePath)}`);
            setContent(res.data.content);
        } catch (err) {
            console.error("Failed to load artifact", err);
            setError("Failed to load artifact");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-[#2E3440]">
                <Loader2 className="animate-spin text-[#88C0D0]" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-[#2E3440] text-[#BF616A]">
                {error}
            </div>
        );
    }

    const isImage = filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg');
    const isMarkdown = filePath.endsWith('.md');

    return (
        <div className="h-full w-full bg-[#2E3440] flex flex-col overflow-hidden text-[#D8DEE9]">
            <div className="h-9 border-b border-[#3B4252] flex items-center px-4 shrink-0 bg-[#3B4252]">
                <span className="text-[10px] uppercase font-bold text-[#81A1C1] tracking-widest flex items-center gap-2">
                    {isImage ? <ImageIcon size={12} /> : <FileText size={12} />}
                    {filePath.split('/').pop()}
                </span>
            </div>
            <div className="flex-1 overflow-auto p-6">
                {isImage ? (
                    <img src={`http://localhost:3000/files/view?path=${encodeURIComponent(filePath)}`} alt="Artifact" className="max-w-full h-auto rounded-lg shadow-2xl border border-[#3B4252]" />
                ) : isMarkdown ? (
                    <div className="prose prose-invert max-w-none markdown-content">
                        <ReactMarkdown>{content || "No content found."}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-[#3B4252] p-4 rounded-lg">
                        {content || "No content found."}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtifactViewer;
