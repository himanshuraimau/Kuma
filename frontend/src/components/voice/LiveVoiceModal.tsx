import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';

interface LiveVoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type VoiceState = 'idle' | 'recording' | 'processing' | 'speaking';

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [transcript, setTranscript] = useState<string>('');
    const [response, setResponse] = useState<string>('');
    const [hasPermission, setHasPermission] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null); // Store chatId for conversation continuity
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);

    // Request microphone permission when modal opens
    useEffect(() => {
        if (isOpen) {
            requestMicrophonePermission();
            setTranscript('');
            setResponse('');
            setChatId(null); // Reset chatId for new conversation
        } else {
            // Cleanup when modal closes
            cleanup();
        }

        return () => {
            cleanup();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Handle spacebar push-to-talk
    useEffect(() => {
        if (!isOpen || !hasPermission) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if spacebar and not already recording
            if (e.code === 'Space' && !isSpacePressed && voiceState === 'idle') {
                e.preventDefault();
                setIsSpacePressed(true);
                startRecording();
                toast.success('Recording... (release SPACE when done)');
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // Stop recording when spacebar is released
            if (e.code === 'Space' && isSpacePressed) {
                e.preventDefault();
                setIsSpacePressed(false);
                stopRecording();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isOpen, hasPermission, isSpacePressed, voiceState]);

    const cleanup = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setVoiceState('idle');
    };

    const requestMicrophonePermission = async (): Promise<boolean> => {
        try {
            console.log('🎤 Requesting microphone permission for live voice...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            console.log('✅ Microphone permission granted');
            setHasPermission(true);
            streamRef.current = stream;
            toast.success('Microphone ready! Click the mic button to start talking.');
            return true;
        } catch (error) {
            console.error('❌ Microphone permission denied:', error);
            toast.error('Microphone permission denied. Please allow microphone access.');
            setHasPermission(false);
            return false;
        }
    };

    const startRecording = async () => {
        try {
            if (!streamRef.current) {
                toast.error('No microphone stream available');
                return;
            }

            audioChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(streamRef.current);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    console.log('📦 Audio chunk:', event.data.size, 'bytes');
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('⏹️ Recording stopped, processing...');
                setVoiceState('processing');

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    console.log('📦 Audio blob created:', (audioBlob.size / 1024).toFixed(2), 'KB');

                    await processVoiceInput(audioBlob);
                } catch (error) {
                    console.error('❌ Error processing audio:', error);
                    toast.error('Failed to process audio');
                    setVoiceState('idle');
                }
            };

            mediaRecorder.onerror = () => {
                toast.error('Recording error occurred');
                setVoiceState('idle');
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(100);
            setVoiceState('recording');
            console.log('▶️ Recording started');
            toast.success('Recording... Click stop when done');

        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            toast.error('Failed to start recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            console.log('⏸️ Stopping recording...');
            mediaRecorderRef.current.stop();
        }
    };

    const processVoiceInput = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice-input.webm');
            
            // Include chatId if we have one (for conversation continuity)
            if (chatId) {
                formData.append('chatId', chatId);
            }

            console.log('🚀 Sending audio to backend for full conversation...', chatId ? `(chatId: ${chatId})` : '(new chat)');

            // Send to backend for full processing (STT + AI + TTS)
            const response = await apiClient.post('/voice/process', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'arraybuffer', // Expect audio response
            });

            console.log('✅ Received audio response');

            // Extract transcript, AI response, and chatId from headers
            const transcriptHeader = response.headers['x-transcript'];
            const aiResponseHeader = response.headers['x-ai-response'];
            const chatIdHeader = response.headers['x-chat-id'];

            let userTranscript = '';
            let aiResponseText = '';

            if (transcriptHeader) {
                userTranscript = atob(transcriptHeader); // Decode base64
                console.log('✅ User said:', userTranscript);
            }

            if (aiResponseHeader) {
                aiResponseText = atob(aiResponseHeader); // Decode base64
                console.log('✅ AI response:', aiResponseText);
            }

            // Store chatId for conversation continuity
            if (chatIdHeader && !chatId) {
                setChatId(chatIdHeader);
                console.log('💬 Chat ID stored:', chatIdHeader);
            }

            // Set the transcript and response
            if (userTranscript.trim()) {
                setTranscript(userTranscript);
            }

            if (aiResponseText.trim()) {
                setResponse(aiResponseText);
            }

            // Play the AI response audio
            setVoiceState('speaking');
            await playAudioResponse(response.data);

            // Return to idle, ready for next recording
            setVoiceState('idle');
            toast.success('Ready for next message');

        } catch (error) {
            console.error('❌ Failed to process voice:', error);
            toast.error('Failed to process voice input');
            setVoiceState('idle');
        }
    };

    const playAudioResponse = async (audioData: ArrayBuffer): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                // Create audio element if it doesn't exist
                if (!audioElementRef.current) {
                    audioElementRef.current = new Audio();
                }

                // Convert ArrayBuffer to Blob
                const audioBlob = new Blob([audioData], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);

                const audio = audioElementRef.current;
                audio.src = audioUrl;

                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    console.log('✅ Audio playback finished');
                    resolve();
                };

                audio.onerror = (error) => {
                    URL.revokeObjectURL(audioUrl);
                    console.error('❌ Audio playback error:', error);
                    reject(error);
                };

                console.log('🔊 Playing AI response...');
                audio.play();
            } catch (error) {
                reject(error);
            }
        });
    };

    // Waveform animation
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;
            const centerY = height / 2;

            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            // Draw waveform based on state
            const amplitude = voiceState === 'recording' ? 60 : voiceState === 'speaking' ? 40 : 20;
            const frequency = voiceState === 'speaking' ? 0.02 : 0.03;
            const time = Date.now() * 0.003;

            ctx.strokeStyle = voiceState === 'recording' 
                ? 'rgba(239, 68, 68, 0.8)' 
                : voiceState === 'speaking'
                ? 'rgba(34, 197, 94, 0.8)'
                : 'rgba(148, 163, 184, 0.5)';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';

            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const y = centerY + Math.sin(x * frequency + time) * amplitude * Math.sin(time * 0.5);
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Continue animation
            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [voiceState]);

    const getStatusText = () => {
        switch (voiceState) {
            case 'recording':
                return 'Recording...';
            case 'processing':
                return 'Processing...';
            case 'speaking':
                return 'AI Speaking...';
            default:
                return 'Ready';
        }
    };

    const getStatusColor = () => {
        switch (voiceState) {
            case 'recording':
                return 'text-red-500';
            case 'processing':
                return 'text-yellow-500';
            case 'speaking':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full bg-gradient-to-br ${
                            voiceState === 'recording' ? 'from-red-500 to-red-600' :
                            voiceState === 'processing' ? 'from-yellow-500 to-yellow-600' :
                            voiceState === 'speaking' ? 'from-green-500 to-green-600' :
                            'from-gray-500 to-gray-600'
                        } ${voiceState !== 'idle' ? 'animate-pulse' : ''}`}>
                            {voiceState === 'processing' ? (
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            ) : voiceState === 'speaking' ? (
                                <Volume2 className="h-6 w-6 text-white" />
                            ) : (
                                <Mic className="h-6 w-6 text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Push-to-Talk Voice Chat</h2>
                            <p className={`text-sm ${getStatusColor()} font-medium`}>
                                {getStatusText()}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-slate-700/50"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Waveform Visualization */}
                <div className="relative h-64 bg-gradient-to-b from-slate-800 to-slate-900">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={256}
                        className="w-full h-full"
                    />
                    
                    {/* Central pulse indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${
                            voiceState === 'recording' ? 'from-red-500/30 to-red-600/30' :
                            voiceState === 'processing' ? 'from-yellow-500/30 to-yellow-600/30' :
                            voiceState === 'speaking' ? 'from-green-500/30 to-green-600/30' :
                            'from-gray-500/30 to-gray-600/30'
                        } ${voiceState !== 'idle' ? 'animate-pulse' : ''} backdrop-blur-sm flex items-center justify-center border-2 ${
                            voiceState === 'recording' ? 'border-red-500/50' :
                            voiceState === 'processing' ? 'border-yellow-500/50' :
                            voiceState === 'speaking' ? 'border-green-500/50' :
                            'border-gray-500/50'
                        }`}>
                            {voiceState === 'processing' ? (
                                <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" />
                            ) : voiceState === 'speaking' ? (
                                <Volume2 className="h-12 w-12 text-green-500" />
                            ) : (
                                <Mic className={`h-12 w-12 ${voiceState === 'recording' ? 'text-red-500' : 'text-gray-500'}`} />
                            )}
                        </div>
                    </div>

                    {/* Spacebar instruction hint */}
                    {voiceState === 'idle' && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-slate-800/90 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-600 shadow-lg">
                                <p className="text-white font-medium flex items-center gap-2">
                                    <kbd className="px-3 py-1 bg-slate-700 rounded border border-slate-500 text-sm">SPACE</kbd>
                                    <span className="text-sm">Hold to talk</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transcript & Response Area */}
                <div className="p-6 space-y-4 min-h-[200px] max-h-[300px] overflow-y-auto bg-slate-900/50">
                    {transcript && (
                        <div className="flex justify-end">
                            <div className="max-w-[80%] p-4 rounded-2xl bg-blue-600 text-white">
                                <p className="text-sm font-medium mb-1">You said:</p>
                                <p>{transcript}</p>
                            </div>
                        </div>
                    )}
                    
                    {response && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] p-4 rounded-2xl bg-slate-700 text-white">
                                <p className="text-sm font-medium mb-1 text-green-400">AI:</p>
                                <p>{response}</p>
                            </div>
                        </div>
                    )}

                    {!transcript && !response && (
                        <div className="flex items-center justify-center h-full text-gray-500 text-center">
                            <div>
                                <Mic className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-lg font-medium">Push-to-Talk Voice Chat</p>
                                <p className="text-sm mt-1">Hold <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">SPACE</kbd> to record</p>
                                <p className="text-xs mt-2 text-gray-600">Release to send • AI responds with voice</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 p-6 bg-slate-800/50 border-t border-slate-700/50">
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${voiceState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></span>
                        {voiceState === 'recording' ? 'Recording...' : voiceState === 'processing' ? 'Processing...' : voiceState === 'speaking' ? 'AI Speaking...' : 'Ready'}
                    </div>

                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onClose}
                        className="rounded-full bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                    >
                        End Conversation
                    </Button>
                </div>

                {/* Decorative gradient overlays */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                </div>
            </div>
        </div>
    );
};
