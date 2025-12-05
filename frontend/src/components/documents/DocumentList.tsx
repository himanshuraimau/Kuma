import React from 'react';
import type { Document } from '../../api/documents.api';
import DocumentCard from './DocumentCard';

export default function DocumentList({ documents, onRefresh }: { documents: Document[]; onRefresh?: () => void }) {
  if (!documents || documents.length === 0) {
    return <div>No documents uploaded yet.</div>;
  }

  return (
    <div className="document-list">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
