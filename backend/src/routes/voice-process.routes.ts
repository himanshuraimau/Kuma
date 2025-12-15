import { Router } from 'express';
import multer from 'multer';
import { processVoiceInput, transcribeAudio } from '../controllers/voice-process.controller';
import { authenticate } from '../lib/middleware/auth.middleware';

const router = Router();

// Configure multer for memory storage (no disk writes)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (_req, file, cb) => {
        // Allow common audio formats
        const allowedMimeTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    },
});

// Transcribe audio to text only (for chat input)
router.post('/transcribe', authenticate, upload.single('audio'), transcribeAudio);

// Process voice input endpoint (full conversation flow with TTS response)
router.post('/process', authenticate, upload.single('audio'), processVoiceInput);

export default router;
