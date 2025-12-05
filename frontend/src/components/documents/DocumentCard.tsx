import React, { useState } from 'react';
import type { Document } from '../../api/documents.api';
import { summarizeDocument, deleteDocument, queryDocument, extractDocumentText } from '../../api/documents.api';

export default function DocumentCard({ document, onRefresh }: { document: Document; onRefresh?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const handleSummarize = async () => {
    setBusy(true);
    setOutput(null);
    try {
      const summary = await summarizeDocument(document.id);
      setOutput(summary);
      onRefresh?.();
    } catch (err: any) {
      setOutput(err?.message || 'Failed to summarize');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this document?')) return;
    setBusy(true);
    try {
      await deleteDocument(document.id);
      onRefresh?.();
    } catch (err: any) {
      setOutput(err?.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const handleQuery = async () => {
    const question = prompt('Enter your question for this document');
    if (!question) return;
    setBusy(true);
    setOutput(null);
    try {
      const res = await queryDocument(document.id, question);
      setOutput(res.answer);
    } catch (err: any) {
      setOutput(err?.message || 'Failed to query');
    } finally {
      setBusy(false);
    }
  };

  const handleExtract = async () => {
    setBusy(true);
    setOutput(null);
    try {
      const text = await extractDocumentText(document.id);
      setOutput(text.length > 2000 ? text.slice(0,2000) + '... (truncated)' : text);
    } catch (err: any) {
      setOutput(err?.message || 'Failed to extract text');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="document-card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <strong>{document.displayName}</strong>
          <div style={{ fontSize: 12, color: '#666' }}>{document.filename} • {Math.round(document.fileSize/1024)} KB</div>
        </div>
        <div>
          <button onClick={handleSummarize} disabled={busy || document.status !== 'ready'}>Summarize</button>
          <button onClick={handleQuery} disabled={busy || document.status !== 'ready'}>Ask</button>
          <button onClick={handleExtract} disabled={busy || document.status !== 'ready'}>Extract</button>
          <button onClick={handleDelete} disabled={busy}>Delete</button>
        </div>
      </div>

      {output && (
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{output}</pre>
      )}

      {document.summary && (
        <div style={{ marginTop: 8, fontSize: 13, color: '#333' }}>
          <strong>Saved summary:</strong>
          <div>{document.summary}</div>
        </div>
      )}
    </div>
  );
}
