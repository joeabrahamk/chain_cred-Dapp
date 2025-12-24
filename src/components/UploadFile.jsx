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
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .upload-file h3 {
          margin-top: 0;
          color: #333;
        }

        .upload-area {
          margin-bottom: 15px;
        }

        .file-input {
          width: 100%;
          padding: 10px;
          border: 2px dashed #ccc;
          border-radius: 4px;
          cursor: pointer;
        }

        .file-input:hover {
          border-color: #007bff;
        }

        .selected-file-info {
          margin-top: 10px;
          padding: 10px;
          background: #e9ecef;
          border-radius: 4px;
        }

        .selected-file-info p {
          margin: 5px 0;
          font-size: 14px;
        }

        .upload-button {
          width: 100%;
          padding: 12px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .upload-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .upload-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .upload-progress {
          margin-top: 10px;
          padding: 10px;
          background: #d4edda;
          color: #155724;
          border-radius: 4px;
          text-align: center;
        }

        .error-message {
          margin-top: 10px;
          padding: 10px;
          background: #f8d7da;
          color: #721c24;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default UploadFile;
