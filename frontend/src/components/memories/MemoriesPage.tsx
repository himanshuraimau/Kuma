import { useEffect, useState } from 'react';
import { useMemoryStore } from '@/stores/memory.store';
import { MemoryCard } from './MemoryCard';
import { AddMemoryDialog } from './AddMemoryDialog';
import { Brain, Search, Plus, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export const MemoriesPage = () => {
    const {
        memories,
        searchResults,
        isLoading,
        isSearching,
        error,
        searchQuery,
        loadMemories,
        searchMemories,
        addMemory,
        deleteMemory,
        clearSearch,
        clearError,
    } = useMemoryStore();

    const [searchInput, setSearchInput] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    useEffect(() => {
        loadMemories();
    }, [loadMemories]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            searchMemories(searchInput.trim());
        }
    };

    const handleClearSearch = () => {
        setSearchInput('');
        clearSearch();
    };

    const handleAddMemory = async (content: string) => {
        await addMemory(content);
        setIsAddDialogOpen(false);
    };

    const displayedMemories = searchQuery ? searchResults : memories;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Brain className="w-8 h-8 text-violet-400" />
                        <h1 className="text-4xl font-bold">Memories</h1>
                    </div>
                    <p className="text-zinc-400 text-lg">
                        kuma-ai remembers important information from your conversations
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400 font-medium flex-1">{error}</p>
                        <button
                            onClick={clearError}
                            className="text-zinc-400 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search your memories..."
                                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Add Memory Button */}
                    <button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Memory
                    </button>
                </div>

                {/* Search Results Indicator */}
                {searchQuery && (
                    <div className="mb-4 flex items-center gap-2 text-zinc-400">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <span>
                            Found {searchResults.length} memories for "{searchQuery}"
                        </span>
                        <button
                            onClick={handleClearSearch}
                            className="text-violet-400 hover:text-violet-300 underline ml-2"
                        >
                            Clear search
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {(isLoading || isSearching) && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isSearching && displayedMemories.length === 0 && (
                    <div className="text-center py-16">
                        <Brain className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-zinc-400 mb-2">
                            {searchQuery ? 'No memories found' : 'No memories yet'}
                        </h3>
                        <p className="text-zinc-500 mb-6">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'kuma-ai will remember important information from your conversations, or you can add memories manually.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsAddDialogOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add your first memory
                            </button>
                        )}
                    </div>
                )}

                {/* Memories Grid */}
                {!isLoading && !isSearching && displayedMemories.length > 0 && (
                    <div className="grid gap-4">
                        {displayedMemories.map((memory) => (
                            <MemoryCard
                                key={memory.id}
                                memory={memory}
                                onDelete={() => deleteMemory(memory.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Memory Dialog */}
            <AddMemoryDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onAdd={handleAddMemory}
            />
        </div>
    );
};
