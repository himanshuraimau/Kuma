import React, { useEffect, useState } from 'react';
import { useMicVAD } from '@ricky0123/vad-react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';

interface VoiceControlProps {
    chatId?: string;
    onTranscript?: (text: string) => void;
}

type VoiceState = 'idle' | 'listening' | 'processing';

export const VoiceControl: React.FC<VoiceControlProps> = ({ chatId: _chatId, onTranscript }) => {
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [hasPermission, setHasPermission] = useState<boolean>(false);

    // Initialize VAD
    const vad = useMicVAD({
        startOnLoad: false,
        onSpeechStart: () => {
            console.log('🎤 Speech started - recording audio');
            setVoiceState('listening');
            toast.info('Listening... speak now!', { duration: 2000 });
        },
        onSpeechEnd: async (audio: Float32Array) => {
            console.log('✅ Speech ended, processing...', { 
                audioLength: audio.length, 
                duration: audio.length / 16000 + 's' 
            });
            setVoiceState('processing');

            // Store the complete audio
            const completeAudio = new Float32Array(audio);

            try {
                // Convert Float32Array to WAV blob
                const audioBlob = await convertToWavBlob(completeAudio, 16000);
                console.log('📦 Audio blob created:', { 
                    size: audioBlob.size, 
                    type: audioBlob.type,
                    sizeKB: (audioBlob.size / 1024).toFixed(2) + 'KB'
                });

                // Send to backend for transcription
                await transcribeAudio(audioBlob);

            } catch (error) {
                console.error('❌ Error processing voice:', error);
                toast.error('Failed to process voice input');
                setVoiceState('listening'); // Return to listening state
            }
        },
        onVADMisfire: () => {
            console.log('⚠️ VAD misfire (false positive - noise detected but not speech)');
        },
        positiveSpeechThreshold: 0.8,
        negativeSpeechThreshold: 0.75,
    });

    // Log VAD loading state
    useEffect(() => {
        console.log('📡 VAD Status:', {
            loading: vad.loading,
            errored: vad.errored,
            userSpeaking: vad.userSpeaking,
            listening: vad.listening
        });
    }, [vad.loading, vad.errored, vad.userSpeaking, vad.listening]);

    // Check and request microphone permission
    const requestMicrophonePermission = async (): Promise<boolean> => {
        try {
            console.log('Requesting microphone permission...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Stop the stream immediately - we just needed to get permission
            stream.getTracks().forEach(track => track.stop());
            
            console.log('Microphone permission granted');
            setHasPermission(true);
            toast.success('Microphone access granted!');
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            toast.error('Microphone permission denied. Please allow microphone access in your browser settings.');
            setHasPermission(false);
            return false;
        }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        try {
            // Create form data
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice-input.wav');

            // Send to backend for transcription
            const response = await apiClient.post<{ transcript: string }>('/voice/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const transcript = response.data.transcript;
            
            if (transcript && transcript.trim()) {
                // Pass transcript to parent component
                if (onTranscript) {
                    onTranscript(transcript);
                }
                toast.success('Voice transcribed successfully');
            } else {
                toast.error('No speech detected');
            }

            // Return to listening or idle
            setVoiceState('listening');

        } catch (error) {
            console.error('Failed to transcribe audio:', error);
            toast.error('Failed to transcribe audio');
            setVoiceState('listening');
            throw error;
        }
    };

    const toggleVoice = async () => {
        if (voiceState === 'idle') {
            // Check if VAD is still loading
            if (vad.loading) {
                toast.error('Voice detection is still loading. Please wait...');
                return;
            }

            if (vad.errored) {
                toast.error('Voice detection failed to load. Please refresh the page.');
                return;
            }

            // First, request microphone permission if not already granted
            if (!hasPermission) {
                console.log('🎤 Requesting microphone permission...');
                const granted = await requestMicrophonePermission();
                if (!granted) {
                    return; // Don't start VAD if permission denied
                }
            }

            try {
                console.log('▶️ Starting VAD...');
                vad.start();
                setVoiceState('listening');
                toast.success('Voice input started - speak now!', { duration: 3000 });
            } catch (error) {
                console.error('❌ Failed to start VAD:', error);
                toast.error('Failed to start voice input. Please check microphone permissions.');
            }
        } else {
            console.log('⏸️ Pausing VAD...');
            vad.pause();
            setVoiceState('idle');
            toast.info('Voice input stopped');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            vad.pause();
        };
    }, [vad]);

    // Get button variant based on state
    const getButtonVariant = () => {
        if (voiceState === 'idle') return 'secondary';
        if (voiceState === 'processing') return 'default';
        return 'destructive';
    };

    // Get status text
    const getStatusText = () => {
        switch (voiceState) {
            case 'listening':
                return 'Listening...';
            case 'processing':
                return 'Processing...';
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={getButtonVariant()}
                size="icon"
                onClick={toggleVoice}
                disabled={voiceState === 'processing' || vad.loading}
                className={`rounded-full transition-all ${voiceState === 'listening' ? 'animate-pulse ring-2 ring-red-500' : ''
                    }`}
                title={vad.loading ? 'Loading voice detection...' : voiceState === 'idle' ? 'Click to start voice input' : 'Click to stop'}
            >
                {vad.loading || voiceState === 'processing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : voiceState === 'idle' ? (
                    <Mic className="h-4 w-4" />
                ) : (
                    <MicOff className="h-4 w-4" />
                )}
            </Button>
            {getStatusText() && (
                <span className="text-xs text-muted-foreground animate-pulse">
                    {getStatusText()}
                </span>
            )}
            {vad.loading && (
                <span className="text-xs text-muted-foreground">
                    Loading...
                </span>
            )}
        </div>
    );
};

// Helper function to convert Float32Array to WAV Blob
async function convertToWavBlob(audioData: Float32Array, sampleRate: number): Promise<Blob> {
    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = audioData.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // byte rate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    const offset = 44;
    for (let i = 0; i < audioData.length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(offset + i * bytesPerSample, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
