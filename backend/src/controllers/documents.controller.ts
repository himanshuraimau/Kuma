import type { Request, Response } from 'express';
import {
  uploadDocument,
  listUserDocuments,
  getDocument,
  deleteDocument,
  queryDocument,
  summarizeDocument,
  compareDocuments,
  extractDocumentText,
} from '../lib/documents';
import { deleteFile } from '../lib/storage';

/**
 * Upload a PDF document
 * POST /api/documents/upload
 */
export async function uploadDocumentController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      await deleteFile(req.file.path);
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }

    // Validate file size (max 50MB as per Gemini limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (req.file.size > maxSize) {
      await deleteFile(req.file.path);
      return res.status(400).json({ error: 'File size must be less than 50MB' });
    }

    const { chatId } = req.body;

    const result = await uploadDocument(
      userId,
      req.file.path,
      req.file.originalname,
      chatId
    );

    // Delete the temporary file
    await deleteFile(req.file.path);

    return res.json({
      success: true,
      document: result,
    });
  } catch (error: any) {
    // Clean up file on error
    if (req.file) {
      await deleteFile(req.file.path);
    }
    console.error('Document upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * List user's documents
 * GET /api/documents
 */
export async function listDocumentsController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { chatId } = req.query;

    const documents = await listUserDocuments(
      userId,
      chatId ? String(chatId) : undefined
    );

    return res.json({
      success: true,
      documents,
    });
  } catch (error: any) {
    console.error('List documents error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get a specific document
 * GET /api/documents/:id
 */
export async function getDocumentController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const document = await getDocument(id, userId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.json({
      success: true,
      document,
    });
  } catch (error: any) {
    console.error('Get document error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a document
 * DELETE /api/documents/:id
 */
export async function deleteDocumentController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    await deleteDocument(id, userId);

    return res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete document error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Query a document
 * POST /api/documents/:id/query
 */
export async function queryDocumentController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Verify document belongs to user
    const document = await getDocument(id, userId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const result = await queryDocument(id, question);

    return res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Query document error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Summarize a document
 * POST /api/documents/:id/summarize
 */
export async function summarizeDocumentController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    // Verify document belongs to user
    const document = await getDocument(id, userId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const summary = await summarizeDocument(id);

    return res.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Summarize document error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Compare documents
 * POST /api/documents/compare
 */
export async function compareDocumentsController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { documentIds, comparisonPrompt } = req.body;

    if (!Array.isArray(documentIds) || documentIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 document IDs are required' });
    }

    if (!comparisonPrompt || typeof comparisonPrompt !== 'string') {
      return res.status(400).json({ error: 'Comparison prompt is required' });
    }

    // Verify all documents belong to user
    for (const docId of documentIds) {
      const document = await getDocument(docId, userId);
      if (!document) {
        return res.status(404).json({ error: `Document ${docId} not found` });
      }
    }

    const result = await compareDocuments(documentIds, comparisonPrompt);

    return res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Compare documents error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Extract text from a document
 * POST /api/documents/:id/extract
 */
export async function extractDocumentTextController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    // Verify document belongs to user
    const document = await getDocument(id, userId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const text = await extractDocumentText(id);

    return res.json({
      success: true,
      text,
    });
  } catch (error: any) {
    console.error('Extract document text error:', error);
    return res.status(500).json({ error: error.message });
  }
}
