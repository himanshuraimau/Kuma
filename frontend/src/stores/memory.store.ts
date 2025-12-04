import { create } from 'zustand';
import type { Memory } from '@/types/memory.types';
import * as memoryApi from '@/api/memory.api';

interface MemoryState {
    // State
    memories: Memory[];
    searchResults: Memory[];
    selectedMemory: Memory | null;
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;
    searchQuery: string;

    // Actions
    loadMemories: (limit?: number, offset?: number) => Promise<void>;
    searchMemories: (query: string, limit?: number) => Promise<void>;
    addMemory: (content: string, metadata?: Record<string, unknown>) => Promise<void>;
    updateMemory: (memoryId: string, content: string) => Promise<void>;
    deleteMemory: (memoryId: string) => Promise<void>;
    selectMemory: (memory: Memory | null) => void;
    clearSearch: () => void;
    clearError: () => void;
}

export const useMemoryStore = create<MemoryState>((set) => ({
    // Initial state
    memories: [],
    searchResults: [],
    selectedMemory: null,
    isLoading: false,
    isSearching: false,
    error: null,
    searchQuery: '',

    // Load all memories
    loadMemories: async (limit = 50, offset = 0) => {
        set({ isLoading: true, error: null });

        try {
            const response = await memoryApi.listMemories(limit, offset);
            set({ memories: response.memories, isLoading: false });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load memories';
            set({
                error: errorMessage,
                isLoading: false,
            });
        }
    },

    // Search memories
    searchMemories: async (query: string, limit = 10) => {
        if (!query.trim()) {
            set({ searchResults: [], searchQuery: '' });
            return;
        }

        set({ isSearching: true, error: null, searchQuery: query });

        try {
            const response = await memoryApi.searchMemories(query, limit);
            set({ searchResults: response.memories, isSearching: false });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to search memories';
            set({
                error: errorMessage,
                isSearching: false,
            });
        }
    },

    // Add a new memory
    addMemory: async (content: string, metadata?: Record<string, unknown>) => {
        set({ isLoading: true, error: null });

        try {
            const response = await memoryApi.addMemory({ content, metadata });
            set((state) => ({
                memories: [response.memory, ...state.memories],
                isLoading: false,
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add memory';
            set({
                error: errorMessage,
                isLoading: false,
            });
        }
    },

    // Update a memory
    updateMemory: async (memoryId: string, content: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await memoryApi.updateMemory(memoryId, { content });
            set((state) => ({
                memories: state.memories.map((m) =>
                    m.id === memoryId ? response.memory : m
                ),
                selectedMemory:
                    state.selectedMemory?.id === memoryId
                        ? response.memory
                        : state.selectedMemory,
                isLoading: false,
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update memory';
            set({
                error: errorMessage,
                isLoading: false,
            });
        }
    },

    // Delete a memory
    deleteMemory: async (memoryId: string) => {
        set({ isLoading: true, error: null });

        try {
            await memoryApi.deleteMemory(memoryId);
            set((state) => ({
                memories: state.memories.filter((m) => m.id !== memoryId),
                searchResults: state.searchResults.filter((m) => m.id !== memoryId),
                selectedMemory:
                    state.selectedMemory?.id === memoryId ? null : state.selectedMemory,
                isLoading: false,
            }));
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete memory';
            set({
                error: errorMessage,
                isLoading: false,
            });
        }
    },

    // Select a memory for viewing/editing
    selectMemory: (memory: Memory | null) => {
        set({ selectedMemory: memory });
    },

    // Clear search results
    clearSearch: () => {
        set({ searchResults: [], searchQuery: '' });
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },
}));
