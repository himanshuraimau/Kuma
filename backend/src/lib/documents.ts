import { generateText } from 'ai';
import { openai } from './ai/client';
import { prisma } from '../db/prisma';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';

export interface DocumentUploadResult {
  documentId: string;
  status: 'processing' | 'ready' | 'failed';
  fileSize: number;
  filename: string;
  displayName: string;
  extractedText?: string;
}

export interface DocumentQueryResult {
  answer: string;
  documentName: string;
}

/**
 * Document attachment interface for chat messages
 * Lighter weight than full Document model
 */
export interface DocumentAttachment {
  id: string;
  displayName: string;
  extractedText: string;
  pageCount: number | null;
  fileSize: number;
}

/**
 * Upload a PDF document and extract text using Gemini
 */
export async function uploadDocument(
  userId: string,
  filePath: string,
  originalFilename: string,
  chatId?: string
): Promise<DocumentUploadResult> {
  try {
    // Get file stats
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    // Read PDF file
    const pdfBuffer = await fs.readFile(filePath);
    
    // Extract text from PDF using Gemini
    let extractedText = '';
    let pageCount = 0;
    let status: 'processing' | 'ready' | 'failed' = 'processing';
    
    try {
      // Initialize Gemini client
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Convert PDF to base64
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
      
      // Use Gemini to extract text from PDF
      const contents = [
        { text: 'Extract all text from this PDF document. Return only the extracted text content, nothing else. Preserve the structure and formatting where possible.' },
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64
          }
        }
      ];
      
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents
      });
      
      extractedText = response.text || '';
      
      // Estimate page count (Gemini doesn't provide this directly)
      // Rough estimate: ~500 words per page
      const wordCount = extractedText.split(/\s+/).length;
      pageCount = Math.ceil(wordCount / 500);
      
      status = 'ready';
      
      console.log(`✅ Extracted ${wordCount} words from PDF (estimated ${pageCount} pages)`);
    } catch (error) {
      console.error('Failed to extract PDF text with Gemini:', error);
      status = 'failed';
    }

    // Create display name (remove .pdf extension)
    const displayName = originalFilename.replace(/\.pdf$/i, '');

    // Save to database with extracted text
    const document = await prisma.documents.create({
      data: {
        userId,
        chatId: chatId || null,
        filename: originalFilename,
        displayName,
        mimeType: 'application/pdf',
        fileSize,
        geminiFileUri: '', // Keep for backward compatibility but not used
        geminiFileName: '', // Keep for backward compatibility but not used
        extractedText,
        pageCount,
        status,
        // Documents don't expire since we're storing text locally
        expiresAt: null,
      },
    });

    return {
      documentId: document.id,
      status,
      fileSize,
      filename: originalFilename,
      displayName,
      extractedText: status === 'ready' ? extractedText : undefined,
    };
  } catch (error: any) {
    throw new Error(`Failed to upload document: ${error.message}`);
  }
}

/**
 * Generate a summary for a document using OpenAI
 */
export async function summarizeDocument(documentId: string): Promise<string> {
  const document = await prisma.documents.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  if (document.status !== 'ready') {
    throw new Error('Document is not ready for processing');
  }

  if (!document.extractedText) {
    throw new Error('Document text not available');
  }

  // Use OpenAI to generate summary
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: `Please provide a comprehensive summary of this document. Include the main topics, key points, and any important conclusions or recommendations.\n\nDocument:\n${document.extractedText}`,
  });

  // Save summary to database
  await prisma.documents.update({
    where: { id: documentId },
    data: { summary: text },
  });

  return text;
}

/**
 * Query a document with a specific question using OpenAI
 */
export async function queryDocument(
  documentId: string,
  question: string
): Promise<DocumentQueryResult> {
  const document = await prisma.documents.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  if (document.status !== 'ready') {
    throw new Error('Document is not ready for processing');
  }

  if (!document.extractedText) {
    throw new Error('Document text not available');
  }

  // Use OpenAI to answer the question
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: `Based on the following document, answer this question: ${question}\n\nDocument:\n${document.extractedText}`,
  });

  return {
    answer: text,
    documentName: document.displayName,
  };
}

/**
 * Compare multiple documents using OpenAI
 */
export async function compareDocuments(
  documentIds: string[],
  comparisonPrompt: string
): Promise<string> {
  if (documentIds.length < 2) {
    throw new Error('At least 2 documents are required for comparison');
  }

  const documents = await prisma.documents.findMany({
    where: {
      id: { in: documentIds },
      status: 'ready',
    },
  });

  if (documents.length < 2) {
    throw new Error('Not enough ready documents found for comparison');
  }

  // Combine all document texts
  const combinedText = documents
    .map((doc, idx) => `Document ${idx + 1} (${doc.displayName}):\n${doc.extractedText}`)
    .join('\n\n---\n\n');

  // Use OpenAI to compare documents
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: `${comparisonPrompt}\n\n${combinedText}`,
  });

  return text;
}

/**
 * Extract text from a document (returns the already extracted text)
 */
export async function extractDocumentText(documentId: string): Promise<string> {
  const document = await prisma.documents.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  if (document.status !== 'ready') {
    throw new Error('Document is not ready for processing');
  }

  if (!document.extractedText) {
    throw new Error('Document text not available');
  }

  return document.extractedText;
}

/**
 * Get document by ID
 */
export async function getDocument(documentId: string, userId: string) {
  return prisma.documents.findFirst({
    where: {
      id: documentId,
      userId,
    },
  });
}

/**
 * List user's documents
 */
export async function listUserDocuments(userId: string, chatId?: string) {
  return prisma.documents.findMany({
    where: {
      userId,
      ...(chatId && { chatId }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string, userId: string): Promise<void> {
  const document = await prisma.documents.findFirst({
    where: {
      id: documentId,
      userId,
    },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  // Delete from database (no need to delete from external API)
  await prisma.documents.delete({
    where: { id: documentId },
  });
}

/**
 * Clean up expired documents (no longer needed since we don't have expiring external files)
 */
export async function cleanupExpiredDocuments(): Promise<number> {
  // With OpenAI, documents don't expire, but we can still clean up old ones if needed
  const expiredDocs = await prisma.documents.findMany({
    where: {
      expiresAt: {
        not: null,
        lt: new Date(),
      },
    },
  });

  if (expiredDocs.length === 0) {
    return 0;
  }

  const result = await prisma.documents.deleteMany({
    where: {
      expiresAt: {
        not: null,
        lt: new Date(),
      },
    },
  });

  return result.count;
}

/**
 * Convert Document to DocumentAttachment for chat messages
 */
export function toDocumentAttachment(document: any): DocumentAttachment {
  return {
    id: document.id,
    displayName: document.displayName,
    extractedText: document.extractedText || '',
    pageCount: document.pageCount,
    fileSize: document.fileSize,
  };
}

/**
 * Get documents by IDs and convert to attachments
 */
export async function getDocumentAttachments(
  documentIds: string[],
  userId: string
): Promise<DocumentAttachment[]> {
  const documents = await prisma.documents.findMany({
    where: {
      id: { in: documentIds },
      userId,
      status: 'ready', // Only ready documents
    },
  });

  return documents.map(toDocumentAttachment);
}

/**
 * Build context for OpenAI with documents
 * Combines text with document contents
 */
export function buildDocumentContext(
  userMessage: string,
  documentAttachments: DocumentAttachment[]
): string {
  if (documentAttachments.length === 0) {
    return userMessage;
  }

  const documentContext = documentAttachments
    .map((doc) => `[Document: ${doc.displayName}]\n${doc.extractedText}`)
    .join('\n\n---\n\n');

  return `${documentContext}\n\n---\n\nUser question: ${userMessage}`;
}
