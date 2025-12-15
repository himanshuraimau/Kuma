import axios from 'axios';

export class SarvamClient {
    private apiKey: string;
    private baseUrl = 'https://api.sarvam.ai';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Transcribe audio using Saarika model
     * @param audioBuffer Audio data (WAV/MP3)
     * @param mimeType MIME type of the audio
     * @param languageCode Language code (default: unknown for auto-detection)
     */
    async transcribe(audioBuffer: Buffer, mimeType: string = 'audio/wav', languageCode: string = 'unknown'): Promise<string> {
        try {
            const formData = new FormData();
            // Create a Blob from the buffer
            const blob = new Blob([audioBuffer], { type: mimeType });
            formData.append('file', blob, 'audio.wav');
            formData.append('model', 'saarika:v2.5');
            formData.append('language_code', languageCode);

            const response = await axios.post(`${this.baseUrl}/speech-to-text`, formData, {
                headers: {
                    'api-subscription-key': this.apiKey,
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.transcript || '';
        } catch (error) {
            console.error('Sarvam STT Error:', error);
            throw error;
        }
    }

    /**
     * Synthesize speech using Bulbul model
     * @param text Text to speak
     * @param targetLanguageCode Language code (default: en-IN)
     * @param speakerId Speaker ID (default: anushka)
     * 
     * Available speakers:
     * Female: anushka (clear), manisha (warm), vidya (precise), arya (energetic)
     * Male: abhilash (deep), karun (conversational), hitesh (engaging)
     */
    async speak(text: string, targetLanguageCode: string = 'en-IN', speakerId: string = 'anushka'): Promise<Buffer> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/text-to-speech`,
                {
                    text: text,
                    target_language_code: targetLanguageCode,
                    speaker: speakerId,
                    model: 'bulbul:v2',
                    pitch: 0,
                    pace: 1.0,
                    loudness: 1.0,
                    speech_sample_rate: 24000,
                    enable_preprocessing: true,
                },
                {
                    headers: {
                        'api-subscription-key': this.apiKey,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Response contains base64-encoded audio in the 'audios' array
            const audioBase64 = response.data.audios[0];
            return Buffer.from(audioBase64, 'base64');
        } catch (error) {
            console.error('Sarvam TTS Error:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('TTS Error Details:', {
                    status: error.response.status,
                    data: error.response.data,
                });
            }
            throw error;
        }
    }
}
