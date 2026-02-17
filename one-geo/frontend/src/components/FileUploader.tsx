import React, { useState } from 'react';
import axios from 'axios';
import './FileUploader.css';

interface Props {
  onUploadSuccess: () => void;
}

export default function FileUploader({ onUploadSuccess }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.las')) {
      setMessageType('error');
      setMessage('Please upload a .las file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/upload', formData);
      setMessageType('success');
      setMessage(`✓ ${response.data.message}`);
      onUploadSuccess();
    } catch (error: any) {
      setMessageType('error');
      setMessage(`✗ ${error.response?.data?.error || 'Upload failed'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <h2>📁 Upload Well Data</h2>

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-icon">📂</div>
        <p className="drop-text">Drop your .LAS file here</p>
        <p className="drop-subtext">or click to browse</p>
        <input
          type="file"
          accept=".las"
          onChange={handleFileInput}
          disabled={isUploading}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          {isUploading ? 'Uploading...' : 'Select File'}
        </label>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
}
