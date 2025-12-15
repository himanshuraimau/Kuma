import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types/api.types';

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

export const MessageList = ({ messages, isLoading = false }: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Deduplicate messages by ID to prevent showing the same message twice
    const uniqueMessages = messages.reduce((acc, message) => {
        // Check if we already have a message with this ID
        if (!acc.find(m => m.id === message.id)) {
            acc.push(message);
        }
        return acc;
    }, [] as Message[]);

    // Check if there's already an assistant message being streamed (even if empty)
    const hasAssistantMessage = uniqueMessages.some(m => m.role === 'assistant');
    
    // Only show typing indicator if loading AND no assistant message exists yet
    const showTypingIndicator = isLoading && !hasAssistantMessage;

    console.log('[MessageList Render]', {
        totalMessages: messages.length,
        uniqueMessages: uniqueMessages.length,
        duplicatesRemoved: messages.length - uniqueMessages.length,
        isLoading,
        hasAssistantMessage,
        showTypingIndicator,
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth no-scrollbar" ref={containerRef}>
            <div className="max-w-3xl mx-auto space-y-6">
                {uniqueMessages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        timestamp={message.createdAt}
                        imageAttachments={message.imageAttachments}
                    />
                ))}

                {/* Typing Indicator - only show if no assistant message exists yet */}
                {showTypingIndicator && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-start gap-3 max-w-[80%]">
                             <div className="w-6 h-6 rounded-md flex items-center justify-center mt-1 shadow-sm">
                                <img src="/logo.png" alt="kuma-ai" className="w-5 h-5 object-contain" />
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