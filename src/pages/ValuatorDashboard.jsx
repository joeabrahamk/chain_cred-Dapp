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
    username: null,
    name: null
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
  const handleLogout = () => {
    logoutValuator();
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
          background: #f0f2f5;
        }

        .dashboard.loading {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #666;
        }

        .dashboard-header {
          background: #2c3e50;
          color: white;
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .header-left h1 {
          margin: 0;
          font-size: 1.5rem;
        }

        .user-type {
          background: rgba(255,255,255,0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
        }

        .valuator-badge {
          background: #e74c3c;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .user-label {
          opacity: 0.8;
        }

        .username {
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .logout-button {
          padding: 8px 16px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .logout-button:hover {
          background: rgba(255,255,255,0.3);
        }

        .dashboard-content {
          max-width: 900px;
          margin: 30px auto;
          padding: 0 20px;
        }

        .search-section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .search-section h2 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .search-section p {
          color: #666;
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .search-form {
          margin-bottom: 15px;
        }

        .search-input-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #2c3e50;
        }

        .search-button {
          padding: 12px 24px;
          background: #2c3e50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .search-button:hover:not(:disabled) {
          background: #34495e;
        }

        .search-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .clear-button {
          padding: 12px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .clear-button:hover {
          background: #5a6268;
        }

        .error-message {
          margin-top: 15px;
          padding: 12px;
          background: #f8d7da;
          color: #721c24;
          border-radius: 6px;
        }

        .search-result-info {
          margin-top: 15px;
          padding: 12px;
          background: #d4edda;
          color: #155724;
          border-radius: 6px;
        }

        .empty-state {
          background: white;
          padding: 60px 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
          margin-bottom: 20px;
        }

        .empty-icon {
          font-size: 60px;
          margin-bottom: 15px;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .empty-state p {
          margin: 0;
          color: #666;
        }

        .valuator-notice {
          background: #fff3cd;
          padding: 15px 20px;
          border-radius: 8px;
          border-left: 4px solid #ffc107;
          margin-top: 20px;
        }

        .valuator-notice p {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ValuatorDashboard;
