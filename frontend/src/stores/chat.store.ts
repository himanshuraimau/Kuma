import { create } from 'zustand';
import type { Chat, Message } from '@/types/api.types';
import * as chatApi from '@/api/chat.api';

interface ChatState {
    // State
    currentChatId: string | null;
    currentMessages: Message[];
    chats: Chat[];
    isLoading: boolean;
    isSending: boolean;
    isStreaming: boolean;
    streamingContent: string;
    error: string | null;
    pollingInterval: number | null;

    // Actions
    sendMessage: (message: string, agentType?: string, images?: File[], documentIds?: string[]) => Promise<void>;
    sendMessageStreaming: (message: string, agentType?: string, images?: File[], documentIds?: string[]) => Promise<void>;
    loadChats: () => Promise<void>;
    loadChat: (chatId: string) => Promise<void>;
    deleteChat: (chatId: string) => Promise<void>;
    updateChatTitle: (chatId: string, title: string) => Promise<void>;
    createNewChat: () => void;
    setCurrentChat: (chatId: string | null) => void;
    clearError: () => void;
    startPolling: () => void;
    stopPolling: () => void;
    refreshCurrentChat: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    // Initial state
    currentChatId: null,
    currentMessages: [],
    chats: [],
    isLoading: false,
    isSending: false,
    isStreaming: false,
    streamingContent: '',
    error: null,
    pollingInterval: null,

    // Send a message with streaming
    sendMessageStreaming: async (message: string, agentType = 'router', images?: File[], documentIds?: string[]) => {
        const { currentChatId } = get();

        set({ isSending: true, isStreaming: true, streamingContent: '', error: null });

        // Optimistically add user message to UI
        const tempUserMessageId = `temp-user-${Date.now()}`;
        const tempAssistantMessageId = `temp-assistant-${Date.now()}`;

        // Create temporary image attachments for display
        const tempImageAttachments = images?.map(file => ({
            filename: file.name,
            url: URL.createObjectURL(file),
            mimetype: file.type,
            size: file.size,
        }));

        const tempUserMessage: Message = {
            id: tempUserMessageId,
            chatId: currentChatId || 'temp',
            role: 'user',
            content: message,
            imageAttachments: tempImageAttachments,
            createdAt: new Date().toISOString(),
        };

        // Add user message and placeholder for assistant
        set((state) => ({
            currentMessages: [
                ...state.currentMessages,
                tempUserMessage,
                {
                    id: tempAssistantMessageId,
                    chatId: currentChatId || 'temp',
                    role: 'assistant',
                    content: '',
                    createdAt: new Date().toISOString(),
                },
            ],
        }));

        let newChatId = currentChatId;
        let fullResponse = '';

        try {
            await chatApi.streamMessage(
                {
                    message,
                    chatId: currentChatId || undefined,
                    agentType,
                    images,
                    documentIds,
                },
                {
                    onChatId: (chatId) => {
                        newChatId = chatId;
                        if (!currentChatId) {
                            set({ currentChatId: chatId });
                        }
                    },
                    onJobId: (jobId) => {
                        // Redis queue mode detected
                        console.log('📋 Message queued with job ID:', jobId);

                        // Start polling for new messages since we won't get streaming chunks
                        get().startPolling();
                    },
                    onStatus: (status, message) => {
                        console.log('📊 Job status:', status, message);
                        // Could show status in UI (e.g., "Processing...", "Completed")
                    },
                    onChunk: (content) => {
                        fullResponse += content;
                        set((state) => ({
                            streamingContent: fullResponse,
                            currentMessages: state.currentMessages.map((m) =>
                                m.id === tempAssistantMessageId
                                    ? { ...m, content: fullResponse, chatId: newChatId || m.chatId }
                                    : m
                            ),
                        }));
                    },
                    onToolCall: (toolName) => {
                        // Could add UI indicator for tool calls
                        console.log('Tool called:', toolName);
                    },
                    onToolResult: (toolName, success) => {
                        console.log('Tool result:', toolName, success);
                    },
                    onDone: (response) => {
                        console.log('✅ Received done event with response:', response.substring(0, 100) + '...');

                        // Finalize the message
                        set((state) => ({
                            currentMessages: state.currentMessages.map((m) => {
                                if (m.id === tempUserMessageId) {
                                    return { ...m, id: `user-${Date.now()}`, chatId: newChatId || m.chatId };
                                }
                                if (m.id === tempAssistantMessageId) {
                                    return { ...m, id: `assistant-${Date.now()}`, content: response, chatId: newChatId || m.chatId };
                                }
                                return m;
                            }),
                            isSending: false,
                            isStreaming: false,
                            streamingContent: '',
                        }));

                        // Stop polling when message is done
                        get().stopPolling();
                    },
                    onError: (error) => {
                        set({
                            error,
                            isSending: false,
                            isStreaming: false,
                        });
                    },
                }
            );

            // Reload chats to update sidebar
            await get().loadChats();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
            set({
                error: errorMessage,
                isSending: false,
                isStreaming: false,
            });
            // Remove optimistic messages on error
            set((state) => ({
                currentMessages: state.currentMessages.filter(
                    (m) => m.id !== tempUserMessageId && m.id !== tempAssistantMessageId
                ),
            }));
        }
    },

    // Send a message (non-streaming fallback)
    sendMessage: async (message: string, agentType = 'router') => {
        const { currentChatId } = get();

        set({ isSending: true, error: null });

        try {
            // Optimistically add user message to UI
            const tempUserMessage: Message = {
                id: `temp-${Date.now()}`,
                chatId: currentChatId || 'temp',
                role: 'user',
                content: message,
                createdAt: new Date().toISOString(),
            };

            set((state) => ({
                currentMessages: [...state.currentMessages, tempUserMessage],
            }));

            // Send message to API
            const response = await chatApi.sendMessage({
                message,
                chatId: currentChatId || undefined,
                agentType,
            });

            // Update current chat ID if this was a new chat
            if (!currentChatId) {
                set({ currentChatId: response.chatId });
            }

            // Add assistant response to messages
            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                chatId: response.chatId,
                role: 'assistant',
                content: response.message,
                createdAt: new Date().toISOString(),
            };

            set((state) => ({
                currentMessages: [
                    ...state.currentMessages.filter(m => m.id !== tempUserMessage.id),
                    { ...tempUserMessage, id: `user-${Date.now()}`, chatId: response.chatId },
                    assistantMessage,
                ],
                isSending: false,
            }));

            // Reload chats to update sidebar
            await get().loadChats();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
            set({
                error: errorMessage,
                isSending: false,
            });
            // Remove optimistic message on error
            set((state) => ({
                currentMessages: state.currentMessages.filter(m => !m.id.startsWith('temp-')),
            }));
        }
    },

    // Load all chats
    loadChats: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await chatApi.getChats();
            set({ chats: response.chats, isLoading: false });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load chats';
            set({
                error: errorMessage,
                isLoading: false,
            });
        }
    },

    // Load a specific chat with messages
    loadChat: async (chatId: string) => {
        // Don't reload if we're currently sending/streaming to preserve optimistic updates
        const { isSending, isStreaming } = get();
        if (isSending || isStreaming) {
            console.log('⏸️  Skipping loadChat because message is being sent/streamed');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await chatApi.getChat(chatId);
            set({
                currentChatId: chatId,
                currentMessages: response.chat.messages || [],
                isLoading: false,
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load chat';
            set({
                error: errorMessage,
                isLoading: false,
            });
        }
    },

    // Delete a chat
    deleteChat: async (chatId: string) => {
        set({ isLoading: true, error: null });

        try {
            await chatApi.deleteChat(chatId);

            // Remove from chats list
            set((state) => ({
                chats: state.chats.filter(c => c.id !== chatId),
                isLoading: false,
            }));

            // If deleted chat was current, clear it
            if (get().currentChatId === chatId) {
                set({ currentChatId: null, currentMessages: [] });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete chat';
            set({
                error: errorMessage,
                isLoading: false,
            });
        }
    },

    // Update chat title
    updateChatTitle: async (chatId: string, title: string) => {
        try {
            const response = await chatApi.updateChatTitle(chatId, { title });

            // Update in chats list
            set((state) => ({
                chats: state.chats.map(c =>
                    c.id === chatId ? response.chat : c
                ),
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update chat title';
            set({
                error: errorMessage,
            });
        }
    },

    // Create a new chat
    createNewChat: () => {
        set({
            currentChatId: null,
            currentMessages: [],
            error: null,
        });
    },

    // Set current chat
    setCurrentChat: (chatId: string | null) => {
        if (chatId) {
            get().loadChat(chatId);
        } else {
            set({
                currentChatId: null,
                currentMessages: [],
            });
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },

    // Refresh current chat to check for new messages
    refreshCurrentChat: async () => {
        const { currentChatId, isSending } = get();
        if (!currentChatId || !isSending) return;

        try {
            const response = await chatApi.getChat(currentChatId);
            const newMessages = response.chat.messages || [];

            // Check if we have a completed assistant response
            const currentMessages = get().currentMessages;
            const lastCurrentMsg = currentMessages[currentMessages.length - 1];
            const lastNewMsg = newMessages[newMessages.length - 1];

            // If we got a new assistant message with content, update
            if (newMessages.length > currentMessages.length ||
                (lastNewMsg?.role === 'assistant' && lastNewMsg?.content &&
                    (!lastCurrentMsg || lastCurrentMsg.content !== lastNewMsg.content))) {

                console.log('🔄 Polling detected new message, updating UI');
                set({
                    currentMessages: newMessages,
                    isSending: false,
                    isStreaming: false,
                    streamingContent: '',
                });

                // Stop polling once we get the response
                get().stopPolling();
            }
        } catch (error) {
            console.error('Failed to refresh chat:', error);
        }
    },

    // Start polling for new messages (useful when Redis queue is enabled)
    startPolling: () => {
        const { pollingInterval } = get();

        // Don't start if already polling
        if (pollingInterval) return;

        const interval = setInterval(() => {
            get().refreshCurrentChat();
        }, 2000) as unknown as number; // Poll every 2 seconds

        set({ pollingInterval: interval });
    },

    // Stop polling
    stopPolling: () => {
        const { pollingInterval } = get();

        if (pollingInterval) {
            clearInterval(pollingInterval);
            set({ pollingInterval: null });
        }
    },
}));
