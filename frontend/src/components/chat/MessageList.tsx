import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Loader2, Zap } from 'lucide-react';
import type { Message } from '@/types/api.types';

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

export const MessageList = ({ messages, isLoading = false }: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth no-scrollbar" ref={containerRef}>
            <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        timestamp={message.createdAt}
                    />
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-start gap-3 max-w-[80%]">
                             <div className="w-6 h-6 rounded-md bg-orange-600 flex items-center justify-center mt-1 shadow-sm">
                                <Zap className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Invisible anchor for auto-scroll */}
                <div ref={messagesEndRef} className="h-1" />
            </div>
        </div>
    );
};