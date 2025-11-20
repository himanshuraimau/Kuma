import { MessageSquare, Trash2 } from 'lucide-react';

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
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        // In a real app, consider a custom modal instead of window.confirm
        if (window.confirm('Delete this chat permanently?')) {
            onDelete();
        }
    };

    const displayTitle = title || 'New Chat';
    const timeAgo = getTimeAgo(updatedAt);

    return (
        <div
            onClick={onClick}
            className={`
                group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200
                border border-transparent
                ${isActive 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                }
            `}
        >
            {/* Icon */}
            <MessageSquare
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-orange-500' : 'text-zinc-500 group-hover:text-zinc-400'
                }`}
            />

            {/* Text Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                <span className={`text-sm font-medium truncate leading-tight ${
                    isActive ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}>
                    {displayTitle}
                </span>
            </div>

            {/* Meta / Actions Area - Fixed Width for alignment */}
            <div className="flex-shrink-0 min-w-[3rem] flex justify-end">
                {/* Timestamp - Visible by default, hidden on hover */}
                <span className={`text-[10px] font-medium text-zinc-600 transition-opacity duration-200 group-hover:opacity-0 group-hover:hidden ${
                    isActive ? 'text-zinc-500' : ''
                }`}>
                    {timeAgo}
                </span>

                {/* Delete Button - Hidden by default, visible on hover */}
                <button
                    onClick={handleDelete}
                    className="hidden group-hover:block p-1 -mr-1 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                    title="Delete chat"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Active Indicator (Optional - subtle orange glow on left) */}
            {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-orange-500 rounded-full" />
            )}
        </div>
    );
};

// Helper: Compact time format
function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
}