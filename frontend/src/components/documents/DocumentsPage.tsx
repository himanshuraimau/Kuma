import React, { useEffect, useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import { listDocuments, type Document } from '../../api/documents.api';
import { FileText, Sparkles } from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-100">Documents</h1>
          </div>
          <p className="text-zinc-400 text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Upload PDFs and chat with your documents using AI-powered RAG
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <DocumentUpload onUploaded={load} />
        </div>

        {/* Documents List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <DocumentList documents={documents} onRefresh={load} />
          )}
        </div>
      </div>
    </div>
  );
}
