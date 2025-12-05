import { Copy, Check, User, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ImageAttachment } from '@/types/api.types';

interface MessageBubbleProps {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp: string;
    imageAttachments?: ImageAttachment[];
}

export const MessageBubble = ({ role, content, timestamp, imageAttachments }: MessageBubbleProps) => {
    const [copied, setCopied] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isUser = role === 'user';

    return (
        <>
            <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>

                    {/* Avatar + Name Row (Optional) */}
                    <div className={`flex items-center gap-2 mb-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shadow-sm ${isUser ? 'bg-zinc-800' : ''}`}>
                            {isUser ? <User className="w-3.5 h-3.5 text-zinc-400" /> : <img src="/logo.png" alt="Kuma" className="w-5 h-5 object-contain" />}
                        </div>
                        <span className="text-xs font-medium text-zinc-500">
                            {isUser ? 'You' : 'Kuma'}
                        </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                        className={`relative px-5 py-3.5 shadow-sm ${isUser
                            ? 'bg-zinc-800 text-zinc-100 rounded-2xl rounded-tr-sm'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm'
                            }`}
                    >
                        {/* Image Attachments (for user messages) */}
                        {isUser && imageAttachments && imageAttachments.length > 0 && (
                            <div className={`mb-3 grid gap-2 ${imageAttachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {imageAttachments.map((image, index) => (
                                    <div
                                        key={index}
                                        className="relative group/img cursor-pointer rounded-lg overflow-hidden border border-zinc-700 hover:border-orange-500 transition-colors"
                                        onClick={() => setSelectedImage(image.url)}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`Attachment ${index + 1}`}
                                            className="w-full h-auto max-h-64 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isUser ? (
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{content}</p>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none 
                                prose-p:text-zinc-300 prose-p:leading-relaxed
                                prose-headings:text-zinc-100 prose-headings:font-semibold
                                prose-strong:text-orange-500 prose-strong:font-bold
                                prose-code:text-orange-400 prose-code:bg-zinc-950/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                                prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800
                                prose-ul:text-zinc-300 prose-ol:text-zinc-300
                                prose-a:text-blue-400 hover:prose-a:text-blue-300
                            ">
                                <ReactMarkdown>{content}</ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Footer: Timestamp & Actions */}
                    <div className={`flex items-center gap-3 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[10px] text-zinc-600 font-medium">
                            {new Date(timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                        {!isUser && (
                            <button
                                onClick={handleCopy}
                                className="p-1 -m-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                                title="Copy to clipboard"
                            >
                                {copied ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh]">
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};