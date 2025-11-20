import { Copy, Check } from 'lucide-react';
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
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
            <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                {/* Message Bubble */}
                <div
                    className={`rounded-2xl px-4 py-3 ${isUser
                            ? 'bg-coral text-cream'
                            : 'bg-charcoal border border-white/10 text-cream'
                        }`}
                >
                    {isUser ? (
                        <p className="text-base whitespace-pre-wrap break-words">{content}</p>
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => (
                                        <p className="mb-2 last:mb-0 text-cream">{children}</p>
                                    ),
                                    code: ({ children, className }) => {
                                        const isInline = !className;
                                        return isInline ? (
                                            <code className="bg-navy/50 px-1.5 py-0.5 rounded text-coral font-mono text-sm">
                                                {children}
                                            </code>
                                        ) : (
                                            <code className="block bg-navy/50 p-3 rounded-lg overflow-x-auto font-mono text-sm text-cream">
                                                {children}
                                            </code>
                                        );
                                    },
                                    ul: ({ children }) => (
                                        <ul className="list-disc list-inside mb-2 text-cream">
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside mb-2 text-cream">
                                            {children}
                                        </ol>
                                    ),
                                    strong: ({ children }) => (
                                        <strong className="font-semibold text-coral">
                                            {children}
                                        </strong>
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Timestamp and Actions */}
                <div
                    className={`flex items-center gap-2 mt-1 px-2 ${isUser ? 'justify-end' : 'justify-start'
                        }`}
                >
                    <span className="text-xs text-warm-gray/60">
                        {new Date(timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                    {!isUser && (
                        <button
                            onClick={handleCopy}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-warm-gray hover:text-cream"
                            aria-label="Copy message"
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
