/**
 * DeleteFile Component
 * 
 * A button component that deletes a file from the blockchain.
 * Requires confirmation before deletion.
 */

import React, { useState } from 'react';
import { deleteFile } from '../blockchain/contract';

const DeleteFile = ({ userId, fileIndex, fileName, onDeleteComplete }) => {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteClick = () => {
    setConfirmDelete(true);
    setError('');
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setError('');

    try {
      await deleteFile(userId, fileIndex);
      setConfirmDelete(false);
      
      if (onDeleteComplete) {
        onDeleteComplete();
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message || 'Failed to delete file');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setError('');
  };

  if (confirmDelete) {
    return (
      <span className="delete-confirm">
        <span className="confirm-text">Delete "{fileName}"?</span>
        <button
          onClick={handleConfirmDelete}
          disabled={deleting}
          className="confirm-yes"
        >
          {deleting ? '...' : 'Yes'}
        </button>
        <button
          onClick={handleCancelDelete}
          disabled={deleting}
          className="confirm-no"
        >
          No
        </button>
        {error && <span className="delete-error">{error}</span>}

        <style>{`
          .delete-confirm {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .confirm-text {
            font-size: 13px;
            color: #dc3545;
          }

          .confirm-yes {
            padding: 4px 8px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }

          .confirm-yes:hover:not(:disabled) {
            background: #c82333;
          }

          .confirm-no {
            padding: 4px 8px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          }

          .confirm-no:hover:not(:disabled) {
            background: #5a6268;
          }

          .delete-error {
            font-size: 12px;
            color: #dc3545;
          }
        `}</style>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleDeleteClick}
        className="delete-button"
        title={`Delete ${fileName}`}
      >
        🗑️ Delete
      </button>

      <style>{`
        .delete-button {
          padding: 6px 12px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.2s;
        }

        .delete-button:hover {
          background: #c82333;
        }
      `}</style>
    </>
  );
};

export default DeleteFile;
