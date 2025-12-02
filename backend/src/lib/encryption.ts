import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
}

// Ensure the key is 32 bytes (64 hex characters)
if (ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
}

const KEY = Buffer.from(ENCRYPTION_KEY, 'hex');

/**
 * Encrypt credentials for secure storage
 */
export function encryptCredentials(credentials: any): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(credentials), 'utf8'),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
        iv: iv.toString('hex'),
        data: encrypted.toString('hex'),
        authTag: authTag.toString('hex'),
    });
}

/**
 * Decrypt credentials from storage
 */
export function decryptCredentials(encryptedData: string): any {
    try {
        const { iv, data, authTag } = JSON.parse(encryptedData);

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            KEY,
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(data, 'hex')),
            decipher.final(),
        ]);

        return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
        throw new Error('Failed to decrypt credentials: ' + (error as Error).message);
    }
}
