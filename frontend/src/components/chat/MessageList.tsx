import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';
import type { Message } from '@/types/api.types';

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

export const MessageList = ({ messages, isLoading = false }: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0 && !isLoading) {
        return null;
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((message) => (
                <MessageBubble
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.createdAt}
                />
            ))}

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex justify-start mb-4">
                    <div className="bg-charcoal border border-white/10 rounded-2xl px-4 py-3">
                        <Loader2 className="w-5 h-5 text-coral animate-spin" />
                    </div>
                </div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
};
