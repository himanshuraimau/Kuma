import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'temp');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
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
 * Clean up old files (older than 1 hour)
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
