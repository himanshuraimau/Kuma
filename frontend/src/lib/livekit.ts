import { Room } from 'livekit-client';

export const createLiveKitRoom = async (token: string): Promise<Room> => {
    const room = new Room({
        adaptiveStream: true,
        dynacast: true,
    });

    await room.connect(import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880', token);
    return room;
};

export const disconnectLiveKitRoom = async (room: Room) => {
    await room.disconnect();
};
