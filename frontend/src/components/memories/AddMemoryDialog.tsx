import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

interface AddMemoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (content: string) => Promise<void>;
}

export const AddMemoryDialog = ({ isOpen, onClose, onAdd }: AddMemoryDialogProps) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onAdd(content.trim());
            setContent('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-100">Add Memory</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label htmlFor="memory-content" className="block text-sm font-medium text-zinc-400 mb-2">
                            What would you like Kuma to remember?
                        </label>
                        <textarea
                            id="memory-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="E.g., My favorite programming language is TypeScript..."
                            rows={5}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                            autoFocus
                        />
                    </div>

                    <p className="text-sm text-zinc-500 mb-4">
                        This memory will be available to Kuma during your conversations.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!content.trim() || isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg font-medium transition-colors"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Memory
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
