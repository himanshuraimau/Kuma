import { apiClient } from './client';

export interface Document {
  id: string;
  userId: string;
  chatId: string | null;
  filename: string;
  displayName: string;
  mimeType: string;
  fileSize: number;
  pageCount: number | null;
  geminiFileUri: string;
  geminiFileName: string;
  status: 'processing' | 'ready' | 'failed';
  summary: string | null;
  metadata: any;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadResult {
  documentId: string;
  geminiFileUri: string;
  geminiFileName: string;
  status: 'processing' | 'ready' | 'failed';
  fileSize: number;
  filename: string;
  displayName: string;
}

export interface DocumentQueryResult {
  answer: string;
  documentName: string;
}

/**
 * Upload a PDF document
 */
export async function uploadDocument(file: File, chatId?: string): Promise<DocumentUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (chatId) {
    formData.append('chatId', chatId);
  }

  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.document;
}

/**
 * List user's documents
 */
export async function listDocuments(chatId?: string): Promise<Document[]> {
  const params = chatId ? { chatId } : {};
  const response = await apiClient.get('/documents', { params });
  return response.data.documents;
}

/**
 * Get a specific document
 */
export async function getDocument(documentId: string): Promise<Document> {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response.data.document;
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  await apiClient.delete(`/documents/${documentId}`);
}

/**
 * Query a document
 */
export async function queryDocument(documentId: string, question: string): Promise<DocumentQueryResult> {
  const response = await apiClient.post(`/documents/${documentId}/query`, { question });
  return response.data.result;
}

/**
 * Summarize a document
 */
export async function summarizeDocument(documentId: string): Promise<string> {
  const response = await apiClient.post(`/documents/${documentId}/summarize`);
  return response.data.summary;
}

/**
 * Compare documents
 */
export async function compareDocuments(documentIds: string[], comparisonPrompt: string): Promise<string> {
  const response = await apiClient.post('/documents/compare', {
    documentIds,
    comparisonPrompt,
  });
  return response.data.result;
}

/**
 * Extract text from a document
 */
export async function extractDocumentText(documentId: string): Promise<string> {
  const response = await apiClient.post(`/documents/${documentId}/extract`);
  return response.data.text;
}
