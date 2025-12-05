import { create } from 'zustand';
import type { Document } from '../api/documents.api';
import * as documentsApi from '../api/documents.api';

interface DocumentsState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploadProgress: number;

  // Actions
  fetchDocuments: (chatId?: string) => Promise<void>;
  uploadDocument: (file: File, chatId?: string) => Promise<Document>;
  deleteDocument: (documentId: string) => Promise<void>;
  queryDocument: (documentId: string, question: string) => Promise<documentsApi.DocumentQueryResult>;
  summarizeDocument: (documentId: string) => Promise<string>;
  compareDocuments: (documentIds: string[], comparisonPrompt: string) => Promise<string>;
  extractText: (documentId: string) => Promise<string>;
  clearError: () => void;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  loading: false,
  error: null,
  uploadProgress: 0,

  fetchDocuments: async (chatId?: string) => {
    set({ loading: true, error: null });
    try {
      const documents = await documentsApi.listDocuments(chatId);
      set({ documents, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch documents';
      set({ error: message, loading: false });
    }
  },

  uploadDocument: async (file: File, chatId?: string) => {
    set({ loading: true, error: null, uploadProgress: 0 });
    try {
      const result = await documentsApi.uploadDocument(file, chatId);
      
      // Refresh documents list
      await get().fetchDocuments(chatId);
      
      set({ loading: false, uploadProgress: 100 });
      
      // Find and return the newly uploaded document
      const newDocument = get().documents.find(d => d.id === result.documentId);
      if (!newDocument) {
        throw new Error('Document uploaded but not found in list');
      }
      return newDocument;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload document';
      set({ error: message, loading: false, uploadProgress: 0 });
      throw error;
    }
  },

  deleteDocument: async (documentId: string) => {
    set({ loading: true, error: null });
    try {
      await documentsApi.deleteDocument(documentId);
      
      // Remove from local state
      set(state => ({
        documents: state.documents.filter(d => d.id !== documentId),
        loading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete document';
      set({ error: message, loading: false });
      throw error;
    }
  },

  queryDocument: async (documentId: string, question: string) => {
    set({ loading: true, error: null });
    try {
      const result = await documentsApi.queryDocument(documentId, question);
      set({ loading: false });
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to query document';
      set({ error: message, loading: false });
      throw error;
    }
  },

  summarizeDocument: async (documentId: string) => {
    set({ loading: true, error: null });
    try {
      const summary = await documentsApi.summarizeDocument(documentId);
      
      // Update document in local state
      set(state => ({
        documents: state.documents.map(d =>
          d.id === documentId ? { ...d, summary } : d
        ),
        loading: false,
      }));
      
      return summary;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to summarize document';
      set({ error: message, loading: false });
      throw error;
    }
  },

  compareDocuments: async (documentIds: string[], comparisonPrompt: string) => {
    set({ loading: true, error: null });
    try {
      const result = await documentsApi.compareDocuments(documentIds, comparisonPrompt);
      set({ loading: false });
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to compare documents';
      set({ error: message, loading: false });
      throw error;
    }
  },

  extractText: async (documentId: string) => {
    set({ loading: true, error: null });
    try {
      const text = await documentsApi.extractDocumentText(documentId);
      set({ loading: false });
      return text;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to extract text';
      set({ error: message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
