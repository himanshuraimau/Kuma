import React from 'react';
import type { Document } from '../../api/documents.api';
import DocumentCard from './DocumentCard';
import { FileText } from 'lucide-react';

export default function DocumentList({ documents, onRefresh }: { documents: Document[]; onRefresh?: () => void }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-medium text-zinc-300 mb-2">No documents yet</h3>
        <p className="text-sm text-zinc-500 text-center max-w-md">
          Upload your first PDF document to start chatting with your files using AI
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-zinc-100">
          Your Documents <span className="text-sm text-zinc-500 font-normal">({documents.length})</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  );
}
