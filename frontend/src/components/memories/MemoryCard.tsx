import { useState } from 'react';
import type { Memory } from '@/types/memory.types';
import { Trash2, Clock, MoreVertical, Copy, Check } from 'lucide-react';

interface MemoryCardProps {
    memory: Memory;
    onDelete: () => void;
}

export const MemoryCard = ({ memory, onDelete }: MemoryCardProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(memory.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShowMenu(false);
    };

    const handleDelete = () => {
        onDelete();
        setShowMenu(false);
    };

    return (
        <div className="group relative bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
            {/* Content */}
            <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed pr-8">
                {memory.content}
            </p>

            {/* Metadata */}
            <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(memory.createdAt)}</span>
                </div>
            </div>

            {/* Menu Button */}
            <div className="absolute top-3 right-3">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-8 z-20 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1">
                            <button
                                onClick={handleCopy}
                                className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-400" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
