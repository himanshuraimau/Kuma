import { tool } from 'ai';
import { z } from 'zod';
import { google } from 'googleapis';
import { prisma } from '../../../db/prisma';
import { decryptCredentials } from '../../encryption';
import { createDocumentTools } from './document.tools';

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
 * Create Google Drive tools for a specific user
 */
export function createDriveTools(userId: string) {
    const getDriveClient = async () => {
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId,
                app: { name: 'drive' },
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

        return google.drive({ version: 'v3', auth: oauth2Client });
    };

    return {
        listDriveFiles: tool({
            description: 'List files in Google Drive. Use to browse files and folders. Can filter by folder and file type.',
            inputSchema: z.object({
                folderId: z.string().optional().describe('Folder ID to list (default: root folder)'),
                maxResults: z.number().default(20).describe('Maximum files to return (default: 20)'),
                fileType: z.enum(['all', 'folder', 'document', 'spreadsheet', 'presentation', 'image', 'pdf']).default('all').describe('Filter by file type'),
            }),
            execute: async ({ folderId, maxResults = 20, fileType = 'all' }: { folderId?: string; maxResults?: number; fileType?: string }) => {
                const drive = await getDriveClient();
                if (!drive) {
                    return 'Google Drive is not connected. Please connect Google Drive from the Apps page first.';
                }

                try {
                    let query = folderId ? `'${folderId}' in parents` : "'root' in parents";
                    query += ' and trashed = false';

                    // Add file type filters
                    if (fileType === 'folder') {
                        query += " and mimeType = 'application/vnd.google-apps.folder'";
                    } else if (fileType === 'document') {
                        query += " and mimeType = 'application/vnd.google-apps.document'";
                    } else if (fileType === 'spreadsheet') {
                        query += " and mimeType = 'application/vnd.google-apps.spreadsheet'";
                    } else if (fileType === 'presentation') {
                        query += " and mimeType = 'application/vnd.google-apps.presentation'";
                    } else if (fileType === 'image') {
                        query += " and mimeType contains 'image/'";
                    } else if (fileType === 'pdf') {
                        query += " and mimeType = 'application/pdf'";
                    }

                    const response = await drive.files.list({
                        q: query,
                        pageSize: maxResults,
                        fields: 'files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink)',
                        orderBy: 'modifiedTime desc',
                    });

                    const files = response.data.files || [];

                    if (files.length === 0) {
                        return 'No files found in this location.';
                    }

                    const fileList = files.map((file, i) => {
                        const type = file.mimeType?.includes('folder') ? '📁' : '📄';
                        const size = file.size ? `${Math.round(parseInt(file.size) / 1024)}KB` : '';
                        return `${i + 1}. ${type} ${file.name}\n   ID: ${file.id}\n   Modified: ${file.modifiedTime}${size ? `\n   Size: ${size}` : ''}`;
                    }).join('\n\n');

                    return `Found ${files.length} file(s):\n\n${fileList}`;
                } catch (error: any) {
                    throw new Error(`Failed to list files: ${error.message}`);
                }
            },
        }),

        searchDriveFiles: tool({
            description: 'Search for files in Google Drive by name or content. Returns matching files with their IDs.',
            inputSchema: z.object({
                query: z.string().describe('Search query (file name or content keywords)'),
                maxResults: z.number().default(10).describe('Maximum results (default: 10)'),
                fileType: z.enum(['all', 'folder', 'document', 'spreadsheet', 'presentation', 'image', 'pdf']).default('all').describe('Filter by file type'),
            }),
            execute: async ({ query, maxResults = 10, fileType = 'all' }: { query: string; maxResults?: number; fileType?: string }) => {
                const drive = await getDriveClient();
                if (!drive) {
                    return 'Google Drive is not connected. Please connect Google Drive from the Apps page first.';
                }

                try {
                    let searchQuery = `name contains '${query}' and trashed = false`;

                    // Add file type filters
                    if (fileType === 'folder') {
                        searchQuery += " and mimeType = 'application/vnd.google-apps.folder'";
                    } else if (fileType === 'document') {
                        searchQuery += " and mimeType = 'application/vnd.google-apps.document'";
                    } else if (fileType === 'spreadsheet') {
                        searchQuery += " and mimeType = 'application/vnd.google-apps.spreadsheet'";
                    } else if (fileType === 'presentation') {
                        searchQuery += " and mimeType = 'application/vnd.google-apps.presentation'";
                    } else if (fileType === 'image') {
                        searchQuery += " and mimeType contains 'image/'";
                    } else if (fileType === 'pdf') {
                        searchQuery += " and mimeType = 'application/pdf'";
                    }

                    const response = await drive.files.list({
                        q: searchQuery,
                        pageSize: maxResults,
                        fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink)',
                        orderBy: 'modifiedTime desc',
                    });

                    const files = response.data.files || [];

                    if (files.length === 0) {
                        return `No files found matching "${query}".`;
                    }

                    const fileList = files.map((file, i) => {
                        const type = file.mimeType?.includes('folder') ? '📁' : '📄';
                        return `${i + 1}. ${type} ${file.name}\n   ID: ${file.id}\n   Link: ${file.webViewLink}`;
                    }).join('\n\n');

                    return `Found ${files.length} file(s) matching "${query}":\n\n${fileList}`;
                } catch (error: any) {
                    throw new Error(`Failed to search files: ${error.message}`);
                }
            },
        }),

        createDriveFolder: tool({
            description: 'Create a new folder in Google Drive to organize files. Returns the folder ID.',
            inputSchema: z.object({
                name: z.string().describe('Folder name'),
                parentFolderId: z.string().optional().describe('Parent folder ID (default: root folder)'),
            }),
            execute: async ({ name, parentFolderId }: { name: string; parentFolderId?: string }) => {
                const drive = await getDriveClient();
                if (!drive) {
                    return 'Google Drive is not connected. Please connect Google Drive from the Apps page first.';
                }

                try {
                    const fileMetadata: any = {
                        name,
                        mimeType: 'application/vnd.google-apps.folder',
                    };

                    if (parentFolderId) {
                        fileMetadata.parents = [parentFolderId];
                    }

                    const response = await drive.files.create({
                        requestBody: fileMetadata,
                        fields: 'id, name, webViewLink',
                    });

                    return `✅ Folder "${name}" created successfully!\nFolder ID: ${response.data.id}\nLink: ${response.data.webViewLink}`;
                } catch (error: any) {
                    throw new Error(`Failed to create folder: ${error.message}`);
                }
            },
        }),

        uploadToDrive: tool({
            description: 'Create/upload a text document to Google Drive. Use when user wants to save notes, reports, or any text content to Drive.',
            inputSchema: z.object({
                name: z.string().describe('File name (include extension like .txt)'),
                content: z.string().describe('File content (text)'),
                folderId: z.string().optional().describe('Destination folder ID (default: root folder)'),
                mimeType: z.enum(['text/plain', 'application/vnd.google-apps.document']).default('text/plain').describe('File type'),
            }),
            execute: async ({ name, content, folderId, mimeType = 'text/plain' }: { name: string; content: string; folderId?: string; mimeType?: string }) => {
                const drive = await getDriveClient();
                if (!drive) {
                    return 'Google Drive is not connected. Please connect Google Drive from the Apps page first.';
                }

                try {
                    const fileMetadata: any = { name };
                    if (folderId) {
                        fileMetadata.parents = [folderId];
                    }

                    const media = {
                        mimeType,
                        body: content,
                    };

                    const response = await drive.files.create({
                        requestBody: fileMetadata,
                        media: media,
                        fields: 'id, name, webViewLink',
                    });

                    return `✅ File "${name}" uploaded successfully to Google Drive!\nFile ID: ${response.data.id}\nLink: ${response.data.webViewLink}`;
                } catch (error: any) {
                    throw new Error(`Failed to upload file: ${error.message}`);
                }
            },
        }),

        downloadFromDrive: tool({
            description: 'Read/download content from a Google Drive file. Works with text files and Google Docs.',
            inputSchema: z.object({
                fileId: z.string().describe('File ID to download'),
            }),
            execute: async ({ fileId }: { fileId: string }) => {
                const drive = await getDriveClient();
                if (!drive) {
                    return 'Google Drive is not connected. Please connect Google Drive from the Apps page first.';
                }

                try {
                    // Get file metadata first to check type
                    const metadata = await drive.files.get({
                        fileId,
                        fields: 'name, mimeType',
                    });

                    const fileName = metadata.data.name;
                    const mimeType = metadata.data.mimeType;

                    let content = '';

                    // Handle Google Docs
                    if (mimeType === 'application/vnd.google-apps.document') {
                        const response = await drive.files.export({
                            fileId,
                            mimeType: 'text/plain',
                        });
                        content = response.data as string;
                    } else {
                        // Handle regular files
                        const response = await drive.files.get({
                            fileId,
                            alt: 'media',
                        });
                        content = response.data as string;
                    }

                    return `**${fileName}**\n\n${content}`;
                } catch (error: any) {
                    throw new Error(`Failed to download file: ${error.message}`);
                }
            },
        }),

        getDriveFileInfo: tool({
            description: 'Get detailed information about a file in Google Drive (name, type, size, dates, permissions).',
            inputSchema: z.object({
                fileId: z.string().describe('File ID'),
            }),
            execute: async ({ fileId }: { fileId: string }) => {
                const drive = await getDriveClient();
                if (!drive) {
                    return 'Google Drive is not connected. Please connect Google Drive from the Apps page first.';
                }

                try {
                    const response = await drive.files.get({
                        fileId,
                        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, owners, shared',
                    });

                    const file = response.data;
                    const size = file.size ? `${Math.round(parseInt(file.size) / 1024)}KB` : 'N/A';
                    const owner = file.owners?.[0]?.displayName || 'Unknown';

                    return `📄 **${file.name}**\n\n` +
                        `ID: ${file.id}\n` +
                        `Type: ${file.mimeType}\n` +
                        `Size: ${size}\n` +
                        `Owner: ${owner}\n` +
                        `Created: ${file.createdTime}\n` +
                        `Modified: ${file.modifiedTime}\n` +
                        `Shared: ${file.shared ? 'Yes' : 'No'}\n` +
                        `Link: ${file.webViewLink}`;
                } catch (error: any) {
                    throw new Error(`Failed to get file info: ${error.message}`);
                }
            },
        }),

        deleteDriveFile: tool({
            description: 'Delete a file from Google Drive permanently. Use with caution.',
            inputSchema: z.object({
                fileId: z.string().describe('File ID to delete'),
            }),
            execute: async ({ fileId }: { fileId: string }) => {
                const drive = await getDriveClient();
                if (!drive) {
                    return 'Google Drive is not connected. Please connect Google Drive from the Apps page first.';
                }

                try {
                    // Get file name first
                    const metadata = await drive.files.get({
                        fileId,
                        fields: 'name',
                    });

                    await drive.files.delete({ fileId });

                    return `✅ File "${metadata.data.name}" has been deleted from Google Drive.`;
                } catch (error: any) {
                    throw new Error(`Failed to delete file: ${error.message}`);
                }
            },
        }),

        moveDriveFile: tool({
            description: 'Move a file to a different folder in Google Drive for better organization.',
            inputSchema: z.object({
                fileId: z.string().describe('File ID to move'),
                newFolderId: z.string().describe('Destination folder ID'),
            }),
            execute: async ({ fileId, newFolderId }: { fileId: string; newFolderId: string }) => {
                const drive = await getDriveClient();
                if (!drive) {
                    return 'Google Drive is not connected. Please connect Google Drive from the Apps page first.';
                }

                try {
                    // Get current parents
                    const file = await drive.files.get({
                        fileId,
                        fields: 'name, parents',
                    });

                    const previousParents = file.data.parents?.join(',') || '';

                    // Move file
                    await drive.files.update({
                        fileId,
                        addParents: newFolderId,
                        removeParents: previousParents,
                        fields: 'id, name, parents',
                    });

                    return `✅ File "${file.data.name}" has been moved to the new folder.`;
                } catch (error: any) {
                    throw new Error(`Failed to move file: ${error.message}`);
                }
            },
        }),

        shareDriveFile: tool({
            description: 'Share a Google Drive file with another person via email. They will receive access and a notification.',
            inputSchema: z.object({
                fileId: z.string().describe('File ID to share'),
                email: z.string().describe('Email address to share with'),
                role: z.enum(['reader', 'writer', 'commenter']).default('reader').describe('Permission level'),
            }),
            execute: async ({ fileId, email, role = 'reader' }: { fileId: string; email: string; role?: string }) => {
                const drive = await getDriveClient();
                if (!drive) {
                    return 'Google Drive is not connected. Please connect Google Drive from the Apps page first.';
                }

                try {
                    // Get file name
                    const file = await drive.files.get({
                        fileId,
                        fields: 'name, webViewLink',
                    });

                    // Create permission
                    await drive.permissions.create({
                        fileId,
                        requestBody: {
                            type: 'user',
                            role,
                            emailAddress: email,
                        },
                        sendNotificationEmail: true,
                    });

                    return `✅ File "${file.data.name}" has been shared with ${email} as ${role}.\nLink: ${file.data.webViewLink}`;
                } catch (error: any) {
                    throw new Error(`Failed to share file: ${error.message}`);
                }
            },
        }),
    };
}

/**
 * Create Google Sheets tools for a specific user
 */
export function createSheetsTools(userId: string) {
    const getSheetsClient = async () => {
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId,
                app: { name: 'sheets' },
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
            sheets: google.sheets({ version: 'v4', auth: oauth2Client }),
            drive: google.drive({ version: 'v3', auth: oauth2Client }),
        };
    };

    return {
        createSpreadsheet: tool({
            description: 'Create a new Google Sheets spreadsheet. Use this when user wants to create a spreadsheet, track data, or organize information in a table format.',
            inputSchema: z.object({
                title: z.string().describe('Spreadsheet title'),
                sheetNames: z.array(z.string()).optional().describe('Names of sheets (tabs) to create (default: ["Sheet1"])'),
            }),
            execute: async ({ title, sheetNames }: { title: string; sheetNames?: string[] }) => {
                const client = await getSheetsClient();
                if (!client) {
                    return 'Google Sheets is not connected. Please connect Google Sheets from the Apps page first.';
                }

                try {
                    const sheets = sheetNames || ['Sheet1'];
                    const response = await client.sheets.spreadsheets.create({
                        requestBody: {
                            properties: { title },
                            sheets: sheets.map(name => ({
                                properties: { title: name },
                            })),
                        },
                    });

                    return `✅ Spreadsheet "${title}" created successfully!\nSpreadsheet ID: ${response.data.spreadsheetId}\nURL: ${response.data.spreadsheetUrl}`;
                } catch (error: any) {
                    throw new Error(`Failed to create spreadsheet: ${error.message}`);
                }
            },
        }),

        readSpreadsheet: tool({
            description: 'Read data from a Google Sheets spreadsheet. Use to retrieve data, check values, or analyze spreadsheet content.',
            inputSchema: z.object({
                spreadsheetId: z.string().describe('Spreadsheet ID (from URL: docs.google.com/spreadsheets/d/{spreadsheetId})'),
                range: z.string().describe('Range to read in A1 notation (e.g., "Sheet1!A1:D10", "Data!A:C")'),
            }),
            execute: async ({ spreadsheetId, range }: { spreadsheetId: string; range: string }) => {
                const client = await getSheetsClient();
                if (!client) {
                    return 'Google Sheets is not connected. Please connect Google Sheets from the Apps page first.';
                }

                try {
                    const response = await client.sheets.spreadsheets.values.get({
                        spreadsheetId,
                        range,
                    });

                    const values = response.data.values || [];
                    if (values.length === 0) {
                        return `No data found in range ${range}.`;
                    }

                    // Format as table
                    const table = values.map(row => row.join(' | ')).join('\n');
                    return `Data from ${range}:\n\n${table}\n\n(${values.length} rows)`;
                } catch (error: any) {
                    throw new Error(`Failed to read spreadsheet: ${error.message}`);
                }
            },
        }),

        updateSpreadsheet: tool({
            description: 'Update cells in a Google Sheets spreadsheet. Use to modify data, enter values, or update existing information.',
            inputSchema: z.object({
                spreadsheetId: z.string().describe('Spreadsheet ID'),
                range: z.string().describe('Range to update in A1 notation (e.g., "Sheet1!A1:B2")'),
                values: z.array(z.array(z.string())).describe('2D array of values to write [[row1col1, row1col2], [row2col1, row2col2]]'),
            }),
            execute: async ({ spreadsheetId, range, values }: { spreadsheetId: string; range: string; values: string[][] }) => {
                const client = await getSheetsClient();
                if (!client) {
                    return 'Google Sheets is not connected. Please connect Google Sheets from the Apps page first.';
                }

                try {
                    await client.sheets.spreadsheets.values.update({
                        spreadsheetId,
                        range,
                        valueInputOption: 'USER_ENTERED',
                        requestBody: { values },
                    });

                    return `✅ Updated ${values.length} row(s) in range ${range}.`;
                } catch (error: any) {
                    throw new Error(`Failed to update spreadsheet: ${error.message}`);
                }
            },
        }),

        appendToSpreadsheet: tool({
            description: 'Append rows to the end of a Google Sheets spreadsheet. Use to add new data, log entries, or extend existing data.',
            inputSchema: z.object({
                spreadsheetId: z.string().describe('Spreadsheet ID'),
                range: z.string().describe('Range to append to (e.g., "Sheet1!A:C")'),
                values: z.array(z.array(z.string())).describe('2D array of values to append'),
            }),
            execute: async ({ spreadsheetId, range, values }: { spreadsheetId: string; range: string; values: string[][] }) => {
                const client = await getSheetsClient();
                if (!client) {
                    return 'Google Sheets is not connected. Please connect Google Sheets from the Apps page first.';
                }

                try {
                    await client.sheets.spreadsheets.values.append({
                        spreadsheetId,
                        range,
                        valueInputOption: 'USER_ENTERED',
                        requestBody: { values },
                    });

                    return `✅ Appended ${values.length} row(s) to ${range}.`;
                } catch (error: any) {
                    throw new Error(`Failed to append to spreadsheet: ${error.message}`);
                }
            },
        }),

        createSheet: tool({
            description: 'Create a new sheet (tab) in an existing spreadsheet. Use to organize data in separate sheets.',
            inputSchema: z.object({
                spreadsheetId: z.string().describe('Spreadsheet ID'),
                sheetName: z.string().describe('Name for the new sheet'),
            }),
            execute: async ({ spreadsheetId, sheetName }: { spreadsheetId: string; sheetName: string }) => {
                const client = await getSheetsClient();
                if (!client) {
                    return 'Google Sheets is not connected. Please connect Google Sheets from the Apps page first.';
                }

                try {
                    await client.sheets.spreadsheets.batchUpdate({
                        spreadsheetId,
                        requestBody: {
                            requests: [{
                                addSheet: {
                                    properties: { title: sheetName },
                                },
                            }],
                        },
                    });

                    return `✅ Sheet "${sheetName}" created successfully.`;
                } catch (error: any) {
                    throw new Error(`Failed to create sheet: ${error.message}`);
                }
            },
        }),

        listSpreadsheets: tool({
            description: 'List Google Sheets spreadsheets from Drive. Use to find spreadsheets, check available sheets, or browse data files.',
            inputSchema: z.object({
                maxResults: z.number().default(20).describe('Maximum number of spreadsheets to return'),
            }),
            execute: async ({ maxResults = 20 }: { maxResults?: number }) => {
                const client = await getSheetsClient();
                if (!client) {
                    return 'Google Sheets is not connected. Please connect Google Sheets from the Apps page first.';
                }

                try {
                    const response = await client.drive.files.list({
                        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
                        pageSize: maxResults,
                        fields: 'files(id, name, modifiedTime, webViewLink)',
                        orderBy: 'modifiedTime desc',
                    });

                    const files = response.data.files || [];
                    if (files.length === 0) {
                        return 'No spreadsheets found.';
                    }

                    const list = files.map((file, i) => 
                        `${i + 1}. ${file.name}\n   ID: ${file.id}\n   Modified: ${file.modifiedTime}\n   URL: ${file.webViewLink}`
                    ).join('\n\n');

                    return `Found ${files.length} spreadsheet(s):\n\n${list}`;
                } catch (error: any) {
                    throw new Error(`Failed to list spreadsheets: ${error.message}`);
                }
            },
        }),
    };
}

/**
 * Create Google Slides tools for a specific user
 */
export function createSlidesTools(userId: string) {
    const getSlidesClient = async () => {
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId,
                app: { name: 'slides' },
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
            slides: google.slides({ version: 'v1', auth: oauth2Client }),
            drive: google.drive({ version: 'v3', auth: oauth2Client }),
        };
    };

    return {
        createPresentation: tool({
            description: 'Create a new Google Slides presentation. Use when user wants to create a presentation, slideshow, or visual content.',
            inputSchema: z.object({
                title: z.string().describe('Presentation title'),
            }),
            execute: async ({ title }: { title: string }) => {
                const client = await getSlidesClient();
                if (!client) {
                    return 'Google Slides is not connected. Please connect Google Slides from the Apps page first.';
                }

                try {
                    const response = await client.slides.presentations.create({
                        requestBody: { title },
                    });

                    return `✅ Presentation "${title}" created successfully!\nPresentation ID: ${response.data.presentationId}\nURL: https://docs.google.com/presentation/d/${response.data.presentationId}`;
                } catch (error: any) {
                    throw new Error(`Failed to create presentation: ${error.message}`);
                }
            },
        }),

        readPresentation: tool({
            description: 'Read content from a Google Slides presentation. Use to retrieve slide text and structure.',
            inputSchema: z.object({
                presentationId: z.string().describe('Presentation ID (from URL: docs.google.com/presentation/d/{presentationId})'),
            }),
            execute: async ({ presentationId }: { presentationId: string }) => {
                const client = await getSlidesClient();
                if (!client) {
                    return 'Google Slides is not connected. Please connect Google Slides from the Apps page first.';
                }

                try {
                    const response = await client.slides.presentations.get({ presentationId });
                    const presentation = response.data;
                    const title = presentation.title || 'Untitled';
                    const slides = presentation.slides || [];

                    let content = `**${title}**\n\nSlides: ${slides.length}\n\n`;

                    slides.forEach((slide, i) => {
                        content += `--- Slide ${i + 1} ---\n`;
                        slide.pageElements?.forEach(element => {
                            if (element.shape?.text?.textElements) {
                                element.shape.text.textElements.forEach(textElement => {
                                    if (textElement.textRun?.content) {
                                        content += textElement.textRun.content;
                                    }
                                });
                            }
                        });
                        content += '\n\n';
                    });

                    return content;
                } catch (error: any) {
                    throw new Error(`Failed to read presentation: ${error.message}`);
                }
            },
        }),

        addSlide: tool({
            description: 'Add a new slide with text to a Google Slides presentation. Use to add content to existing presentations.',
            inputSchema: z.object({
                presentationId: z.string().describe('Presentation ID'),
                title: z.string().describe('Slide title'),
                body: z.string().describe('Slide body text'),
            }),
            execute: async ({ presentationId, title, body }: { presentationId: string; title: string; body: string }) => {
                const client = await getSlidesClient();
                if (!client) {
                    return 'Google Slides is not connected. Please connect Google Slides from the Apps page first.';
                }

                try {
                    // Create slide
                    const slideResponse = await client.slides.presentations.batchUpdate({
                        presentationId,
                        requestBody: {
                            requests: [
                                {
                                    createSlide: {
                                        slideLayoutReference: {
                                            predefinedLayout: 'TITLE_AND_BODY',
                                        },
                                    },
                                },
                            ],
                        },
                    });

                    const slideId = slideResponse.data.replies?.[0]?.createSlide?.objectId;

                    // Add title and body text
                    if (slideId) {
                        const presentation = await client.slides.presentations.get({ presentationId });
                        const slide = presentation.data.slides?.find(s => s.objectId === slideId);

                        if (slide) {
                            const titleElement = slide.pageElements?.find(el => 
                                el.shape?.placeholder?.type === 'CENTERED_TITLE' || 
                                el.shape?.placeholder?.type === 'TITLE'
                            );
                            const bodyElement = slide.pageElements?.find(el => 
                                el.shape?.placeholder?.type === 'BODY'
                            );

                            const requests = [];
                            if (titleElement?.objectId) {
                                requests.push({
                                    insertText: {
                                        objectId: titleElement.objectId,
                                        text: title,
                                    },
                                });
                            }
                            if (bodyElement?.objectId) {
                                requests.push({
                                    insertText: {
                                        objectId: bodyElement.objectId,
                                        text: body,
                                    },
                                });
                            }

                            if (requests.length > 0) {
                                await client.slides.presentations.batchUpdate({
                                    presentationId,
                                    requestBody: { requests },
                                });
                            }
                        }
                    }

                    return `✅ Slide added successfully with title "${title}".`;
                } catch (error: any) {
                    throw new Error(`Failed to add slide: ${error.message}`);
                }
            },
        }),

        listPresentations: tool({
            description: 'List Google Slides presentations from Drive. Use to find presentations or browse available slides.',
            inputSchema: z.object({
                maxResults: z.number().default(20).describe('Maximum number of presentations to return'),
            }),
            execute: async ({ maxResults = 20 }: { maxResults?: number }) => {
                const client = await getSlidesClient();
                if (!client) {
                    return 'Google Slides is not connected. Please connect Google Slides from the Apps page first.';
                }

                try {
                    const response = await client.drive.files.list({
                        q: "mimeType='application/vnd.google-apps.presentation' and trashed=false",
                        pageSize: maxResults,
                        fields: 'files(id, name, modifiedTime, webViewLink)',
                        orderBy: 'modifiedTime desc',
                    });

                    const files = response.data.files || [];
                    if (files.length === 0) {
                        return 'No presentations found.';
                    }

                    const list = files.map((file, i) => 
                        `${i + 1}. ${file.name}\n   ID: ${file.id}\n   Modified: ${file.modifiedTime}\n   URL: ${file.webViewLink}`
                    ).join('\n\n');

                    return `Found ${files.length} presentation(s):\n\n${list}`;
                } catch (error: any) {
                    throw new Error(`Failed to list presentations: ${error.message}`);
                }
            },
        }),
    };
}

/**
 * Create GitHub tools for a specific user
 */
export function createGitHubTools(userId: string) {
    const getGitHubClient = async () => {
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId,
                app: { name: 'github' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return null;
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        return {
            token: credentials.access_token,
            headers: {
                'Authorization': `Bearer ${credentials.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Kuma-AI-Assistant',
            },
        };
    };

    return {
        listRepositories: tool({
            description: 'List GitHub repositories for the authenticated user. Use to browse repos, find projects, or see what repositories exist.',
            inputSchema: z.object({
                type: z.enum(['all', 'owner', 'member']).default('owner').describe('Filter by repository type'),
                sort: z.enum(['created', 'updated', 'pushed', 'full_name']).default('updated').describe('Sort order'),
                maxResults: z.number().default(20).describe('Maximum repositories to return'),
            }),
            execute: async ({ type = 'owner', sort = 'updated', maxResults = 20 }: { type?: string; sort?: string; maxResults?: number }) => {
                const client = await getGitHubClient();
                if (!client) {
                    return 'GitHub is not connected. Please connect GitHub from the Apps page first.';
                }

                try {
                    const response = await fetch(
                        `https://api.github.com/user/repos?type=${type}&sort=${sort}&per_page=${maxResults}`,
                        { headers: client.headers }
                    );

                    if (!response.ok) {
                        throw new Error(`GitHub API error: ${response.statusText}`);
                    }

                    const repos = await response.json() as any[];

                    if (repos.length === 0) {
                        return 'No repositories found.';
                    }

                    const repoList = repos.map((repo, i) => 
                        `${i + 1}. **${repo.full_name}**\n` +
                        `   ${repo.description || 'No description'}\n` +
                        `   ⭐ ${repo.stargazers_count} stars | 🍴 ${repo.forks_count} forks\n` +
                        `   Language: ${repo.language || 'N/A'}\n` +
                        `   URL: ${repo.html_url}`
                    ).join('\n\n');

                    return `Found ${repos.length} repositor${repos.length === 1 ? 'y' : 'ies'}:\n\n${repoList}`;
                } catch (error: any) {
                    throw new Error(`Failed to list repositories: ${error.message}`);
                }
            },
        }),

        getRepository: tool({
            description: 'Get detailed information about a specific GitHub repository.',
            inputSchema: z.object({
                owner: z.string().describe('Repository owner (username or organization)'),
                repo: z.string().describe('Repository name'),
            }),
            execute: async ({ owner, repo }: { owner: string; repo: string }) => {
                const client = await getGitHubClient();
                if (!client) {
                    return 'GitHub is not connected. Please connect GitHub from the Apps page first.';
                }

                try {
                    const response = await fetch(
                        `https://api.github.com/repos/${owner}/${repo}`,
                        { headers: client.headers }
                    );

                    if (!response.ok) {
                        if (response.status === 404) {
                            return `Repository ${owner}/${repo} not found.`;
                        }
                        throw new Error(`GitHub API error: ${response.statusText}`);
                    }

                    const repository = await response.json() as any;

                    return `**${repository.full_name}**\n\n` +
                        `${repository.description || 'No description'}\n\n` +
                        `⭐ Stars: ${repository.stargazers_count}\n` +
                        `🍴 Forks: ${repository.forks_count}\n` +
                        `👀 Watchers: ${repository.watchers_count}\n` +
                        `📝 Open Issues: ${repository.open_issues_count}\n` +
                        `🔤 Language: ${repository.language || 'N/A'}\n` +
                        `📅 Created: ${new Date(repository.created_at).toLocaleDateString()}\n` +
                        `📅 Updated: ${new Date(repository.updated_at).toLocaleDateString()}\n` +
                        `🌐 URL: ${repository.html_url}\n` +
                        `${repository.homepage ? `🏠 Homepage: ${repository.homepage}\n` : ''}` +
                        `License: ${repository.license?.name || 'None'}`;
                } catch (error: any) {
                    throw new Error(`Failed to get repository: ${error.message}`);
                }
            },
        }),

        listIssues: tool({
            description: 'List issues in a GitHub repository. Use to see open issues, bugs, or feature requests.',
            inputSchema: z.object({
                owner: z.string().describe('Repository owner'),
                repo: z.string().describe('Repository name'),
                state: z.enum(['open', 'closed', 'all']).default('open').describe('Issue state'),
                maxResults: z.number().default(10).describe('Maximum issues to return'),
            }),
            execute: async ({ owner, repo, state = 'open', maxResults = 10 }: { owner: string; repo: string; state?: string; maxResults?: number }) => {
                const client = await getGitHubClient();
                if (!client) {
                    return 'GitHub is not connected. Please connect GitHub from the Apps page first.';
                }

                try {
                    const response = await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=${maxResults}`,
                        { headers: client.headers }
                    );

                    if (!response.ok) {
                        throw new Error(`GitHub API error: ${response.statusText}`);
                    }

                    const issues = await response.json() as any[];

                    // Filter out pull requests (they appear in issues endpoint)
                    const actualIssues = issues.filter(issue => !issue.pull_request);

                    if (actualIssues.length === 0) {
                        return `No ${state} issues found in ${owner}/${repo}.`;
                    }

                    const issueList = actualIssues.map((issue, i) => 
                        `${i + 1}. #${issue.number}: ${issue.title}\n` +
                        `   State: ${issue.state} | Comments: ${issue.comments}\n` +
                        `   Created: ${new Date(issue.created_at).toLocaleDateString()}\n` +
                        `   URL: ${issue.html_url}`
                    ).join('\n\n');

                    return `Found ${actualIssues.length} ${state} issue(s) in ${owner}/${repo}:\n\n${issueList}`;
                } catch (error: any) {
                    throw new Error(`Failed to list issues: ${error.message}`);
                }
            },
        }),

        createIssue: tool({
            description: 'Create a new issue in a GitHub repository. Use when user wants to report a bug, request a feature, or create a task.',
            inputSchema: z.object({
                owner: z.string().describe('Repository owner'),
                repo: z.string().describe('Repository name'),
                title: z.string().describe('Issue title'),
                body: z.string().describe('Issue description/body'),
                labels: z.array(z.string()).optional().describe('Labels to add (e.g., ["bug", "enhancement"])'),
            }),
            execute: async ({ owner, repo, title, body, labels }: { owner: string; repo: string; title: string; body: string; labels?: string[] }) => {
                const client = await getGitHubClient();
                if (!client) {
                    return 'GitHub is not connected. Please connect GitHub from the Apps page first.';
                }

                try {
                    const response = await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/issues`,
                        {
                            method: 'POST',
                            headers: {
                                ...client.headers,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ title, body, labels }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`GitHub API error: ${response.statusText}`);
                    }

                    const issue = await response.json() as any;

                    return `✅ Issue created successfully!\n\n` +
                        `#${issue.number}: ${issue.title}\n` +
                        `URL: ${issue.html_url}`;
                } catch (error: any) {
                    throw new Error(`Failed to create issue: ${error.message}`);
                }
            },
        }),

        getIssue: tool({
            description: 'Get detailed information about a specific GitHub issue.',
            inputSchema: z.object({
                owner: z.string().describe('Repository owner'),
                repo: z.string().describe('Repository name'),
                issueNumber: z.number().describe('Issue number'),
            }),
            execute: async ({ owner, repo, issueNumber }: { owner: string; repo: string; issueNumber: number }) => {
                const client = await getGitHubClient();
                if (!client) {
                    return 'GitHub is not connected. Please connect GitHub from the Apps page first.';
                }

                try {
                    const response = await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
                        { headers: client.headers }
                    );

                    if (!response.ok) {
                        if (response.status === 404) {
                            return `Issue #${issueNumber} not found in ${owner}/${repo}.`;
                        }
                        throw new Error(`GitHub API error: ${response.statusText}`);
                    }

                    const issue = await response.json() as any;

                    return `**#${issue.number}: ${issue.title}**\n\n` +
                        `State: ${issue.state}\n` +
                        `Created by: ${issue.user.login}\n` +
                        `Created: ${new Date(issue.created_at).toLocaleDateString()}\n` +
                        `Comments: ${issue.comments}\n` +
                        `${issue.labels.length > 0 ? `Labels: ${issue.labels.map((l: any) => l.name).join(', ')}\n` : ''}` +
                        `\n**Description:**\n${issue.body || 'No description'}\n\n` +
                        `URL: ${issue.html_url}`;
                } catch (error: any) {
                    throw new Error(`Failed to get issue: ${error.message}`);
                }
            },
        }),

        listPullRequests: tool({
            description: 'List pull requests in a GitHub repository.',
            inputSchema: z.object({
                owner: z.string().describe('Repository owner'),
                repo: z.string().describe('Repository name'),
                state: z.enum(['open', 'closed', 'all']).default('open').describe('PR state'),
                maxResults: z.number().default(10).describe('Maximum PRs to return'),
            }),
            execute: async ({ owner, repo, state = 'open', maxResults = 10 }: { owner: string; repo: string; state?: string; maxResults?: number }) => {
                const client = await getGitHubClient();
                if (!client) {
                    return 'GitHub is not connected. Please connect GitHub from the Apps page first.';
                }

                try {
                    const response = await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=${maxResults}`,
                        { headers: client.headers }
                    );

                    if (!response.ok) {
                        throw new Error(`GitHub API error: ${response.statusText}`);
                    }

                    const prs = await response.json() as any[];

                    if (prs.length === 0) {
                        return `No ${state} pull requests found in ${owner}/${repo}.`;
                    }

                    const prList = prs.map((pr, i) => 
                        `${i + 1}. #${pr.number}: ${pr.title}\n` +
                        `   By: ${pr.user.login} | State: ${pr.state}\n` +
                        `   Created: ${new Date(pr.created_at).toLocaleDateString()}\n` +
                        `   URL: ${pr.html_url}`
                    ).join('\n\n');

                    return `Found ${prs.length} ${state} pull request(s) in ${owner}/${repo}:\n\n${prList}`;
                } catch (error: any) {
                    throw new Error(`Failed to list pull requests: ${error.message}`);
                }
            },
        }),

        searchCode: tool({
            description: 'Search for code across GitHub repositories. Use to find code examples, implementations, or specific patterns.',
            inputSchema: z.object({
                query: z.string().describe('Search query (e.g., "language:python flask", "repo:owner/repo function")'),
                maxResults: z.number().default(5).describe('Maximum results to return'),
            }),
            execute: async ({ query, maxResults = 5 }: { query: string; maxResults?: number }) => {
                const client = await getGitHubClient();
                if (!client) {
                    return 'GitHub is not connected. Please connect GitHub from the Apps page first.';
                }

                try {
                    const encodedQuery = encodeURIComponent(query);
                    const response = await fetch(
                        `https://api.github.com/search/code?q=${encodedQuery}&per_page=${maxResults}`,
                        { headers: client.headers }
                    );

                    if (!response.ok) {
                        throw new Error(`GitHub API error: ${response.statusText}`);
                    }

                    const result = await response.json() as any;
                    const items = result.items || [];

                    if (items.length === 0) {
                        return `No code found matching "${query}".`;
                    }

                    const codeList = items.map((item: any, i: number) => 
                        `${i + 1}. **${item.name}** in ${item.repository.full_name}\n` +
                        `   Path: ${item.path}\n` +
                        `   URL: ${item.html_url}`
                    ).join('\n\n');

                    return `Found ${result.total_count} result(s) for "${query}" (showing ${items.length}):\n\n${codeList}`;
                } catch (error: any) {
                    throw new Error(`Failed to search code: ${error.message}`);
                }
            },
        }),

        getFileContent: tool({
            description: 'Get the content of a file from a GitHub repository.',
            inputSchema: z.object({
                owner: z.string().describe('Repository owner'),
                repo: z.string().describe('Repository name'),
                path: z.string().describe('File path in the repository'),
                ref: z.string().optional().describe('Branch, tag, or commit SHA (default: default branch)'),
            }),
            execute: async ({ owner, repo, path, ref }: { owner: string; repo: string; path: string; ref?: string }) => {
                const client = await getGitHubClient();
                if (!client) {
                    return 'GitHub is not connected. Please connect GitHub from the Apps page first.';
                }

                try {
                    const url = ref 
                        ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
                        : `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

                    const response = await fetch(url, { headers: client.headers });

                    if (!response.ok) {
                        if (response.status === 404) {
                            return `File ${path} not found in ${owner}/${repo}.`;
                        }
                        throw new Error(`GitHub API error: ${response.statusText}`);
                    }

                    const file = await response.json() as any;

                    if (file.type !== 'file') {
                        return `${path} is not a file.`;
                    }

                    // Decode base64 content
                    const content = Buffer.from(file.content, 'base64').toString('utf-8');

                    return `**${file.name}** (${owner}/${repo})\n` +
                        `Size: ${file.size} bytes\n` +
                        `URL: ${file.html_url}\n\n` +
                        `\`\`\`\n${content}\n\`\`\``;
                } catch (error: any) {
                    throw new Error(`Failed to get file content: ${error.message}`);
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

    // Add Drive tools if connected
    if (connectedAppNames.includes('drive')) {
        const driveTools = createDriveTools(userId);
        Object.assign(tools, driveTools);
    }

    // Add Sheets tools if connected
    if (connectedAppNames.includes('sheets')) {
        const sheetsTools = createSheetsTools(userId);
        Object.assign(tools, sheetsTools);
    }

    // Add Slides tools if connected
    if (connectedAppNames.includes('slides')) {
        const slidesTools = createSlidesTools(userId);
        Object.assign(tools, slidesTools);
    }

    // Add GitHub tools if connected
    if (connectedAppNames.includes('github')) {
        const githubTools = createGitHubTools(userId);
        Object.assign(tools, githubTools);
    }

    // Add Document tools (always available, no app connection needed)
    const documentTools = createDocumentTools(userId);
    Object.assign(tools, documentTools);

    return tools;
}
