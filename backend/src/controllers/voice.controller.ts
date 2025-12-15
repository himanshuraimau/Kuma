import type { Request, Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { v4 as uuidv4 } from 'uuid';

export const getToken = async (req: Request, res: Response) => {
    try {
        const { roomName, participantName } = req.body;
        const userId = (req as any).user?.id || uuidv4();
        const identity = participantName || `user-${userId}`;
        const room = roomName || `room-${uuidv4()}`;

        if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
            return res.status(500).json({ error: 'LiveKit credentials not configured' });
        }

        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity,
                name: identity,
            }
        );

        at.addGrant({ roomJoin: true, room: room, canPublish: true, canSubscribe: true });

        const token = await at.toJwt();

        res.json({
            token,
            room,
            identity,
        });
    } catch (error) {
        console.error('Error generating LiveKit token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    // Handle LiveKit webhooks (e.g., room started, participant joined)
    // Verify webhook signature
    console.log('LiveKit Webhook:', req.body);
    res.status(200).send('ok');
};
