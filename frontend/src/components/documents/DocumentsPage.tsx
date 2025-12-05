import React, { useEffect, useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import { listDocuments, type Document } from '../../api/documents.api';

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
    <div className="documents-page">
      <h2>Documents (RAG)</h2>
      <p>Upload PDFs and ask questions, summarize, or compare documents using Gemini.</p>
      <DocumentUpload onUploaded={load} />
      {loading ? <p>Loading...</p> : <DocumentList documents={documents} onRefresh={load} />}
    </div>
  );
}
