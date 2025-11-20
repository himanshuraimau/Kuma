import type { Request, Response } from 'express';
import { HumanMessage } from '@langchain/core/messages';
import { createAgent, agentRegistry } from '../agents/base.agent';
import { prisma } from '../db/prisma';
import { v4 as uuidv4 } from 'uuid';

/**
 * Send a message to the chat agent
 * POST /api/chat
 */
export async function sendMessage(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { message, chatId, agentType = 'router' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let chat;
        let threadId: string;

        // Get or create chat
        if (chatId) {
            chat = await prisma.chat.findUnique({
                where: { id: chatId, userId },
            });

            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            threadId = chat.threadId;
        } else {
            // Create new chat
            threadId = uuidv4();
            chat = await prisma.chat.create({
                data: {
                    userId,
                    agentType,
                    threadId,
                    title: message.substring(0, 50), // Use first 50 chars as title
                },
            });
        }

        // Save user message
        await prisma.message.create({
            data: {
                chatId: chat.id,
                role: 'user',
                content: message,
            },
        });

        // Get agent configuration
        const agentConfig = agentRegistry.get(agentType);
        if (!agentConfig) {
            return res.status(400).json({ error: `Agent type "${agentType}" not found` });
        }

        // Create agent
        const agent = await createAgent(agentConfig);

        // Invoke agent with message
        const result = await agent.invoke(
            {
                messages: [new HumanMessage(message)],
            },
            {
                configurable: {
                    thread_id: threadId,
                    userId,
                },
            }
        );

        // Extract assistant response
        const assistantMessage = result.messages[result.messages.length - 1];

        if (!assistantMessage) {
            return res.status(500).json({
                error: 'No response from agent',
                details: 'Agent did not return any messages'
            });
        }

        const responseContent = typeof assistantMessage.content === 'string'
            ? assistantMessage.content
            : JSON.stringify(assistantMessage.content);

        // Save assistant message
        await prisma.message.create({
            data: {
                chatId: chat.id,
                role: 'assistant',
                content: responseContent,
                toolCalls: (assistantMessage as any).tool_calls || null,
            },
        });

        return res.json({
            chatId: chat.id,
            message: responseContent,
            agentType: chat.agentType,
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
