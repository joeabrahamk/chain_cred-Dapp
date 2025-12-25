/**
 * ValuatorDashboard Page
 * 
 * Dashboard for valuators.
 * Allows searching and viewing files by user ID (read-only).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkValuatorAuthStatus, logoutValuator } from '../auth/valuatorAuth';
import { getFiles, getFileCount } from '../blockchain/contract';
import FileList from '../components/FileList';

const ValuatorDashboard = () => {
  const navigate = useNavigate();
  
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    email: null,
    name: null,
    companyName: null
  });
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchUserId, setSearchUserId] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [fileCount, setFileCount] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const auth = checkValuatorAuthStatus();
    
    if (!auth.isAuthenticated) {
      navigate('/');
      return;
    }

    setAuthState(auth);
    setLoading(false);
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    await logoutValuator();
    navigate('/');
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchUserId.trim()) {
      setSearchError('Please enter a User ID to search.');
      return;
    }

    setSearching(true);
    setSearchError('');
    setFileCount(null);

    try {
      // Check if user has any files
      const count = await getFileCount(searchUserId.trim());
      setFileCount(count);
      setCurrentUserId(searchUserId.trim());
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search for user. Please check the User ID and try again.');
    } finally {
      setSearching(false);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchUserId('');
    setCurrentUserId('');
    setFileCount(null);
    setSearchError('');
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard valuator">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>CChain</h1>
          <span className="user-type valuator-badge">Valuator (Read-Only)</span>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-label">Logged in as:</span>
            <span className="username">{authState.name}</span>
            {authState.companyName && (
              <span className="company-name">({authState.companyName})</span>
            )}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="search-section">
          <h2>Search User Files</h2>
          <p>Enter a User ID to view their uploaded files.</p>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                placeholder="Enter User ID..."
                disabled={searching}
                className="search-input"
              />
              <button type="submit" disabled={searching} className="search-button">
                {searching ? 'Searching...' : '🔍 Search'}
              </button>
              {currentUserId && (
                <button 
                  type="button" 
                  onClick={handleClearSearch} 
                  className="clear-button"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {searchError && (
            <div className="error-message">
              <p>{searchError}</p>
            </div>
          )}

          {currentUserId && fileCount !== null && (
            <div className="search-result-info">
              <p>
                Found <strong>{fileCount}</strong> file(s) for user: <strong>{currentUserId}</strong>
              </p>
            </div>
          )}
        </div>

        {currentUserId && (
          <FileList 
            userId={currentUserId} 
            isReadOnly={true}
          />
        )}

        {!currentUserId && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No User Selected</h3>
            <p>Search for a User ID above to view their files.</p>
          </div>
        )}

        <div className="valuator-notice">
          <p>
            <strong>⚠️ Read-Only Access:</strong> As a valuator, you can only view files. 
            Uploading and deleting files is not permitted.
          </p>
        </div>
      </main>

      <style>{`
        .dashboard {
          min-height: 100vh;
          background: #fafafa;
        }

        .dashboard.loading {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: #71717a;
          gap: 12px;
        }

        .dashboard.loading::after {
          content: '';
          width: 20px;
          height: 20px;
          border: 2px solid #e4e4e7;
          border-top-color: #18181b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dashboard-header {
          background: #18181b;
          color: #fff;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-left h1 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .user-type {
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .valuator-badge {
          background: #3b82f6;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .user-label {
          opacity: 0.7;
        }

        .username {
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 10px;
          border-radius: 6px;
          font-weight: 500;
        }

        .company-name {
          opacity: 0.7;
          font-size: 12px;
        }

        .logout-button {
          padding: 8px 16px;
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .dashboard-content {
          max-width: 800px;
          margin: 40px auto;
          padding: 0 24px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .search-section {
          background: #fff;
          padding: 28px;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid #e4e4e7;
        }

        .search-section h2 {
          margin: 0 0 4px 0;
          color: #18181b;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .search-section p {
          color: #71717a;
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .search-form {
          margin-bottom: 0;
        }

        .search-input-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 12px 14px;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.15s ease;
          background: #fff;
        }

        .search-input:hover {
          border-color: #d4d4d8;
        }

        .search-input:focus {
          outline: none;
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
        }

        .search-button {
          padding: 12px 20px;
          background: #18181b;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .search-button:hover:not(:disabled) {
          background: #27272a;
        }

        .search-button:disabled {
          background: #d4d4d8;
          cursor: not-allowed;
        }

        .clear-button {
          padding: 12px 16px;
          background: #fff;
          color: #52525b;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .clear-button:hover {
          background: #fafafa;
          border-color: #d4d4d8;
        }

        .error-message {
          margin-top: 16px;
          padding: 12px 14px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-message::before {
          content: '!';
          width: 18px;
          height: 18px;
          background: #dc2626;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .search-result-info {
          margin-top: 16px;
          padding: 12px 14px;
          background: #f0fdf4;
          color: #166534;
          border-radius: 8px;
          font-size: 14px;
        }

        .empty-state {
          background: #fff;
          padding: 64px 24px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 24px;
          border: 1px solid #e4e4e7;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.4;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #18181b;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .empty-state p {
          margin: 0;
          color: #71717a;
          font-size: 14px;
        }

        .valuator-notice {
          background: #fefce8;
          padding: 14px 16px;
          border-radius: 8px;
          border: 1px solid #fef08a;
          margin-top: 24px;
        }

        .valuator-notice p {
          margin: 0;
          color: #854d0e;
          font-size: 13px;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 12px 16px;
          }

          .dashboard-content {
            margin: 24px auto;
            padding: 0 16px;
          }

          .search-section {
            padding: 20px;
          }

          .search-input-group {
            flex-direction: column;
          }

          .search-button,
          .clear-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ValuatorDashboard;
