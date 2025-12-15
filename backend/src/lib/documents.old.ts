import { generateText } from 'ai';
import { openai } from './ai/client';
import { prisma } from '../db/prisma';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

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
 * Upload a PDF document to Gemini File API and save metadata to database
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

    // Upload to Gemini File API using @google/genai
    const uploadResult = await genaiClient.files.upload({
      file: filePath,
      config: {
        mimeType: 'application/pdf',
        displayName: originalFilename,
      },
    });

    // Create display name (remove .pdf extension)
    const displayName = originalFilename.replace(/\.pdf$/i, '');

    // Save to database
    const document = await prisma.documents.create({
      data: {
        userId,
        chatId: chatId || null,
        filename: originalFilename,
        displayName,
        mimeType: 'application/pdf',
        fileSize,
        geminiFileUri: uploadResult.uri!,
        geminiFileName: uploadResult.name!,
        status: 'processing',
        // Gemini files expire after 48 hours
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });

    // Check file status and wait if needed
    let file = await genaiClient.files.get({ name: uploadResult.name! });
    let attempts = 0;
    const maxAttempts = 10;

    while (file.state === 'PROCESSING' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await genaiClient.files.get({ name: uploadResult.name! });
      attempts++;
    }

    // Update document status
    const status = file.state === 'ACTIVE' ? 'ready' : file.state === 'FAILED' ? 'failed' : 'processing';
    await prisma.documents.update({
      where: { id: document.id },
      data: { 
        status,
        pageCount: file.state === 'ACTIVE' ? (file as any).videoMetadata?.videoDuration ? null : null : null,
      },
    });

    return {
      documentId: document.id,
      geminiFileUri: uploadResult.uri!,
      geminiFileName: uploadResult.name!,
      status,
      fileSize,
      filename: originalFilename,
      displayName,
    };
  } catch (error: any) {
    throw new Error(`Failed to upload document: ${error.message}`);
  }
}

/**
 * Generate a summary for a document
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

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: document.mimeType,
        fileUri: document.geminiFileUri,
      },
    },
    {
      text: 'Please provide a comprehensive summary of this document. Include the main topics, key points, and any important conclusions or recommendations.',
    },
  ]);

  const summary = result.response.text();

  // Save summary to database
  await prisma.documents.update({
    where: { id: documentId },
    data: { summary },
  });

  return summary;
}

/**
 * Query a document with a specific question
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

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: document.mimeType,
        fileUri: document.geminiFileUri,
      },
    },
    { text: question },
  ]);

  return {
    answer: result.response.text(),
    documentName: document.displayName,
  };
}

/**
 * Compare multiple documents
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

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const parts = [
    ...documents.map((doc) => ({
      fileData: {
        mimeType: doc.mimeType,
        fileUri: doc.geminiFileUri,
      },
    })),
    { text: comparisonPrompt },
  ];

  const result = await model.generateContent(parts);
  return result.response.text();
}

/**
 * Extract text from a document
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

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: document.mimeType,
        fileUri: document.geminiFileUri,
      },
    },
    {
      text: 'Extract all text from this document. Preserve formatting, structure, and organization as much as possible. Include headings, sections, and any important formatting.',
    },
  ]);

  return result.response.text();
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

  // Delete from Gemini File API
  try {
    await genaiClient.files.delete({ name: document.geminiFileName });
  } catch (error) {
    console.error('Failed to delete file from Gemini:', error);
    // Continue anyway to clean up database
  }

  // Delete from database
  await prisma.documents.delete({
    where: { id: documentId },
  });
}

/**
 * Clean up expired documents
 */
export async function cleanupExpiredDocuments(): Promise<number> {
  const expiredDocs = await prisma.documents.findMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  for (const doc of expiredDocs) {
    try {
      await genaiClient.files.delete({ name: doc.geminiFileName });
    } catch (error) {
      console.error(`Failed to delete expired file ${doc.geminiFileName}:`, error);
    }
  }

  const result = await prisma.documents.deleteMany({
    where: {
      expiresAt: {
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
    geminiFileUri: document.geminiFileUri,
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
 * Build multimodal parts for Gemini API with documents
 * Combines text and document file references
 */
export function buildDocumentParts(
  text: string,
  documentAttachments: DocumentAttachment[]
): any[] {
  const parts: any[] = [];
  
  // Add document parts first (as file URIs)
  for (const doc of documentAttachments) {
    parts.push({
      fileData: {
        mimeType: 'application/pdf',
        fileUri: doc.geminiFileUri,
      },
    });
  }
  
  // Add text part last
  if (text && text.trim()) {
    parts.push({ text: text.trim() });
  }
  
  return parts;
}
