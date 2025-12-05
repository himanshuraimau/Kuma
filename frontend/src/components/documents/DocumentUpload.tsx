import React, { useState } from 'react';
import { uploadDocument } from '../../api/documents.api';

export default function DocumentUpload({ onUploaded }: { onUploaded?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file to upload');
      return;
    }

    setUploading(true);
    try {
      await uploadDocument(file);
      setFile(null);
      onUploaded?.();
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload">
      <input type="file" accept="application/pdf" onChange={handleFile} />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
