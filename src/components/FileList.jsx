/**
 * FileList Component
 * 
 * Displays a list of all files for a user.
 * Shows file name, upload date, and action buttons.
 */

import React, { useState, useEffect } from 'react';
import { getFiles } from '../blockchain/contract';
import DownloadFile from './DownloadFile';
import DeleteFile from './DeleteFile';

const FileList = ({ userId, isReadOnly = false, onRefresh }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFiles = async () => {
    if (!userId) {
      setFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userFiles = await getFiles(userId);
      setFiles(userFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [userId]);

  // Allow parent to trigger refresh
  useEffect(() => {
    if (onRefresh) {
      onRefresh(fetchFiles);
    }
  }, [onRefresh]);

  const handleDeleteComplete = () => {
    fetchFiles();
  };

  if (loading) {
    return (
      <div className="file-list loading">
        <p>Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-list error">
        <p>{error}</p>
        <button onClick={fetchFiles}>Retry</button>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="file-list empty">
        <p>Please register or search for a user to view files.</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-list empty">
        <h3>My Files</h3>
        <p>No files uploaded yet.</p>
        {!isReadOnly && <p>Use the upload form above to add your first file!</p>}
      </div>
    );
  }

  return (
    <div className="file-list">
      <h3>{isReadOnly ? `Files for User: ${userId}` : 'My Files'}</h3>
      <p className="file-count">{files.length} file(s)</p>
      
      <div className="files-table-container">
        <table className="files-table">
          <thead>
            <tr>
              <th>#</th>
              <th>File Name</th>
              <th>Upload Date</th>
              <th>CID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={`${file.cid}-${index}`}>
                <td>{index + 1}</td>
                <td className="file-name">{file.name}</td>
                <td className="upload-date">{file.uploadDate}</td>
                <td className="cid">
                  <span title={file.cid}>
                    {file.cid.slice(0, 10)}...{file.cid.slice(-6)}
                  </span>
                </td>
                <td className="actions">
                  <DownloadFile cid={file.cid} fileName={file.name} />
                  {!isReadOnly && (
                    <DeleteFile
                      userId={userId}
                      fileIndex={file.index}
                      fileName={file.name}
                      onDeleteComplete={handleDeleteComplete}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={fetchFiles} className="refresh-button">
        Refresh List
      </button>

      <style>{`
        .file-list {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e4e4e7;
        }

        .file-list h3 {
          margin: 0 0 4px 0;
          color: #18181b;
          font-size: 1rem;
          font-weight: 600;
        }

        .file-count {
          color: #71717a;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .file-list.loading,
        .file-list.empty,
        .file-list.error {
          text-align: center;
          padding: 48px 24px;
          color: #71717a;
          font-size: 14px;
        }

        .file-list.loading::after {
          content: '';
          display: block;
          width: 20px;
          height: 20px;
          margin: 12px auto 0;
          border: 2px solid #e4e4e7;
          border-top-color: #18181b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .file-list.error {
          color: #dc2626;
        }

        .file-list.error button {
          margin-top: 12px;
          padding: 10px 16px;
          background: #18181b;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .files-table-container {
          overflow-x: auto;
          margin-bottom: 16px;
        }

        .files-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .files-table th,
        .files-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #f4f4f5;
        }

        .files-table th {
          background: #fafafa;
          font-weight: 500;
          color: #71717a;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .files-table tr:last-child td {
          border-bottom: none;
        }

        .files-table tr:hover {
          background: #fafafa;
        }

        .file-name {
          font-weight: 500;
          color: #18181b;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .upload-date {
          color: #71717a;
          white-space: nowrap;
          font-size: 13px;
        }

        .cid {
          font-family: 'SF Mono', 'Monaco', monospace;
          font-size: 11px;
          color: #71717a;
          background: #f4f4f5;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .cid span {
          cursor: pointer;
        }

        .cid span:hover {
          color: #18181b;
        }

        .actions {
          white-space: nowrap;
        }

        .actions > * {
          margin-right: 6px;
        }

        .refresh-button {
          padding: 10px 16px;
          background: #fff;
          color: #52525b;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .refresh-button:hover {
          background: #fafafa;
          border-color: #d4d4d8;
          color: #18181b;
        }
      `}</style>
    </div>
  );
};

export default FileList;
