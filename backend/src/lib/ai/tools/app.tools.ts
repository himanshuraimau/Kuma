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

    return tools;
}
