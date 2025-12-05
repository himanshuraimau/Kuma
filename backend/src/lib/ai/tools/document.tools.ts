import { tool } from 'ai';
import { z } from 'zod';
import {
  queryDocument,
  compareDocuments,
  extractDocumentText,
  summarizeDocument,
  listUserDocuments,
} from '../../documents';

/**
 * Create document tools for a specific user
 */
export function createDocumentTools(userId: string) {
  return {
    queryDocument: tool({
      description: 'Ask a question about a specific document that the user has uploaded. Use this when user wants to know something from a PDF document, search within a document, or get specific information from uploaded files.',
      inputSchema: z.object({
        documentId: z.string().describe('The ID of the document to query'),
        question: z.string().describe('The question to ask about the document'),
      }),
      execute: async ({ documentId, question }: { documentId: string; question: string }) => {
        try {
          const result = await queryDocument(documentId, question);
          return `From "${result.documentName}":\n\n${result.answer}`;
        } catch (error: any) {
          return `Failed to query document: ${error.message}`;
        }
      },
    }),

    listDocuments: tool({
      description: 'List all documents that the user has uploaded. Use this when user asks "what documents do I have", "list my PDFs", or wants to see their uploaded files.',
      inputSchema: z.object({
        chatId: z.string().optional().describe('Optional: filter documents by chat ID'),
      }),
      execute: async ({ chatId }: { chatId?: string }) => {
        try {
          const documents = await listUserDocuments(userId, chatId);
          
          if (documents.length === 0) {
            return 'You have not uploaded any documents yet. You can upload PDF documents to ask questions about them.';
          }

          const docList = documents.map((doc, idx) => {
            const size = (doc.fileSize / 1024).toFixed(2);
            const status = doc.status === 'ready' ? '✓' : doc.status === 'processing' ? '⏳' : '✗';
            return `${idx + 1}. ${status} ${doc.displayName} (${size} KB, ID: ${doc.id})${doc.summary ? `\n   Summary: ${doc.summary.slice(0, 100)}...` : ''}`;
          }).join('\n\n');

          return `Your uploaded documents:\n\n${docList}\n\nYou can ask questions about any document using its ID.`;
        } catch (error: any) {
          return `Failed to list documents: ${error.message}`;
        }
      },
    }),

    summarizeDocument: tool({
      description: 'Get a comprehensive summary of a document. Use this when user asks to summarize a PDF, get the main points, or understand what a document is about.',
      inputSchema: z.object({
        documentId: z.string().describe('The ID of the document to summarize'),
      }),
      execute: async ({ documentId }: { documentId: string }) => {
        try {
          const summary = await summarizeDocument(documentId);
          return `Document Summary:\n\n${summary}`;
        } catch (error: any) {
          return `Failed to summarize document: ${error.message}`;
        }
      },
    }),

    compareDocuments: tool({
      description: 'Compare multiple documents and find similarities or differences. Use this when user wants to compare PDFs, find differences between versions, or analyze multiple documents together.',
      inputSchema: z.object({
        documentIds: z.array(z.string()).min(2).describe('Array of document IDs to compare (at least 2)'),
        comparisonPrompt: z.string().describe('What to compare or look for (e.g., "find key differences", "compare conclusions", "which is more recent")'),
      }),
      execute: async ({ documentIds, comparisonPrompt }: { documentIds: string[]; comparisonPrompt: string }) => {
        try {
          const result = await compareDocuments(documentIds, comparisonPrompt);
          return `Document Comparison:\n\n${result}`;
        } catch (error: any) {
          return `Failed to compare documents: ${error.message}`;
        }
      },
    }),

    extractDocumentText: tool({
      description: 'Extract all text content from a document while preserving formatting. Use this when user wants the full text, needs to copy content, or wants to see the document content as text.',
      inputSchema: z.object({
        documentId: z.string().describe('The ID of the document to extract text from'),
      }),
      execute: async ({ documentId }: { documentId: string }) => {
        try {
          const text = await extractDocumentText(documentId);
          // Limit output to avoid token overflow
          if (text.length > 4000) {
            return `Extracted Text (truncated to 4000 characters):\n\n${text.slice(0, 4000)}\n\n... [Content truncated. Total length: ${text.length} characters]`;
          }
          return `Extracted Text:\n\n${text}`;
        } catch (error: any) {
          return `Failed to extract text: ${error.message}`;
        }
      },
    }),
  };
}
