import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'temp');
const CHAT_IMAGES_DIR = path.join(process.cwd(), 'uploads', 'chats');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Ensure upload directories exist
if (!existsSync(UPLOAD_DIR)) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
}
if (!existsSync(CHAT_IMAGES_DIR)) {
    await fs.mkdir(CHAT_IMAGES_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
};

// Create multer upload instance
export const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter,
});

/**
 * Delete a file from the filesystem
 */
export async function deleteFile(filepath: string): Promise<void> {
    try {
        if (existsSync(filepath)) {
            await fs.unlink(filepath);
            console.log(`🗑️  Deleted file: ${filepath}`);
        }
    } catch (error) {
        console.error(`Failed to delete file ${filepath}:`, error);
    }
}

/**
 * Get file path in uploads directory
 */
export function getUploadPath(filename: string): string {
    return path.join(UPLOAD_DIR, filename);
}

/**
 * Get chat images directory for a specific chat
 */
export function getChatImagesDir(chatId: string): string {
    return path.join(CHAT_IMAGES_DIR, chatId);
}

/**
 * Get full path for a chat image
 */
export function getChatImagePath(chatId: string, filename: string): string {
    return path.join(getChatImagesDir(chatId), filename);
}

export interface ImageAttachment {
    filename: string;
    url: string;
    mimetype: string;
    size: number;
}

/**
 * Save uploaded image to chat-specific directory
 */
export async function saveChatImage(
    chatId: string,
    file: Express.Multer.File
): Promise<ImageAttachment> {
    const chatDir = getChatImagesDir(chatId);
    
    // Ensure chat directory exists
    if (!existsSync(chatDir)) {
        await fs.mkdir(chatDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `image-${Date.now()}-${uuidv4()}${ext}`;
    const filepath = path.join(chatDir, filename);

    // Move file from temp to chat directory
    await fs.copyFile(file.path, filepath);
    await deleteFile(file.path); // Clean up temp file

    const attachment: ImageAttachment = {
        filename,
        url: `/api/upload/chats/${chatId}/${filename}`,
        mimetype: file.mimetype,
        size: file.size,
    };

    console.log(`💾 Saved chat image: ${attachment.url}`);
    return attachment;
}

/**
 * Get image file as base64 for Gemini API
 */
export async function getChatImageBase64(chatId: string, filename: string): Promise<string> {
    const filepath = getChatImagePath(chatId, filename);
    if (!existsSync(filepath)) {
        throw new Error(`Image not found: ${filepath}`);
    }
    const data = await fs.readFile(filepath);
    return data.toString('base64');
}

/**
 * Clean up old files (older than 1 hour) in temp directory
 */
export async function cleanupOldFiles(): Promise<void> {
    try {
        const files = await fs.readdir(UPLOAD_DIR);
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;

        for (const file of files) {
            const filepath = path.join(UPLOAD_DIR, file);
            const stats = await fs.stat(filepath);
            const age = now - stats.mtimeMs;

            if (age > ONE_HOUR) {
                await deleteFile(filepath);
            }
        }
    } catch (error) {
        console.error('Failed to cleanup old files:', error);
    }
}

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);
