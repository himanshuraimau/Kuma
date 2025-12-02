import { z } from 'zod';
import { google } from 'googleapis';
import type { BaseTool } from '../../tools/base.tool';
import { decryptCredentials } from '../../lib/encryption';
import { prisma } from '../../db/prisma';

/**
 * Send an email via Gmail
 */
export const sendEmailTool: BaseTool = {
    name: 'send_email',
    description:
        'Send an email via Gmail. Use this when user asks to send email, share information via email, or email a report/document to someone.',
    category: 'gmail',
    requiresAuth: true,
    schema: z.object({
        to: z.string().describe('Recipient email address'),
        subject: z.string().describe('Email subject'),
        body: z.string().describe('Email body content (can be plain text or HTML)'),
        cc: z.array(z.string()).optional().describe('CC email addresses'),
        bcc: z.array(z.string()).optional().describe('BCC email addresses'),
    }),

    async execute(input, context) {
        if (!context?.userId) {
            throw new Error('User not authenticated');
        }

        // Get user's Gmail credentials
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId: context.userId,
                app: { name: 'gmail' },
                isConnected: true,
            },
            include: { app: true },
        });

        if (!userApp) {
            return 'Gmail is not connected. Please connect Gmail from the Apps page first to send emails.';
        }

        // Decrypt credentials
        const credentials = decryptCredentials(userApp.credentials as string);

        // Initialize Gmail API
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Create email message
        const emailLines = [
            `To: ${input.to}`,
            `Subject: ${input.subject}`,
            input.cc ? `Cc: ${input.cc.join(', ')}` : '',
            input.bcc ? `Bcc: ${input.bcc.join(', ')}` : '',
            'Content-Type: text/html; charset=utf-8',
            '',
            input.body,
        ].filter(Boolean);

        const email = emailLines.join('\r\n');
        const encodedEmail = Buffer.from(email).toString('base64url');

        // Send email
        try {
            await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedEmail,
                },
            });

            return `✅ Email sent successfully to ${input.to}`;
        } catch (error: any) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    },
};

/**
 * Read recent emails from Gmail
 */
export const readEmailsTool: BaseTool = {
    name: 'read_emails',
    description:
        'Read recent emails from Gmail inbox. Use this to check emails, see unread messages, or find emails from specific senders.',
    category: 'gmail',
    requiresAuth: true,
    schema: z.object({
        maxResults: z
            .number()
            .default(10)
            .describe('Maximum number of emails to read (default: 10)'),
        query: z
            .string()
            .optional()
            .describe(
                'Gmail search query (e.g., "from:john@example.com", "subject:invoice", "is:unread")'
            ),
        unreadOnly: z
            .boolean()
            .default(false)
            .describe('Only show unread emails'),
    }),

    async execute(input, context) {
        if (!context?.userId) {
            throw new Error('User not authenticated');
        }

        const userApp = await prisma.userApp.findFirst({
            where: {
                userId: context.userId,
                app: { name: 'gmail' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return 'Gmail is not connected. Please connect Gmail from the Apps page first to read emails.';
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Build query
        let q = input.query || '';
        if (input.unreadOnly) {
            q += ' is:unread';
        }

        // List messages
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: input.maxResults,
            q: q.trim() || undefined,
        });

        const messages = response.data.messages || [];

        if (messages.length === 0) {
            return 'No emails found matching your criteria.';
        }

        // Fetch message details (limit to first 5 for performance)
        const emailDetails = await Promise.all(
            messages.slice(0, Math.min(5, messages.length)).map(async (msg) => {
                const detail = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id!,
                    format: 'metadata',
                    metadataHeaders: ['From', 'Subject', 'Date'],
                });

                const headers = detail.data.payload?.headers || [];
                const from = headers.find((h) => h.name === 'From')?.value;
                const subject = headers.find((h) => h.name === 'Subject')?.value;
                const date = headers.find((h) => h.name === 'Date')?.value;

                return { from, subject, date };
            })
        );

        const summary =
            `Found ${messages.length} email(s):\n\n` +
            emailDetails
                .map(
                    (e, i) =>
                        `${i + 1}. From: ${e.from}\n   Subject: ${e.subject}\n   Date: ${e.date}`
                )
                .join('\n\n');

        return summary;
    },
};

/**
 * Search for specific emails in Gmail
 */
export const searchEmailsTool: BaseTool = {
    name: 'search_emails',
    description:
        'Search for specific emails in Gmail using search queries. Useful for finding emails by sender, subject, date, or keywords.',
    category: 'gmail',
    requiresAuth: true,
    schema: z.object({
        query: z
            .string()
            .describe(
                'Search query (e.g., "subject:invoice", "from:john@example.com", "after:2024/01/01")'
            ),
        maxResults: z.number().default(10).describe('Maximum number of results'),
    }),

    async execute(input, context) {
        // Reuse readEmailsTool logic
        return readEmailsTool.execute(
            {
                query: input.query,
                maxResults: input.maxResults,
                unreadOnly: false,
            },
            context
        );
    },
};
