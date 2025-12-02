import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    isDeleting?: boolean;
}

export const DeleteConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Delete',
    isDeleting = false,
}: DeleteConfirmDialogProps) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-100">
                                    {title}
                                </h3>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 hover:bg-zinc-800 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-400 mb-6 leading-relaxed">
                        {description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
