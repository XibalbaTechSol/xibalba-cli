import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Code, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import CLIInstance from '../CLIInstance';

// Define the types for messages
interface Message {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    code?: string;
    files?: { name: string; content: string }[];
}

// Mock initial messages for UI development
const initialMessages: Message[] = [
    { id: 1, sender: 'ai', text: "Hello! I'm Jules, your AI assistant. How can I help you today?" },
    {
        id: 2,
        sender: 'ai',
        text: "I've created a file for you.",
        files: [{ name: 'example.js', content: 'console.log("Hello, World!");' }]
    },
    {
        id: 3,
        sender: 'ai',
        text: "Here's a code snippet.",
        code: 'const greet = () => {\n  return "Hello from Jules!";\n};'
    },
];

const funnyQuotes = [
    "Why don't programmers like nature? It has too many bugs.",
    "I'm not lazy, I'm just on energy-saving mode.",
    "Why did the scarecrow win an award? Because he was outstanding in his field.",
    "Why don't scientists trust atoms? Because they make up everything.",
    "I told my wife she should embrace her mistakes. She gave me a hug.",
    "I'm on a seafood diet. I see food and I eat it.",
    "Why was the math book sad? Because it had too many problems.",
    "I'm reading a book on anti-gravity. It's impossible to put down!",
    "I'm so good at sleeping, I can do it with my eyes closed.",
    "I'm not a morning person. I'm a coffee person."
];

const JulesTerminal: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [quote, setQuote] = useState('');

    useEffect(() => {
        setQuote(funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)]);
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== "http://localhost:8000") return;

            const aiResponse: Message = {
                id: messages.length + 1,
                sender: 'ai',
                text: event.data,
            };
            setMessages(prevMessages => [...prevMessages, aiResponse]);
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [messages.length]);

    const handleSend = () => {
        if (input.trim() === '' || !iframeRef.current?.contentWindow) return;

        const newMessage: Message = {
            id: messages.length + 1,
            sender: 'user',
            text: input,
        };

        setMessages([...messages, newMessage]);
        iframeRef.current.contentWindow.postMessage(input, 'http://localhost:8000');
        setInput('');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const newMessage: Message = {
                id: messages.length + 1,
                sender: 'user',
                text: `Attached file: ${file.name}`,
                files: [{ name: file.name, content }],
            };
            setMessages([...messages, newMessage]);

            // Send file content to the iframe
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                    type: 'file',
                    name: file.name,
                    content,
                }, 'http://localhost:8000');
            }
        };
        reader.readAsText(file);
    };

    const handleAttachFile = () => {
        fileInputRef.current?.click();
    };

    const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
        <div className="bg-gray-800 text-white rounded-md my-2 font-mono text-sm">
            <div className="flex justify-between items-center px-3 py-1 bg-gray-900 rounded-t-md">
                <span className="text-xs text-gray-400">Code Snippet</span>
                <button className="text-xs text-gray-400 hover:text-white" onClick={() => navigator.clipboard.writeText(code)}>
                    Copy
                </button>
            </div>
            <pre className="p-3"><code>{code}</code></pre>
        </div>
    );

    const FilePreview: React.FC<{ file: { name: string; content: string } }> = ({ file }) => {
        const [isOpen, setIsOpen] = useState(false);
        return (
            <div className="border border-gray-700 rounded-md my-2">
                <div
                    className="flex items-center justify-between p-2 cursor-pointer bg-gray-800 hover:bg-gray-700 rounded-t-md"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center">
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <FileText size={16} className="ml-2" />
                        <span className="ml-2 text-sm font-medium">{file.name}</span>
                    </div>
                </div>
                {isOpen && (
                    <div className="p-2 border-t border-gray-700 bg-gray-900">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap">{file.content}</pre>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white font-sans">
            {/* Header */}
            <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Code size={16} className="text-blue-400" />
                    <span className="text-sm font-semibold text-gray-200">Jules AI Chat</span>
                </div>
            </div>

            {/* Message Display Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg shadow-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            <p className="text-sm leading-6">{msg.text}</p>
                            {msg.code && <CodeBlock code={msg.code} />}
                            {msg.files && msg.files.map((file, index) => <FilePreview key={index} file={file} />)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Hidden CLIInstance for communication */}
            <div style={{ display: 'none' }}>
                <CLIInstance ref={iframeRef} url="http://localhost:8000" />
            </div>

            {/* Prompt Input Window */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="bg-gray-700 rounded-lg p-2 flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message to Jules..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-400"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button onClick={handleAttachFile} className="p-2 text-gray-400 hover:text-white">
                        <Paperclip size={20} />
                    </button>
                    <button onClick={handleSend} className="p-2 text-gray-400 hover:text-white">
                        <Send size={20} />
                    </button>
                </div>
                <div className="text-xs text-center text-gray-500 pt-2 italic">
                    "{quote}"
                </div>
            </div>
        </div>
    );
};

export default JulesTerminal;
