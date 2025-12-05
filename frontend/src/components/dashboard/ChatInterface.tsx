import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mic, Send, Infinity as InfinityIcon, Zap, AlertCircle, Command, Image as ImageIcon } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import { useAppsStore } from '@/stores/apps.store';
import { MessageList } from '@/components/chat/MessageList';
import { ImageUpload } from '@/components/chat/ImageUpload';

export const ChatInterface = () => {
    const { id: chatIdFromUrl } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        currentChatId,
        currentMessages,
        isSending,
        isStreaming,
        error,
        sendMessageStreaming,
        clearError,
        loadChat,
        createNewChat,
    } = useChatStore();

    const { connectedApps, loadConnectedApps } = useAppsStore();

    const hasMessages = currentMessages.length > 0;

    // Load connected apps on mount
    useEffect(() => {
        loadConnectedApps();
    }, [loadConnectedApps]);

    // Track the previous chatIdFromUrl to detect navigation to new chat
    const prevChatIdFromUrlRef = useRef<string | undefined>(chatIdFromUrl);

    // Load chat when URL parameter changes
    useEffect(() => {
        if (chatIdFromUrl) {
            // Only load if it's different from current
            if (chatIdFromUrl !== currentChatId) {
                loadChat(chatIdFromUrl);
            }
        } else {
            // If no chat ID in URL and we had one before, user is navigating to new chat
            if (prevChatIdFromUrlRef.current || currentChatId !== null) {
                createNewChat();
            }
        }
        prevChatIdFromUrlRef.current = chatIdFromUrl;
    }, [chatIdFromUrl, currentChatId, loadChat, createNewChat]);

    // Navigate to chat URL when a new chat is created (after sending first message)
    useEffect(() => {
        // Only navigate if:
        // 1. We have a chat ID in the store
        // 2. No chat ID in the URL
        // 3. We're not currently sending
        // 4. We have messages (meaning this is from a new chat that was created from sending a message)
        if (currentChatId && !chatIdFromUrl && !isSending && currentMessages.length > 0) {
            navigate(`/chat/${currentChatId}`, { replace: true });
        }
    }, [currentChatId, chatIdFromUrl, navigate, isSending, currentMessages.length]);

    // NEW: useEffect to focus the input after a message is received.
    // This hook runs whenever the `isSending` state changes.
    useEffect(() => {
        // We only want to focus the input when the AI has *finished* sending a response.
        // So, we check if `isSending` is now false.
        if (!isSending && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isSending]); // The dependency array ensures this effect runs only when `isSending` changes.


    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputValue]);

    const handleSend = async () => {
        if (inputValue.trim() && !isSending) {
            const message = inputValue.trim();
            setInputValue('');
            setShowImageUpload(false);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.focus();
            }

            try {
                await sendMessageStreaming(message);
            } catch (err) {
                console.error('Failed to send message:', err);
                // In case of an error, it's good practice to re-focus the input
                textareaRef.current?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleImageAnalysisComplete = (result: string) => {
        setInputValue(result);
        setShowImageUpload(false);
    };

    return (
        <div className="relative flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">

            {/* --- Header --- */}
            <header className="flex-shrink-0 h-16 flex items-center justify-end px-6 border-b border-white/5 bg-zinc-950/50 backdrop-blur-sm z-10">
                <button
                    className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-all duration-200 border border-white/5"
                    aria-label="Notifications"
                >
                    <Bell className="w-4 h-4 text-zinc-400" />
                </button>
            </header>

            {/* --- Error Toast --- */}
            {error && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5">
                    <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                        <button onClick={clearError} className="text-zinc-400 hover:text-white ml-2">×</button>
                    </div>
                </div>
            )}

            {/* --- Main Scrollable Area --- */}
            <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar">
                <div className="w-full max-w-3xl mx-auto px-4 py-8">
                    {hasMessages ? (
                        <div className="space-y-6 pb-4">
                            <MessageList messages={currentMessages} isLoading={isSending || isStreaming} />
                        </div>
                    ) : (
                        /* Hero Empty State */
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-orange-500/20 shadow-xl mb-4">
                                <InfinityIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
                                Just talk to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Kuma</span>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-md">
                                Your AI assistant for stock analysis, financial planning, and daily tasks.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Input Area (Footer) --- */}
            <div className="flex-shrink-0 px-4 pb-6 pt-2 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
                <div className="w-full max-w-3xl mx-auto">

                    {/* The Chat Input Container */}
                    <div className="relative w-full bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden ring-offset-2 focus-within:ring-2 ring-orange-500/20 transition-all duration-300">

                        {/* Subtle Pro Banner - integrated nicely */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-transparent opacity-50" />

                        <div className="p-4">
                            {/* Image Upload Panel */}
                            {showImageUpload && (
                                <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                    <ImageUpload onAnalysisComplete={handleImageAnalysisComplete} />
                                </div>
                            )}

                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Talk to Kuma... Use / for prompts"
                                className="w-full bg-transparent border-none text-zinc-100 placeholder:text-zinc-500 resize-none outline-none text-base leading-relaxed max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700"
                                rows={1}
                                style={{ minHeight: '24px' }}
                                disabled={isSending}
                            />

                            {/* Input Actions Toolbar */}
                            <div className="flex items-center justify-between mt-4 pt-2">
                                <div className="flex items-center gap-2">
                                    {/* Apps Badge */}
                                    <Badge
                                        variant="outline"
                                        className="bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors h-8 px-3 rounded-full gap-2 font-normal"
                                    >
                                        <InfinityIcon className="w-3.5 h-3.5" />
                                        <span>Apps</span>
                                        <span className="bg-zinc-700 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded-full">{connectedApps.length}</span>
                                    </Badge>

                                    {/* Pro Trigger */}
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-medium transition-colors">
                                        <Zap className="w-3 h-3" />
                                        <span>Upgrade</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                    />

                                    <button
                                        onClick={() => setShowImageUpload(!showImageUpload)}
                                        className={`p-2 rounded-full transition-all ${showImageUpload
                                            ? 'text-orange-500 bg-orange-500/10'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                            }`}
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => setIsRecording(!isRecording)}
                                        className={`p-2 rounded-full transition-all ${isRecording ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>

                                    <Button
                                        onClick={handleSend}
                                        disabled={!inputValue.trim() || isSending}
                                        size="icon"
                                        className={`h-9 w-9 rounded-full transition-all duration-300 shadow-lg ${inputValue.trim()
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white translate-x-0 opacity-100'
                                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                            }`}
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Helper Text */}
                    <div className="flex items-center justify-center mt-3 gap-4 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5">
                            <Command className="w-3 h-3" />
                            <span>Enter to send</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="flex items-center gap-1.5">
                            <span>Shift + Enter for new line</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};