import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Paperclip, Mic, Send, Infinity, ChevronDown, Zap } from 'lucide-react';

export const ChatInterface = () => {
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSend = () => {
        if (inputValue.trim()) {
            // TODO: Implement actual send message functionality
            console.log('Sending message:', inputValue);
            setInputValue('');
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
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-navy px-4">
            {/* Bell Icon */}
            <button
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-charcoal flex items-center justify-center hover:bg-charcoal/80 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4 text-warm-gray" />
            </button>

            {/* Hero Section */}
            <div className="w-full max-w-3xl -mt-12">
                <h1 className="text-4xl md:text-5xl font-semibold text-center mb-10 text-cream">
                    Just talk to <span className="text-coral">Kuma</span>
                </h1>

                {/* Input Wrapper */}
                <div className="w-full bg-charcoal rounded-2xl border border-white/10 overflow-hidden">
                    {/* Upgrade Banner */}
                    <div
                        className="bg-gradient-to-r from-coral/20 to-amber/10 px-4 py-2 flex items-center gap-2 cursor-pointer hover:from-coral/25 hover:to-amber/15 transition-colors"
                    >
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
                            {/* Apps Badge - NOT TOUCHED */}
                            <Badge
                                variant="outline"
                                className="bg-charcoal/50 border-white/10 text-warm-gray hover:text-cream cursor-pointer px-3 py-1 gap-2"
                            >
                                <Infinity className="w-4 h-4" />
                                <span className="text-sm">Apps</span>
                                <span className="bg-charcoal/80 text-coral text-xs px-2 py-0.5 rounded-full">0</span>
                            </Badge>

                            {/* Action Icons */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleFileAttach}
                                    className="text-warm-gray hover:text-cream transition-colors"
                                    aria-label="Attach file"
                                    type="button"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleVoiceInput}
                                    className={`transition-colors ${isRecording
                                            ? 'text-coral animate-pulse'
                                            : 'text-warm-gray hover:text-cream'
                                        }`}
                                    aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                                    type="button"
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                                <Button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    size="icon"
                                    className={`rounded-lg transition-all ${inputValue.trim().length > 0
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
                    <span>Press <kbd className="px-2 py-1 bg-charcoal/50 rounded border border-white/10 text-xs">Enter</kbd> to send, <kbd className="px-2 py-1 bg-charcoal/50 rounded border border-white/10 text-xs">Shift+Enter</kbd> for new line</span>
                    <button className="hover:underline hover:text-cream transition-colors">
                        Global Instructions
                    </button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 flex flex-col items-center gap-2 text-warm-gray/70 opacity-70">
                <span className="text-sm">Scroll down and look at how to use Kuma</span>
                <ChevronDown className="w-5 h-5 animate-scroll-bounce" />
            </div>
        </div>
    );
};
