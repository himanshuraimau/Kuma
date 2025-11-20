import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Paperclip, Mic, Send, Infinity, ChevronDown, Zap, AlertCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import { MessageList } from '@/components/chat/MessageList';

export const ChatInterface = () => {
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        currentMessages,
        isSending,
        error,
        sendMessage,
        clearError,
    } = useChatStore();

    const hasMessages = currentMessages.length > 0;

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);

    const handleSend = async () => {
        if (inputValue.trim() && !isSending) {
            const message = inputValue.trim();
            setInputValue('');

            try {
                await sendMessage(message);
            } catch (err) {
                console.error('Failed to send message:', err);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileAttach = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // TODO: Implement file upload functionality
            console.log('Files selected:', Array.from(files).map(f => f.name));
        }
    };

    const handleVoiceInput = () => {
        setIsRecording(!isRecording);
        // TODO: Implement voice recording functionality
        console.log('Voice input:', !isRecording ? 'started' : 'stopped');
    };

    return (
        <div className="relative flex flex-col h-screen bg-navy">
            {/* Bell Icon */}
            <button
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-charcoal flex items-center justify-center hover:bg-charcoal/80 transition-colors z-10"
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4 text-warm-gray" />
            </button>

            {/* Error Display */}
            {error && (
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 max-w-md">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-500 flex-1">{error}</p>
                        <button
                            onClick={clearError}
                            className="text-red-500 hover:text-red-400 text-sm font-medium"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {hasMessages ? (
                    /* Chat View */
                    <MessageList messages={currentMessages} isLoading={isSending} />
                ) : (
                    /* Hero View */
                    <div className="flex-1 flex items-center justify-center px-4">
                        <div className="w-full max-w-3xl -mt-12">
                            <h1 className="text-4xl md:text-5xl font-semibold text-center mb-10 text-cream">
                                Just talk to <span className="text-coral">Kuma</span>
                            </h1>
                        </div>
                    </div>
                )}

                {/* Input Section */}
                <div className="flex-shrink-0 px-4 pb-6">
                    <div className="w-full max-w-3xl mx-auto">
                        {/* Input Wrapper */}
                        <div className="w-full bg-charcoal rounded-2xl border border-white/10 overflow-hidden">
                            {/* Upgrade Banner */}
                            <div className="bg-gradient-to-r from-coral/20 to-amber/10 px-4 py-2 flex items-center gap-2 cursor-pointer hover:from-coral/25 hover:to-amber/15 transition-colors">
                                <Zap className="w-4 h-4 text-coral" />
                                <span className="text-sm font-medium text-coral">Upgrade to PRO</span>
                            </div>

                            {/* Input Area */}
                            <div className="p-4">
                                <textarea
                                    ref={textareaRef}
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Talk to Kuma... Use / for prompts"
                                    className="w-full bg-transparent border-none text-cream placeholder:text-warm-gray/50 resize-none outline-none text-base max-h-40 overflow-y-auto"
                                    rows={1}
                                    style={{ minHeight: '24px' }}
                                    disabled={isSending}
                                />

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                                />

                                {/* Toolbar */}
                                <div className="flex items-center justify-between mt-3">
                                    {/* Apps Badge */}
                                    <Badge
                                        variant="outline"
                                        className="bg-charcoal/50 border-white/10 text-warm-gray hover:text-cream cursor-pointer px-3 py-1 gap-2"
                                    >
                                        <Infinity className="w-4 h-4" />
                                        <span className="text-sm">Apps</span>
                                        <span className="bg-charcoal/80 text-coral text-xs px-2 py-0.5 rounded-full">
                                            0
                                        </span>
                                    </Badge>

                                    {/* Action Icons */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleFileAttach}
                                            className="text-warm-gray hover:text-cream transition-colors disabled:opacity-50"
                                            aria-label="Attach file"
                                            type="button"
                                            disabled={isSending}
                                        >
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleVoiceInput}
                                            className={`transition-colors disabled:opacity-50 ${isRecording
                                                    ? 'text-coral animate-pulse'
                                                    : 'text-warm-gray hover:text-cream'
                                                }`}
                                            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                                            type="button"
                                            disabled={isSending}
                                        >
                                            <Mic className="w-5 h-5" />
                                        </button>
                                        <Button
                                            onClick={handleSend}
                                            disabled={!inputValue.trim() || isSending}
                                            size="icon"
                                            className={`rounded-lg transition-all ${inputValue.trim().length > 0 && !isSending
                                                    ? 'bg-coral text-cream hover:bg-coral/90'
                                                    : 'bg-charcoal/60 text-coral hover:bg-charcoal/80 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Help */}
                        <div className="flex items-center justify-between mt-4 text-sm text-warm-gray px-1">
                            <span>
                                Press{' '}
                                <kbd className="px-2 py-1 bg-charcoal/50 rounded border border-white/10 text-xs">
                                    Enter
                                </kbd>{' '}
                                to send,{' '}
                                <kbd className="px-2 py-1 bg-charcoal/50 rounded border border-white/10 text-xs">
                                    Shift+Enter
                                </kbd>{' '}
                                for new line
                            </span>
                            <button className="hover:underline hover:text-cream transition-colors">
                                Global Instructions
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator - Only show when no messages */}
            {!hasMessages && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-warm-gray/70 opacity-70">
                    <span className="text-sm">Scroll down and look at how to use Kuma</span>
                    <ChevronDown className="w-5 h-5 animate-scroll-bounce" />
                </div>
            )}
        </div>
    );
};
