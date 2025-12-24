/**
 * UserDashboard Page
 * 
 * Main dashboard for general users.
 * Allows uploading, viewing, downloading, and deleting files.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus, logout, formatAddress, registerNewUser } from '../auth/walletAuth';
import { isUserRegistered, getUserId } from '../blockchain/contract';
import UploadFile from '../components/UploadFile';
import FileList from '../components/FileList';

const UserDashboard = () => {
  const navigate = useNavigate();
  
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    walletAddress: null,
    userId: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshFiles, setRefreshFiles] = useState(null);
  
  // Registration state
  const [showRegister, setShowRegister] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await checkAuthStatus();
        
        if (!auth.isAuthenticated) {
          navigate('/');
          return;
        }

        // Check if user is registered on blockchain
        const registered = await isUserRegistered(auth.walletAddress);
        
        if (!registered) {
          setShowRegister(true);
        } else {
          // Get user ID
          const userId = await getUserId(auth.walletAddress);
          auth.userId = userId;
        }

        setAuthState(auth);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setRegisterError('');

    try {
      const auth = await registerNewUser(newUserId);
      setAuthState(auth);
      setShowRegister(false);
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError(error.message);
    } finally {
      setRegistering(false);
    }
  };

  // Callback to trigger file list refresh
  const handleUploadComplete = useCallback(() => {
    if (refreshFiles) {
      refreshFiles();
    }
  }, [refreshFiles]);

  // Set up refresh function from FileList
  const handleRefreshCallback = useCallback((refreshFn) => {
    setRefreshFiles(() => refreshFn);
  }, []);

  if (loading) {
    return (
      <div className="dashboard loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>CChain</h1>
          <span className="user-type">General User</span>
        </div>
        <div className="header-right">
          <div className="wallet-info">
            <span className="wallet-label">Wallet:</span>
            <span className="wallet-address" title={authState.walletAddress}>
              {formatAddress(authState.walletAddress)}
            </span>
          </div>
          {authState.userId && (
            <div className="user-id-info">
              <span className="user-id-label">User ID:</span>
              <span className="user-id">{authState.userId}</span>
            </div>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {showRegister ? (
          <div className="register-section">
            <h2>Complete Registration</h2>
            <p>Choose a unique User ID to identify yourself on the network.</p>
            
            <form onSubmit={handleRegister} className="register-form">
              <div className="form-group">
                <label htmlFor="userId">User ID</label>
                <input
                  type="text"
                  id="userId"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="e.g., john_doe_123"
                  disabled={registering}
                  required
                  minLength={3}
                  maxLength={50}
                />
                <small>3-50 characters. This cannot be changed later.</small>
              </div>

              <button type="submit" disabled={registering} className="register-button">
                {registering ? 'Registering...' : 'Register'}
              </button>
            </form>

            {registerError && (
              <div className="error-message">
                <p>{registerError}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <UploadFile 
              userId={authState.userId} 
              onUploadComplete={handleUploadComplete} 
            />
            <FileList 
              userId={authState.userId} 
              isReadOnly={false}
              onRefresh={handleRefreshCallback}
            />
          </>
        )}
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
          background: #667eea;
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

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .wallet-info,
        .user-id-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .wallet-label,
        .user-id-label {
          opacity: 0.8;
        }

        .wallet-address {
          font-family: monospace;
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .user-id {
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

        .register-section {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
        }

        .register-section h2 {
          margin-top: 0;
          color: #333;
        }

        .register-section p {
          color: #666;
          margin-bottom: 30px;
        }

        .register-form {
          max-width: 400px;
          margin: 0 auto;
          text-align: left;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group small {
          display: block;
          margin-top: 5px;
          color: #999;
          font-size: 12px;
        }

        .register-button {
          width: 100%;
          padding: 14px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .register-button:hover:not(:disabled) {
          background: #5a6fd6;
        }

        .register-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 20px;
          padding: 12px;
          background: #f8d7da;
          color: #721c24;
          border-radius: 6px;
          text-align: left;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
