import React, { useEffect, useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';

interface VoiceControlProps {
    chatId?: string;
    onTranscript?: (text: string) => void;
}

type VoiceState = 'idle' | 'recording' | 'processing';

export const VoiceControl: React.FC<VoiceControlProps> = ({ chatId: _chatId, onTranscript }) => {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const requestMicrophonePermission = async (): Promise<boolean> => {
        try {
            console.log('🎤 Requesting microphone permission...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });
            
            console.log('✅ Microphone permission granted');
            setHasPermission(true);
            streamRef.current = stream;
            toast.success('Microphone access granted!');
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
                console.log('⏹️ Recording stopped');
                setVoiceState('processing');

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    console.log('📦 Audio blob created:', (audioBlob.size / 1024).toFixed(2), 'KB');

                    await transcribeAudio(audioBlob);
                } catch (error) {
                    console.error('❌ Error:', error);
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
            toast.success('Recording... Click again to stop');

        } catch (error) {
            console.error('❌ Failed to start:', error);
            toast.error('Failed to start recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            console.log('⏸️ Stopping...');
            mediaRecorderRef.current.stop();
        }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice.webm');

            console.log('🚀 Transcribing...');

            const response = await apiClient.post<{ transcript: string }>('/voice/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const transcript = response.data.transcript;
            console.log('✅ Transcript:', transcript);
            
            if (transcript && transcript.trim()) {
                if (onTranscript) {
                    onTranscript(transcript);
                }
                toast.success('Transcribed!');
            } else {
                toast.error('No speech detected');
            }

            setVoiceState('idle');

        } catch (error) {
            console.error('❌ Failed:', error);
            toast.error('Transcription failed');
            setVoiceState('idle');
        }
    };

    const toggleRecording = async () => {
        if (voiceState === 'idle') {
            if (!hasPermission) {
                const granted = await requestMicrophonePermission();
                if (!granted) return;
            }
            await startRecording();
        } else if (voiceState === 'recording') {
            stopRecording();
        }
    };

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const getButtonVariant = () => {
        if (voiceState === 'idle') return 'secondary';
        if (voiceState === 'processing') return 'default';
        return 'destructive';
    };

    const getStatusText = () => {
        if (voiceState === 'recording') return 'Recording...';
        if (voiceState === 'processing') return 'Processing...';
        return null;
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={getButtonVariant()}
                size="icon"
                onClick={toggleRecording}
                disabled={voiceState === 'processing'}
                className={`rounded-full transition-all ${voiceState === 'recording' ? 'animate-pulse ring-2 ring-red-500' : ''}`}
            >
                {voiceState === 'processing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : voiceState === 'idle' ? (
                    <Mic className="h-4 w-4" />
                ) : (
                    <Square className="h-4 w-4" />
                )}
            </Button>
            {getStatusText() && (
                <span className="text-xs text-muted-foreground animate-pulse">
                    {getStatusText()}
                </span>
            )}
        </div>
    );
};
