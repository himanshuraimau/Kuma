import type { Request, Response } from 'express';
import { streamAgent, generateAgent, agentConfigs } from '../lib/ai/agents';
import type { AgentName } from '../lib/ai/agents';
import { prisma } from '../db/prisma';
import { v4 as uuidv4 } from 'uuid';
import { saveChatImage, type ImageAttachment } from '../lib/storage';

/**
 * Send a message to the chat agent (streaming)
 * POST /api/chat/stream
 * Supports multimodal input: text + images
 */
export async function streamMessage(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { message, chatId, agentType = 'router' } = req.body;
        const files = req.files as Express.Multer.File[] | undefined;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
        }

        // Validate agent type
        const validAgentTypes = Object.keys(agentConfigs);
        if (!validAgentTypes.includes(agentType)) {
            return res.status(400).json({
                error: 'Invalid agent type',
                validTypes: validAgentTypes
            });
        }

        let chat;

        // Get or create chat
        if (chatId) {
            chat = await prisma.chat.findUnique({
                where: { id: chatId, userId },
            });

            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
        } else {
            // Create new chat
            const threadId = uuidv4();
            chat = await prisma.chat.create({
                data: {
                    userId,
                    agentType,
                    threadId,
                    title: message.substring(0, 50),
                },
            });
        }

        // Process image attachments if present
        let imageAttachments: ImageAttachment[] | undefined;
        if (files && files.length > 0) {
            console.log(`📸 Processing ${files.length} image(s) for chat ${chat.id}`);
            imageAttachments = await Promise.all(
                files.map(file => saveChatImage(chat.id, file))
            );
        }

        // Set up SSE headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        // Send chat ID first (for new chats)
        res.write(`data: ${JSON.stringify({ type: 'chat_id', chatId: chat.id })}\n\n`);

        // Stream the response
        await streamAgent({
            agentName: agentType as AgentName,
            userId,
            chatId: chat.id,
            message: message.trim(),
            imageAttachments,
            onChunk: (chunk) => {
                res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
            },
            onToolCall: (toolName, args) => {
                res.write(`data: ${JSON.stringify({ type: 'tool_call', toolName, args })}\n\n`);
            },
            onToolResult: (toolName, result) => {
                // Don't send full result to client (can be large), just notify
                res.write(`data: ${JSON.stringify({ type: 'tool_result', toolName, success: true })}\n\n`);
            },
            onFinish: (fullResponse) => {
                res.write(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`);
            },
        });

        res.end();
    } catch (error) {
        console.error('Error in streamMessage:', error);
        
        // If headers already sent, try to send error via SSE
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream error occurred' })}\n\n`);
            res.end();
        } else {
            return res.status(500).json({
                error: 'Failed to process message',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

/**
 * Send a message to the chat agent (non-streaming)
 * POST /api/chat
 */
export async function sendMessage(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { message, chatId, agentType = 'router' } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
        }

        // Validate agent type
        const validAgentTypes = Object.keys(agentConfigs);
        if (!validAgentTypes.includes(agentType)) {
            return res.status(400).json({
                error: 'Invalid agent type',
                validTypes: validAgentTypes
            });
        }

        let chat;

        // Get or create chat
        if (chatId) {
            chat = await prisma.chat.findUnique({
                where: { id: chatId, userId },
            });

            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
        } else {
            // Create new chat
            const threadId = uuidv4();
            chat = await prisma.chat.create({
                data: {
                    userId,
                    agentType,
                    threadId,
                    title: message.substring(0, 50),
                },
            });
        }

        // Generate response (non-streaming)
        const result = await generateAgent({
            agentName: agentType as AgentName,
            userId,
            chatId: chat.id,
            message: message.trim(),
        });

        return res.json({
            chatId: chat.id,
            message: result.response,
            agentType: chat.agentType,
            usage: result.usage,
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        return res.status(500).json({
            error: 'Failed to process message',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * Get all chats for the current user
 * GET /api/chats
 */
export async function getChats(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const chats = await prisma.chat.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        return res.json({ chats });
    } catch (error) {
        console.error('Error in getChats:', error);
        return res.status(500).json({ error: 'Failed to fetch chats' });
    }
}

/**
 * Get a specific chat with all messages
 * GET /api/chats/:id
 */
export async function getChat(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        const chat = await prisma.chat.findUnique({
            where: { id, userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        return res.json({ chat });
    } catch (error) {
        console.error('Error in getChat:', error);
        return res.status(500).json({ error: 'Failed to fetch chat' });
    }
}

/**
 * Delete a chat
 * DELETE /api/chats/:id
 */
export async function deleteChat(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        const chat = await prisma.chat.findUnique({
            where: { id, userId },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        await prisma.chat.delete({
            where: { id },
        });

        return res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Error in deleteChat:', error);
        return res.status(500).json({ error: 'Failed to delete chat' });
    }
}

/**
 * Update chat title
 * PATCH /api/chats/:id
 */
export async function updateChatTitle(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        const { title } = req.body;

        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
        }

        const chat = await prisma.chat.findUnique({
            where: { id, userId },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const updatedChat = await prisma.chat.update({
            where: { id },
            data: { title: title.trim() },
        });

        return res.json({ chat: updatedChat });
    } catch (error) {
        console.error('Error in updateChatTitle:', error);
        return res.status(500).json({ error: 'Failed to update chat title' });
    }
}
