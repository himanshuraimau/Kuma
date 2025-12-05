import { tool } from 'ai';
import { z } from 'zod';
import { google } from 'googleapis';
import { prisma } from '../../../db/prisma';
import { decryptCredentials } from '../../encryption';

/**
 * Create Gmail tools for a specific user
 */
export function createGmailTools(userId: string) {
    // Helper to get Gmail client
    const getGmailClient = async () => {
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId,
                app: { name: 'gmail' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return null;
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        return google.gmail({ version: 'v1', auth: oauth2Client });
    };

    return {
        sendEmail: tool({
            description: 'Send an email via Gmail. Use this when user asks to send email, share information via email, or email a report/document to someone.',
            inputSchema: z.object({
                to: z.string().describe('Recipient email address'),
                subject: z.string().describe('Email subject'),
                body: z.string().describe('Email body content (can be plain text or HTML). Use newlines for line breaks and proper formatting.'),
                cc: z.array(z.string()).optional().describe('CC email addresses'),
                bcc: z.array(z.string()).optional().describe('BCC email addresses'),
            }),
            execute: async ({ to, subject, body, cc, bcc }: { to: string; subject: string; body: string; cc?: string[]; bcc?: string[] }) => {
                const gmail = await getGmailClient();
                if (!gmail) {
                    return 'Gmail is not connected. Please connect Gmail from the Apps page first to send emails.';
                }

                // Convert plain text newlines to HTML breaks for proper formatting
                // Also handle markdown-style formatting
                const htmlBody = body
                    .replace(/\n/g, '<br>\n')  // Convert newlines to <br> tags
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')  // Italic text
                    .replace(/^(\d+)\.\s/gm, '<br>$1. ')  // Numbered lists
                    .replace(/^[-•]\s/gm, '<br>• ');  // Bullet points

                const emailLines = [
                    `To: ${to}`,
                    `Subject: ${subject}`,
                    cc ? `Cc: ${cc.join(', ')}` : '',
                    bcc ? `Bcc: ${bcc.join(', ')}` : '',
                    'Content-Type: text/html; charset=utf-8',
                    '',
                    `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${htmlBody}</div>`,
                ].filter(Boolean);

                const email = emailLines.join('\r\n');
                const encodedEmail = Buffer.from(email).toString('base64url');

                try {
                    await gmail.users.messages.send({
                        userId: 'me',
                        requestBody: { raw: encodedEmail },
                    });
                    return `✅ Email sent successfully to ${to}`;
                } catch (error: any) {
                    throw new Error(`Failed to send email: ${error.message}`);
                }
            },
        }),

        readEmails: tool({
            description: 'Read recent emails from Gmail inbox. Use this to check emails, see unread messages, or find emails from specific senders.',
            inputSchema: z.object({
                maxResults: z.number().default(10).describe('Maximum number of emails to read (default: 10)'),
                query: z.string().optional().describe('Gmail search query (e.g., "from:john@example.com", "subject:invoice", "is:unread")'),
                unreadOnly: z.boolean().default(false).describe('Only show unread emails'),
            }),
            execute: async ({ maxResults = 10, query, unreadOnly = false }: { maxResults?: number; query?: string; unreadOnly?: boolean }) => {
                const gmail = await getGmailClient();
                if (!gmail) {
                    return 'Gmail is not connected. Please connect Gmail from the Apps page first to read emails.';
                }

                let q = query || '';
                if (unreadOnly) {
                    q += ' is:unread';
                }

                const response = await gmail.users.messages.list({
                    userId: 'me',
                    maxResults,
                    q: q.trim() || undefined,
                });

                const messages = response.data.messages || [];

                if (messages.length === 0) {
                    return 'No emails found matching your criteria.';
                }

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
                        .map((e, i) => `${i + 1}. From: ${e.from}\n   Subject: ${e.subject}\n   Date: ${e.date}`)
                        .join('\n\n');

                return summary;
            },
        }),

        searchEmails: tool({
            description: 'Search for specific emails in Gmail using search queries. Useful for finding emails by sender, subject, date, or keywords.',
            inputSchema: z.object({
                query: z.string().describe('Search query (e.g., "subject:invoice", "from:john@example.com", "after:2024/01/01")'),
                maxResults: z.number().default(10).describe('Maximum number of results'),
            }),
            execute: async ({ query, maxResults = 10 }: { query: string; maxResults?: number }) => {
                const gmail = await getGmailClient();
                if (!gmail) {
                    return 'Gmail is not connected. Please connect Gmail from the Apps page first.';
                }

                const response = await gmail.users.messages.list({
                    userId: 'me',
                    maxResults,
                    q: query,
                });

                const messages = response.data.messages || [];

                if (messages.length === 0) {
                    return `No emails found for query: "${query}"`;
                }

                const emailDetails = await Promise.all(
                    messages.slice(0, Math.min(5, messages.length)).map(async (msg) => {
                        const detail = await gmail.users.messages.get({
                            userId: 'me',
                            id: msg.id!,
                            format: 'metadata',
                            metadataHeaders: ['From', 'Subject', 'Date'],
                        });

                        const headers = detail.data.payload?.headers || [];
                        return {
                            from: headers.find((h) => h.name === 'From')?.value,
                            subject: headers.find((h) => h.name === 'Subject')?.value,
                            date: headers.find((h) => h.name === 'Date')?.value,
                        };
                    })
                );

                return (
                    `Found ${messages.length} email(s) for "${query}":\n\n` +
                    emailDetails
                        .map((e, i) => `${i + 1}. From: ${e.from}\n   Subject: ${e.subject}\n   Date: ${e.date}`)
                        .join('\n\n')
                );
            },
        }),
    };
}

/**
 * Create Calendar tools for a specific user
 */
export function createCalendarTools(userId: string) {
    const getCalendarClient = async () => {
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId,
                app: { name: 'calendar' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return null;
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        return google.calendar({ version: 'v3', auth: oauth2Client });
    };

    return {
        createCalendarEvent: tool({
            description: 'Create a new event in Google Calendar. Use this when user wants to schedule a meeting, set a reminder, or create an appointment.',
            inputSchema: z.object({
                summary: z.string().describe('Event title/summary'),
                description: z.string().optional().describe('Event description'),
                startTime: z.string().describe('Start time in ISO format (e.g., "2024-12-03T10:00:00")'),
                endTime: z.string().describe('End time in ISO format (e.g., "2024-12-03T11:00:00")'),
                attendees: z.array(z.string()).optional().describe('List of attendee email addresses'),
                location: z.string().optional().describe('Event location'),
            }),
            execute: async ({ summary, description, startTime, endTime, attendees, location }: { summary: string; description?: string; startTime: string; endTime: string; attendees?: string[]; location?: string }) => {
                const calendar = await getCalendarClient();
                if (!calendar) {
                    return 'Google Calendar is not connected. Please connect Google Calendar from the Apps page first.';
                }

                const event = {
                    summary,
                    description,
                    location,
                    start: { dateTime: startTime, timeZone: 'UTC' },
                    end: { dateTime: endTime, timeZone: 'UTC' },
                    attendees: attendees?.map((email) => ({ email })),
                };

                try {
                    const response = await calendar.events.insert({
                        calendarId: 'primary',
                        requestBody: event,
                    });

                    return `✅ Event "${summary}" created successfully! Event link: ${response.data.htmlLink}`;
                } catch (error: any) {
                    throw new Error(`Failed to create event: ${error.message}`);
                }
            },
        }),

        listCalendarEvents: tool({
            description: 'List upcoming events from Google Calendar. Use this to check schedule, see what meetings are coming up, or find free time.',
            inputSchema: z.object({
                maxResults: z.number().default(10).describe('Maximum number of events to return'),
                timeMin: z.string().optional().describe('Start time to filter events (ISO format)'),
                timeMax: z.string().optional().describe('End time to filter events (ISO format)'),
            }),
            execute: async ({ maxResults = 10, timeMin, timeMax }: { maxResults?: number; timeMin?: string; timeMax?: string }) => {
                const calendar = await getCalendarClient();
                if (!calendar) {
                    return 'Google Calendar is not connected. Please connect Google Calendar from the Apps page first.';
                }

                try {
                    const response = await calendar.events.list({
                        calendarId: 'primary',
                        timeMin: timeMin || new Date().toISOString(),
                        timeMax,
                        maxResults,
                        singleEvents: true,
                        orderBy: 'startTime',
                    });

                    const events = response.data.items || [];

                    if (events.length === 0) {
                        return 'No upcoming events found.';
                    }

                    return (
                        `Found ${events.length} upcoming event(s):\n\n` +
                        events
                            .map((event, i) => {
                                const start = event.start?.dateTime || event.start?.date;
                                const end = event.end?.dateTime || event.end?.date;
                                return `${i + 1}. ${event.summary}\n   Time: ${start} to ${end}\n   Location: ${event.location || 'No location'}`;
                            })
                            .join('\n\n')
                    );
                } catch (error: any) {
                    throw new Error(`Failed to list events: ${error.message}`);
                }
            },
        }),
    };
}

/**
 * Create Google Docs tools for a specific user
 */
export function createDocsTools(userId: string) {
    const getDocsClient = async () => {
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId,
                app: { name: 'docs' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return null;
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        return {
            docs: google.docs({ version: 'v1', auth: oauth2Client }),
            drive: google.drive({ version: 'v3', auth: oauth2Client }),
        };
    };

    return {
        createGoogleDoc: tool({
            description: 'Create a new Google Doc with plain text content. Use this when user wants to save information, create notes, or store data in Google Docs.',
            inputSchema: z.object({
                title: z.string().describe('Document title'),
                content: z.string().describe('Document content (plain text)'),
            }),
            execute: async ({ title, content }: { title: string; content: string }) => {
                const client = await getDocsClient();
                if (!client) {
                    return 'Google Docs is not connected. Please connect Google Docs from the Apps page first.';
                }

                try {
                    const createResponse = await client.docs.documents.create({
                        requestBody: { title },
                    });

                    const documentId = createResponse.data.documentId!;

                    await client.docs.documents.batchUpdate({
                        documentId,
                        requestBody: {
                            requests: [
                                {
                                    insertText: {
                                        location: { index: 1 },
                                        text: content,
                                    },
                                },
                            ],
                        },
                    });

                    return `✅ Document "${title}" has been created and saved successfully.`;
                } catch (error: any) {
                    throw new Error(`Failed to create document: ${error.message}`);
                }
            },
        }),

        readGoogleDoc: tool({
            description: 'Read content from a Google Doc. Use this to retrieve document content.',
            inputSchema: z.object({
                documentId: z.string().describe('Document ID (from the URL: docs.google.com/document/d/{documentId})'),
            }),
            execute: async ({ documentId }: { documentId: string }) => {
                const client = await getDocsClient();
                if (!client) {
                    return 'Google Docs is not connected. Please connect Google Docs from the Apps page first.';
                }

                try {
                    const response = await client.docs.documents.get({ documentId });
                    const doc = response.data;
                    const title = doc.title || 'Untitled';

                    let content = '';
                    if (doc.body?.content) {
                        for (const element of doc.body.content) {
                            if (element.paragraph?.elements) {
                                for (const textElement of element.paragraph.elements) {
                                    if (textElement.textRun?.content) {
                                        content += textElement.textRun.content;
                                    }
                                }
                            }
                        }
                    }

                    return `**${title}**\n\n${content}`;
                } catch (error: any) {
                    throw new Error(`Failed to read document: ${error.message}`);
                }
            },
        }),
    };
}

/**
 * Load all connected app tools for a user
 */
export async function loadUserAppTools(userId: string) {
    const tools: Record<string, any> = {};

    // Check which apps are connected
    const connectedApps = await prisma.userApp.findMany({
        where: { userId, isConnected: true },
        include: { app: true },
    });

    const connectedAppNames = connectedApps.map((ua) => ua.app.name);

    // Add Gmail tools if connected
    if (connectedAppNames.includes('gmail')) {
        const gmailTools = createGmailTools(userId);
        Object.assign(tools, gmailTools);
    }

    // Add Calendar tools if connected
    if (connectedAppNames.includes('calendar')) {
        const calendarTools = createCalendarTools(userId);
        Object.assign(tools, calendarTools);
    }

    // Add Docs tools if connected
    if (connectedAppNames.includes('docs')) {
        const docsTools = createDocsTools(userId);
        Object.assign(tools, docsTools);
    }

    return tools;
}
