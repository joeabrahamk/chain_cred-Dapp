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
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .file-list h3 {
          margin-top: 0;
          color: #333;
        }

        .file-count {
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .file-list.loading,
        .file-list.empty,
        .file-list.error {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .file-list.error {
          color: #dc3545;
        }

        .files-table-container {
          overflow-x: auto;
          margin-bottom: 15px;
        }

        .files-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .files-table th,
        .files-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .files-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        .files-table tr:hover {
          background: #f8f9fa;
        }

        .file-name {
          font-weight: 500;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .upload-date {
          color: #666;
          white-space: nowrap;
        }

        .cid {
          font-family: monospace;
          font-size: 12px;
          color: #666;
        }

        .actions {
          white-space: nowrap;
        }

        .actions > * {
          margin-right: 8px;
        }

        .refresh-button {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .refresh-button:hover {
          background: #5a6268;
        }
      `}</style>
    </div>
  );
};

export default FileList;
