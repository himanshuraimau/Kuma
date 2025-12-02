import { z } from 'zod';
import { google } from 'googleapis';
import type { BaseTool } from '../../tools/base.tool';
import { decryptCredentials } from '../../lib/encryption';
import { prisma } from '../../db/prisma';

/**
 * Create a new Google Doc
 */
export const createDocumentTool: BaseTool = {
    name: 'create_google_doc',
    description:
        'Create a new Google Doc with plain text content. Use this when user wants to save information, create notes, or store data in Google Docs. The content will be stored as plain text (not markdown or formatted text).',
    category: 'docs',
    requiresAuth: true,
    schema: z.object({
        title: z.string().describe('Document title'),
        content: z.string().describe('Document content (plain text)'),
    }),

    async execute(input, context) {
        if (!context?.userId) {
            throw new Error('User not authenticated');
        }

        const userApp = await prisma.userApp.findFirst({
            where: {
                userId: context.userId,
                app: { name: 'docs' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return 'Google Docs is not connected. Please connect Google Docs from the Apps page first.';
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        const docs = google.docs({ version: 'v1', auth: oauth2Client });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        try {
            // Create a new document
            const createResponse = await docs.documents.create({
                requestBody: {
                    title: input.title,
                },
            });

            const documentId = createResponse.data.documentId!;

            // Insert content into the document
            await docs.documents.batchUpdate({
                documentId,
                requestBody: {
                    requests: [
                        {
                            insertText: {
                                location: {
                                    index: 1,
                                },
                                text: input.content,
                            },
                        },
                    ],
                },
            });

            // Get the document URL
            const file = await drive.files.get({
                fileId: documentId,
                fields: 'webViewLink',
            });

            return `✅ Document "${input.title}" has been created and saved successfully.`;
        } catch (error: any) {
            throw new Error(`Failed to create document: ${error.message}`);
        }
    },
};

/**
 * Read content from a Google Doc
 */
export const readDocumentTool: BaseTool = {
    name: 'read_google_doc',
    description:
        'Read content from a Google Doc. Use this to retrieve document content, check what\'s written, or get information from a doc.',
    category: 'docs',
    requiresAuth: true,
    schema: z.object({
        documentId: z
            .string()
            .describe('Document ID (from the URL: docs.google.com/document/d/{documentId})'),
    }),

    async execute(input, context) {
        if (!context?.userId) {
            throw new Error('User not authenticated');
        }

        const userApp = await prisma.userApp.findFirst({
            where: {
                userId: context.userId,
                app: { name: 'docs' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return 'Google Docs is not connected. Please connect Google Docs from the Apps page first.';
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        const docs = google.docs({ version: 'v1', auth: oauth2Client });

        try {
            const response = await docs.documents.get({
                documentId: input.documentId,
            });

            const doc = response.data;
            const title = doc.title || 'Untitled';

            // Extract text content
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

            return `Document: "${title}"\n\nContent:\n${content.trim()}`;
        } catch (error: any) {
            throw new Error(`Failed to read document: ${error.message}`);
        }
    },
};

/**
 * Update content in a Google Doc
 */
export const updateDocumentTool: BaseTool = {
    name: 'update_google_doc',
    description:
        'Update or append content to an existing Google Doc. Use this to add information, edit documents, or update notes.',
    category: 'docs',
    requiresAuth: true,
    schema: z.object({
        documentId: z.string().describe('Document ID to update'),
        content: z.string().describe('Content to append to the document'),
        mode: z
            .enum(['append', 'replace'])
            .default('append')
            .describe('Whether to append or replace existing content'),
    }),

    async execute(input, context) {
        if (!context?.userId) {
            throw new Error('User not authenticated');
        }

        const userApp = await prisma.userApp.findFirst({
            where: {
                userId: context.userId,
                app: { name: 'docs' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return 'Google Docs is not connected. Please connect Google Docs from the Apps page first.';
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        const docs = google.docs({ version: 'v1', auth: oauth2Client });

        try {
            const requests: any[] = [];

            if (input.mode === 'replace') {
                // Get document to find end index
                const doc = await docs.documents.get({
                    documentId: input.documentId,
                });

                const endIndex = doc.data.body?.content?.slice(-1)[0]?.endIndex || 1;

                // Delete all content except the first character
                requests.push({
                    deleteContentRange: {
                        range: {
                            startIndex: 1,
                            endIndex: endIndex - 1,
                        },
                    },
                });
            }

            // Insert new content
            requests.push({
                insertText: {
                    location: {
                        index: 1,
                    },
                    text: input.content,
                },
            });

            await docs.documents.batchUpdate({
                documentId: input.documentId,
                requestBody: {
                    requests,
                },
            });

            return `✅ Document updated successfully!`;
        } catch (error: any) {
            throw new Error(`Failed to update document: ${error.message}`);
        }
    },
};

/**
 * List recent Google Docs
 */
export const listDocumentsTool: BaseTool = {
    name: 'list_google_docs',
    description:
        'List recent Google Docs. Use this to find documents, see what docs exist, or search for a specific document.',
    category: 'docs',
    requiresAuth: true,
    schema: z.object({
        maxResults: z.number().default(10).describe('Maximum number of documents to list'),
        query: z
            .string()
            .optional()
            .describe('Search query to filter documents by name'),
    }),

    async execute(input, context) {
        if (!context?.userId) {
            throw new Error('User not authenticated');
        }

        const userApp = await prisma.userApp.findFirst({
            where: {
                userId: context.userId,
                app: { name: 'docs' },
                isConnected: true,
            },
        });

        if (!userApp) {
            return 'Google Docs is not connected. Please connect Google Docs from the Apps page first.';
        }

        const credentials = decryptCredentials(userApp.credentials as string);
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        try {
            let q = "mimeType='application/vnd.google-apps.document'";
            if (input.query) {
                q += ` and name contains '${input.query}'`;
            }

            const response = await drive.files.list({
                q,
                pageSize: input.maxResults,
                fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
                orderBy: 'modifiedTime desc',
            });

            const files = response.data.files || [];

            if (files.length === 0) {
                return 'No documents found.';
            }

            const summary =
                `Found ${files.length} document(s):\n\n` +
                files
                    .map(
                        (file, i) =>
                            `${i + 1}. ${file.name}\n   ID: ${file.id}\n   Link: ${file.webViewLink}\n   Modified: ${file.modifiedTime}`
                    )
                    .join('\n\n');

            return summary;
        } catch (error: any) {
            throw new Error(`Failed to list documents: ${error.message}`);
        }
    },
};
