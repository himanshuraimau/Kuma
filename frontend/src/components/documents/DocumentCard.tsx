import React, { useState } from 'react';
import type { Document } from '../../api/documents.api';
import { summarizeDocument, deleteDocument, queryDocument, extractDocumentText } from '../../api/documents.api';
import { FileText, Trash2, MessageSquare, FileSearch, Loader2, CheckCircle, Clock, XCircle, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentCard({ document, onRefresh }: { document: Document; onRefresh?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState(false);

  const handleSummarize = async () => {
    setBusy(true);
    setOutput(null);
    setShowOutput(true);
    try {
      const summary = await summarizeDocument(document.id);
      setOutput(summary);
      onRefresh?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to summarize';
      setOutput(message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${document.displayName}"?`)) return;
    setBusy(true);
    try {
      await deleteDocument(document.id);
      onRefresh?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      alert(message);
    } finally {
      setBusy(false);
    }
  };

  const handleQuery = async () => {
    const question = prompt('Enter your question for this document');
    if (!question) return;
    setBusy(true);
    setOutput(null);
    setShowOutput(true);
    try {
      const res = await queryDocument(document.id, question);
      setOutput(res.answer);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to query';
      setOutput(message);
    } finally {
      setBusy(false);
    }
  };

  const handleExtract = async () => {
    setBusy(true);
    setOutput(null);
    setShowOutput(true);
    try {
      const text = await extractDocumentText(document.id);
      setOutput(text.length > 2000 ? text.slice(0, 2000) + '...\n\n(truncated for display)' : text);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to extract text';
      setOutput(message);
    } finally {
      setBusy(false);
    }
  };

  const getStatusIcon = () => {
    switch (document.status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getStatusText = () => {
    switch (document.status) {
      case 'ready':
        return 'Ready';
      case 'processing':
        return 'Processing...';
      case 'failed':
        return 'Failed';
      default:
        return document.status;
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100 truncate mb-1">
              {document.displayName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{(document.fileSize / 1024).toFixed(0)} KB</span>
              {document.pageCount && (
                <>
                  <span>•</span>
                  <span>{document.pageCount} pages</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-xs font-medium ${
            document.status === 'ready' ? 'text-green-500' :
            document.status === 'processing' ? 'text-yellow-500' :
            document.status === 'failed' ? 'text-red-500' :
            'text-zinc-500'
          }`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-zinc-900/50">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleQuery}
            disabled={busy || document.status !== 'ready'}
            variant="outline"
            size="sm"
            className="text-xs bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
          >
            {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <MessageSquare className="w-3 h-3 mr-1" />}
            Ask
          </Button>

          <Button
            onClick={handleSummarize}
            disabled={busy || document.status !== 'ready'}
            variant="outline"
            size="sm"
            className="text-xs bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
          >
            {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <FileSearch className="w-3 h-3 mr-1" />}
            Summarize
          </Button>

          <Button
            onClick={handleExtract}
            disabled={busy || document.status !== 'ready'}
            variant="outline"
            size="sm"
            className="text-xs bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300"
          >
            {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <FileType className="w-3 h-3 mr-1" />}
            Extract
          </Button>

          <Button
            onClick={handleDelete}
            disabled={busy}
            variant="outline"
            size="sm"
            className="text-xs bg-red-900/20 hover:bg-red-900/30 border-red-900/50 text-red-400"
          >
            {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
            Delete
          </Button>
        </div>
      </div>

      {/* Output Section */}
      {showOutput && output && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Result</span>
            <button
              onClick={() => setShowOutput(false)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="text-sm text-zinc-300 bg-zinc-900 rounded p-3 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {output}
          </div>
        </div>
      )}

      {/* Saved Summary */}
      {document.summary && !showOutput && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/30">
          <div className="text-xs font-medium text-zinc-400 mb-2">Saved Summary</div>
          <div className="text-sm text-zinc-400 line-clamp-3">
            {document.summary}
          </div>
        </div>
      )}
    </div>
  );
}
