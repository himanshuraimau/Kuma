import { MessageSquare, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ChatHistoryItemProps {
    id: string;
    title: string | null;
    updatedAt: string;
    isActive: boolean;
    onClick: () => void;
    onDelete: () => void;
}

export const ChatHistoryItem = ({
    title,
    updatedAt,
    isActive,
    onClick,
    onDelete,
}: ChatHistoryItemProps) => {
    const [showDelete, setShowDelete] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this chat?')) {
            onDelete();
        }
    };

    const displayTitle = title || 'New Chat';
    const timeAgo = getTimeAgo(updatedAt);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${isActive
                ? 'bg-coral/10 border border-coral/20'
                : 'hover:bg-charcoal/50 border border-transparent'
                }`}
        >
            <MessageSquare
                className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-coral' : 'text-warm-gray'
                    }`}
            />
            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm font-medium truncate ${isActive ? 'text-coral' : 'text-cream'
                        }`}
                >
                    {displayTitle}
                </p>
                <p className="text-xs text-warm-gray/60">{timeAgo}</p>
            </div>
            {showDelete && (
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-warm-gray hover:text-red-500"
                    aria-label="Delete chat"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

// Helper function to get relative time
function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
