import { useState, useRef } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as uploadApi from '@/api/upload.api';

interface ImageUploadProps {
    onAnalysisComplete: (result: string) => void;
}

export const ImageUpload = ({ onAnalysisComplete }: ImageUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisMode, setAnalysisMode] = useState<'analyze' | 'extract' | 'describe'>('describe');
    const [customPrompt, setCustomPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type', {
                description: 'Please select an image file',
            });
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large', {
                description: 'Maximum file size is 10MB',
            });
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);

        try {
            let result: string;

            switch (analysisMode) {
                case 'analyze':
                    if (!customPrompt.trim()) {
                        toast.error('Prompt required', {
                            description: 'Please enter a prompt for analysis',
                        });
                        setIsAnalyzing(false);
                        return;
                    }
                    const analyzeRes = await uploadApi.analyzeImage(selectedFile, customPrompt);
                    result = analyzeRes.analysis;
                    break;

                case 'extract':
                    const extractRes = await uploadApi.extractText(selectedFile);
                    result = extractRes.text;
                    break;

                case 'describe':
                    const describeRes = await uploadApi.describeImage(selectedFile);
                    result = describeRes.description;
                    break;
            }

            toast.success('Analysis complete!');
            onAnalysisComplete(result);
            handleClear();
        } catch (error: any) {
            toast.error('Analysis failed', {
                description: error.response?.data?.error || 'Please try again',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreview(null);
        setCustomPrompt('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input */}
            <div className="flex items-center gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                />
                <label htmlFor="image-upload">
                    <Button
                        type="button"
                        variant="outline"
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                    >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Select Image
                    </Button>
                </label>

                {selectedFile && (
                    <span className="text-sm text-zinc-400 truncate max-w-xs">
                        {selectedFile.name}
                    </span>
                )}
            </div>

            {/* Preview */}
            {preview && (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-w-full max-h-64 rounded-lg border border-zinc-800"
                    />
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 p-1 bg-zinc-900/80 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Analysis Mode */}
            {selectedFile && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={analysisMode === 'describe' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAnalysisMode('describe')}
                            className={analysisMode === 'describe' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                        >
                            Describe
                        </Button>
                        <Button
                            type="button"
                            variant={analysisMode === 'extract' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAnalysisMode('extract')}
                            className={analysisMode === 'extract' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                        >
                            Extract Text
                        </Button>
                        <Button
                            type="button"
                            variant={analysisMode === 'analyze' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAnalysisMode('analyze')}
                            className={analysisMode === 'analyze' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                        >
                            Custom
                        </Button>
                    </div>

                    {analysisMode === 'analyze' && (
                        <input
                            type="text"
                            placeholder="What do you want to know about this image?"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    )}

                    <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Analyze Image'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};
