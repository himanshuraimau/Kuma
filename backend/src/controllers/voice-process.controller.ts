import type { Request, Response } from 'express';
import { SarvamClient } from '../lib/voice/sarvam';
import { Readable } from 'stream';
import { generateAgent } from '../lib/ai/agents';
import type { AgentName } from '../lib/ai/agents';
import { prisma } from '../db/prisma';
import { v4 as uuidv4 } from 'uuid';

// Initialize Sarvam client
const sarvamClient = new SarvamClient(process.env.SARVAM_API_KEY || '');

/**
 * Transcribe audio to text only
 * POST /voice/transcribe
 */
export const transcribeAudio = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        console.log('Transcribing audio...');
        const transcript = await sarvamClient.transcribe(req.file.buffer, req.file.mimetype);
        console.log('Transcript:', transcript);

        if (!transcript || transcript.trim() === '') {
            return res.status(400).json({ error: 'No speech detected in audio' });
        }

        return res.json({ transcript });

    } catch (error) {
        console.error('Error transcribing audio:', error);
        res.status(500).json({
            error: 'Failed to transcribe audio',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Process voice input with full conversation flow (STT + AI + TTS)
 * POST /voice/process
 */
export const processVoiceInput = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Get user ID from request (assumes auth middleware)
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get optional chatId and agentType from request body or query
        const chatId = req.body.chatId || req.query.chatId;
        const agentType = (req.body.agentType || req.query.agentType || 'router') as AgentName;

        // Step 1: Transcribe audio using Sarvam STT
        console.log('Transcribing audio...');
        const transcript = await sarvamClient.transcribe(req.file.buffer, req.file.mimetype);
        console.log('Transcript:', transcript);

        if (!transcript || transcript.trim() === '') {
            return res.status(400).json({ error: 'No speech detected in audio' });
        }

        // Step 2: Get or create chat
        let chat;
        if (chatId) {
            chat = await prisma.chats.findUnique({
                where: { id: chatId, userId },
            });

            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
        } else {
            // Create new chat for voice conversation
            const threadId = uuidv4();
            chat = await prisma.chats.create({
                data: {
                    id: uuidv4(),
                    userId,
                    agentType,
                    threadId,
                    title: transcript.substring(0, 50),
                },
            });
            console.log('Created new chat:', chat.id);
        }

        // Step 3: Process with AI agent to get real response
        console.log('Processing with AI agent...');
        const result = await generateAgent({
            agentName: agentType,
            userId,
            chatId: chat.id,
            message: transcript.trim(),
        });

        const aiResponse = result.response;
        console.log('AI Response:', aiResponse.substring(0, 100) + '...');

        // Step 4: Convert AI response to speech using Sarvam TTS
        console.log('Generating TTS for response...');
        const audioBuffer = await sarvamClient.speak(aiResponse, 'en-IN', 'anushka');

        // Step 5: Return the audio response with text data in headers
        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': audioBuffer.length,
            'X-Transcript': Buffer.from(transcript).toString('base64'),
            'X-AI-Response': Buffer.from(aiResponse).toString('base64'),
            'X-Chat-Id': chat.id, // Include chatId for future messages
        });
        res.send(audioBuffer);

    } catch (error) {
        console.error('Error processing voice input:', error);
        res.status(500).json({
            error: 'Failed to process voice input',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
