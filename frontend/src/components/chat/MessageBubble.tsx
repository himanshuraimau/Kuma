import { Copy, Check, User } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp: string;
}

export const MessageBubble = ({ role, content, timestamp }: MessageBubbleProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isUser = role === 'user';

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>

                {/* Avatar + Name Row (Optional) */}
                <div className={`flex items-center gap-2 mb-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shadow-sm ${isUser ? 'bg-zinc-800' : ''}`}>
                        {isUser ? <User className="w-3.5 h-3.5 text-zinc-400" /> : <img src="/logo.png" alt="Kuma" className="w-5 h-5 object-contain" />}
                    </div>
                    <span className="text-xs font-medium text-zinc-500">
                        {isUser ? 'You' : 'Kuma'}
                    </span>
                </div>

                {/* Message Bubble */}
                <div
                    className={`relative px-5 py-3.5 shadow-sm ${isUser
                        ? 'bg-zinc-800 text-zinc-100 rounded-2xl rounded-tr-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm'
                        }`}
                >
                    {isUser ? (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{content}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none 
                            prose-p:text-zinc-300 prose-p:leading-relaxed
                            prose-headings:text-zinc-100 prose-headings:font-semibold
                            prose-strong:text-orange-500 prose-strong:font-bold
                            prose-code:text-orange-400 prose-code:bg-zinc-950/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800
                            prose-ul:text-zinc-300 prose-ol:text-zinc-300
                            prose-a:text-blue-400 hover:prose-a:text-blue-300
                        ">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Footer: Timestamp & Actions */}
                <div className={`flex items-center gap-3 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-zinc-600 font-medium">
                        {new Date(timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                    {!isUser && (
                        <button
                            onClick={handleCopy}
                            className="p-1 -m-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};