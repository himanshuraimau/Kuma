import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Infinity as InfinityIcon, Zap, AlertCircle, Command, Image as ImageIcon, X, FileText, Phone } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import { useAppsStore } from '@/stores/apps.store';
import { useDocumentsStore } from '@/stores/documents.store';
import { uploadDocument } from '@/api/documents.api';
import { MessageList } from '@/components/chat/MessageList';
import { VoiceControl } from '@/components/voice/VoiceControl';
import { LiveVoiceModal } from '@/components/voice/LiveVoiceModal';

export const ChatInterface = () => {
    const { id: chatIdFromUrl } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<Array<{ id: string; displayName: string }>>([]);
    const [showDocumentPicker, setShowDocumentPicker] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

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
        stopPolling,
    } = useChatStore();

    const { connectedApps, loadConnectedApps } = useAppsStore();
    const { documents, fetchDocuments } = useDocumentsStore();

    const hasMessages = currentMessages.length > 0;

    console.log('[ChatInterface Render]', {
        hasMessages,
        isSending,
        isStreaming,
        messagesCount: currentMessages.length,
        chatId: currentChatId,
    });

    // Load connected apps and documents on mount
    useEffect(() => {
        loadConnectedApps();
        fetchDocuments();

        // Cleanup: stop polling when component unmounts
        return () => {
            stopPolling();
        };
    }, [loadConnectedApps, fetchDocuments, stopPolling]);

    // Handle URL changes - sync chat state with URL
    useEffect(() => {
        if (chatIdFromUrl) {
            // URL has a chat ID - load that chat if different from current
            // IMPORTANT: Don't reload if we're currently sending/streaming to prevent losing optimistic updates
            if (chatIdFromUrl !== currentChatId && !isSending && !isStreaming) {
                console.log('[ChatInterface] Loading chat from URL:', chatIdFromUrl);
                loadChat(chatIdFromUrl);
            }
        } else {
            // URL is /chat (no ID) - ensure we're in new chat mode
            // IMPORTANT: Don't clear messages if we're currently sending/streaming
            if (!isSending && !isStreaming && (currentChatId !== null || currentMessages.length > 0)) {
                console.log('[ChatInterface] Creating new chat');
                createNewChat();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatIdFromUrl, isSending, isStreaming]); // Include isSending and isStreaming to prevent reloading during message send

    // Navigate to chat URL after first message creates a new chat
    useEffect(() => {
        // Only navigate if:
        // 1. We have a chat ID in the store (new chat was created)
        // 2. URL is /chat (no chat ID)
        // 3. Not currently sending
        // 4. We have messages (confirms this is from sending a message, not just navigation)
        if (currentChatId && !chatIdFromUrl && !isSending && currentMessages.length > 0) {
            navigate(`/chat/${currentChatId}`, { replace: true });
        }
    }, [currentChatId, chatIdFromUrl, isSending, currentMessages.length, navigate]);

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
        if ((inputValue.trim() || selectedImages.length > 0 || selectedDocuments.length > 0) && !isSending) {
            const message = inputValue.trim();
            const imagesToSend = [...selectedImages];
            const documentIdsToSend = selectedDocuments.map(d => d.id);

            setInputValue('');
            setSelectedImages([]);
            setSelectedDocuments([]);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.focus();
            }

            try {
                await sendMessageStreaming(message, undefined, imagesToSend, documentIdsToSend);
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

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        // Limit to 5 images
        const newImages = [...selectedImages, ...imageFiles].slice(0, 5);
        setSelectedImages(newImages);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(images => images.filter((_, i) => i !== index));
    };

    const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const pdfFiles = files.filter(file => file.type === 'application/pdf');

        if (pdfFiles.length === 0) return;

        setUploadingDoc(true);
        try {
            // Upload each PDF
            for (const pdfFile of pdfFiles) {
                const result = await uploadDocument(pdfFile, currentChatId || undefined);

                // Add to selected documents once uploaded
                setSelectedDocuments(docs => [...docs, {
                    id: result.documentId,
                    displayName: result.displayName
                }]);
            }

            // Refresh documents list
            await fetchDocuments();
        } catch (err) {
            console.error('Failed to upload PDF:', err);
            // Show error to user (you could add a toast notification here)
        } finally {
            setUploadingDoc(false);
            // Reset file input
            if (pdfInputRef.current) {
                pdfInputRef.current.value = '';
            }
        }
    };

    const handleVoiceTranscript = (transcript: string) => {
        // Append the transcript to the input value
        setInputValue(prev => {
            const newValue = prev ? `${prev} ${transcript}` : transcript;
            return newValue;
        });
        
        // Focus the textarea
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
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
                    {hasMessages || isSending || isStreaming ? (
                        <div className="space-y-6 pb-4">
                            <MessageList messages={currentMessages} isLoading={isSending || isStreaming} />
                        </div>
                    ) : (
                        /* Hero Empty State - only show when truly empty and not sending */
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-orange-500/20 shadow-xl mb-4">
                                <InfinityIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
                                Just talk to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">kuma-ai</span>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-md">
                                Your AI assistant for stock analysis, financial planning, and daily tasks.
                            </p>

                            {/* Connected Apps Indicator */}
                            {connectedApps.length > 0 && (
                                <div className="mt-6 flex flex-col items-center gap-3">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Connected Apps</p>
                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {connectedApps.map((app) => (
                                            <Badge
                                                key={app.id}
                                                variant="outline"
                                                className="bg-zinc-800/50 border-zinc-700 text-zinc-300 px-3 py-1"
                                            >
                                                <span className="mr-1.5">{app.icon}</span>
                                                {app.displayName}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                            {/* Inline Image and Document Previews */}
                            {(selectedImages.length > 0 || selectedDocuments.length > 0) && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {/* Image Previews */}
                                    {selectedImages.map((image, index) => (
                                        <div
                                            key={`img-${index}`}
                                            className="relative group w-20 h-20 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800"
                                        >
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-zinc-900/80 hover:bg-red-500 rounded-full text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Document Attachments */}
                                    {selectedDocuments.map((doc, index) => (
                                        <div
                                            key={`doc-${doc.id}`}
                                            className="relative group w-32 h-20 rounded-lg border border-zinc-700 bg-zinc-800/50 p-2 flex flex-col justify-center"
                                        >
                                            <FileText className="w-4 h-4 text-orange-500 mb-1" />
                                            <span className="text-xs text-zinc-300 truncate">{doc.displayName}</span>
                                            <button
                                                onClick={() => setSelectedDocuments(docs => docs.filter((_, i) => i !== index))}
                                                className="absolute top-1 right-1 p-1 bg-zinc-900/80 hover:bg-red-500 rounded-full text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add buttons */}
                                    {selectedImages.length < 5 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-700 hover:border-orange-500 flex items-center justify-center text-zinc-500 hover:text-orange-500 transition-colors"
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    {documents.length > 0 && (
                                        <button
                                            onClick={() => setShowDocumentPicker(!showDocumentPicker)}
                                            className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-700 hover:border-blue-500 flex items-center justify-center text-zinc-500 hover:text-blue-500 transition-colors"
                                        >
                                            <FileText className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Document Picker Dropdown */}
                            {showDocumentPicker && documents.length > 0 && (
                                <div className="mb-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700 max-h-48 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-zinc-400">Select documents to attach</span>
                                        <button onClick={() => setShowDocumentPicker(false)} className="text-zinc-500 hover:text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {documents.filter(d => d.status === 'ready').map((doc) => {
                                            const isSelected = selectedDocuments.some(sd => sd.id === doc.id);
                                            return (
                                                <button
                                                    key={doc.id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedDocuments(docs => docs.filter(d => d.id !== doc.id));
                                                        } else {
                                                            setSelectedDocuments(docs => [...docs, { id: doc.id, displayName: doc.displayName }]);
                                                        }
                                                    }}
                                                    className={`w-full p-2 rounded flex items-center gap-2 transition-colors ${isSelected
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                                                        : 'bg-zinc-900 hover:bg-zinc-700 text-zinc-300'
                                                        }`}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    <span className="text-sm truncate flex-1 text-left">{doc.displayName}</span>
                                                    {isSelected && <span className="text-xs">✓</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Talk to kuma-ai... Use / for prompts"
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
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />

                                    <input
                                        ref={pdfInputRef}
                                        type="file"
                                        accept="application/pdf"
                                        multiple
                                        onChange={handlePdfSelect}
                                        className="hidden"
                                    />

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`p-2 rounded-full transition-all ${selectedImages.length > 0
                                            ? 'text-orange-500 bg-orange-500/10'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                            }`}
                                        title="Attach images"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => setShowDocumentPicker(!showDocumentPicker)}
                                        className={`p-2 rounded-full transition-all ${selectedDocuments.length > 0
                                            ? 'text-blue-500 bg-blue-500/10'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                            } ${documents.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={documents.length === 0}
                                        title={documents.length === 0 ? 'No documents available' : 'Attach existing documents'}
                                    >
                                        <FileText className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => pdfInputRef.current?.click()}
                                        disabled={uploadingDoc}
                                        className={`p-2 rounded-full transition-all ${uploadingDoc
                                            ? 'text-blue-500 bg-blue-500/10 cursor-wait'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                            }`}
                                        title="Upload new PDF document"
                                    >
                                        {uploadingDoc ? (
                                            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        )}
                                    </button>

                                    <VoiceControl 
                                        chatId={currentChatId || undefined}
                                        onTranscript={handleVoiceTranscript}
                                    />

                                    <Button
                                        onClick={() => setIsLiveVoiceOpen(true)}
                                        size="icon"
                                        variant="outline"
                                        className="h-9 w-9 rounded-full border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/50 text-orange-400 transition-all duration-300"
                                        title="Live Voice Chat"
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        onClick={handleSend}
                                        disabled={(!inputValue.trim() && selectedImages.length === 0 && selectedDocuments.length === 0) || isSending}
                                        size="icon"
                                        className={`h-9 w-9 rounded-full transition-all duration-300 shadow-lg ${(inputValue.trim() || selectedImages.length > 0 || selectedDocuments.length > 0)
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

            {/* Live Voice Modal */}
            <LiveVoiceModal 
                isOpen={isLiveVoiceOpen}
                onClose={() => setIsLiveVoiceOpen(false)}
            />
        </div>
    );
};