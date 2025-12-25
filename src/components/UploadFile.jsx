/**
 * UploadFile Component
 * 
 * Allows users to select and upload files to IPFS,
 * then stores the metadata on the blockchain.
 */

import React, { useState, useRef } from 'react';
import { uploadToIpfs } from '../ipfs/ipfsClient';
import { uploadFileMetadata } from '../blockchain/contract';
import config from '../config/appConfig';

const UploadFile = ({ userId, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError('');
    
    if (file) {
      // Validate file size
      if (config.maxFileSize && file.size > config.maxFileSize) {
        setError(`File size exceeds maximum allowed size of ${config.maxFileSize / (1024 * 1024)}MB`);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    if (!userId) {
      setError('User not registered. Please register first.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Step 1: Upload to IPFS
      setUploadProgress('Uploading to IPFS...');
      const cid = await uploadToIpfs(selectedFile);
      console.log('File uploaded to IPFS with CID:', cid);

      // Step 2: Store metadata on blockchain
      setUploadProgress('Storing metadata on blockchain...');
      await uploadFileMetadata(userId, cid, selectedFile.name);
      console.log('Metadata stored on blockchain');

      // Success!
      setUploadProgress('Upload complete!');
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete();
      }

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress('');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload file. Please try again.');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-file">
      <h3>Upload File</h3>
      
      <div className="upload-area">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          disabled={uploading}
          className="file-input"
        />
        
        {selectedFile && (
          <div className="selected-file-info">
            <p><strong>Selected:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
            <p><strong>Type:</strong> {selectedFile.type || 'Unknown'}</p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="upload-button"
      >
        {uploading ? 'Uploading...' : 'Upload to IPFS'}
      </button>

      {uploadProgress && (
        <div className="upload-progress">
          <p>{uploadProgress}</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <style>{`
        .upload-file {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid #e4e4e7;
        }

        .upload-file h3 {
          margin: 0 0 16px 0;
          color: #18181b;
          font-size: 1rem;
          font-weight: 600;
        }

        .upload-area {
          margin-bottom: 16px;
        }

        .file-input {
          width: 100%;
          padding: 20px;
          border: 1px dashed #d4d4d8;
          border-radius: 8px;
          cursor: pointer;
          background: #fafafa;
          transition: all 0.15s ease;
          font-size: 14px;
          color: #52525b;
        }

        .file-input:hover {
          border-color: #a1a1aa;
          background: #f4f4f5;
        }

        .file-input:focus {
          outline: none;
          border-color: #18181b;
        }

        .selected-file-info {
          margin-top: 12px;
          padding: 14px;
          background: #f4f4f5;
          border-radius: 8px;
        }

        .selected-file-info p {
          margin: 4px 0;
          font-size: 13px;
          color: #52525b;
        }

        .selected-file-info strong {
          color: #18181b;
        }

        .upload-button {
          width: 100%;
          padding: 14px 20px;
          background: #18181b;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .upload-button:hover:not(:disabled) {
          background: #27272a;
        }

        .upload-button:disabled {
          background: #d4d4d8;
          cursor: not-allowed;
        }

        .upload-progress {
          margin-top: 12px;
          padding: 12px 14px;
          background: #f0fdf4;
          color: #166534;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
        }

        .upload-progress p {
          margin: 0;
        }

        .error-message {
          margin-top: 12px;
          padding: 12px 14px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 14px;
        }

        .error-message p {
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default UploadFile;
