import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Clock, TrendingUp } from 'lucide-react';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock recent searches
    const recentSearches = [
        { id: 1, query: 'GitHub repo count', icon: Clock },
        { id: 2, query: 'Email automation', icon: Clock },
        { id: 3, query: 'UX design trends', icon: TrendingUp },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual search functionality
        console.log('Searching for:', searchQuery);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-charcoal border-white/10 text-cream max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-cream text-lg font-semibold">
                        Search Chats
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSearch} className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                        <Input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 bg-navy/50 border-white/15 text-cream placeholder:text-warm-gray/50 focus:border-coral focus:ring-coral/20"
                            autoFocus
                        />
                    </div>

                    {/* Recent Searches */}
                    {searchQuery === '' && (
                        <div className="space-y-2">
                            <p className="text-sm text-warm-gray px-2">Recent Searches</p>
                            <div className="space-y-1">
                                {recentSearches.map((search) => (
                                    <button
                                        key={search.id}
                                        type="button"
                                        onClick={() => setSearchQuery(search.query)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-navy/50 transition-colors text-left"
                                    >
                                        <search.icon className="w-4 h-4 text-warm-gray shrink-0" />
                                        <span className="text-cream text-sm">{search.query}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results (when searching) */}
                    {searchQuery !== '' && (
                        <div className="space-y-2">
                            <p className="text-sm text-warm-gray px-2">
                                {searchQuery ? 'Search Results' : 'Start typing to search...'}
                            </p>
                            <div className="text-center py-8 text-warm-gray text-sm">
                                No results found for "{searchQuery}"
                            </div>
                        </div>
                    )}
                </form>

                <div className="text-xs text-warm-gray/70 text-center pt-2 border-t border-white/5">
                    Press <kbd className="px-2 py-1 bg-navy/50 rounded border border-white/10">Esc</kbd> to close
                </div>
            </DialogContent>
        </Dialog>
    );
};
