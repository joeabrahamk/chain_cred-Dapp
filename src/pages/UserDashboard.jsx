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
          background: #fff;
          border-bottom: 1px solid #e4e4e7;
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
          color: #18181b;
          letter-spacing: -0.5px;
        }

        .user-type {
          background: #f4f4f5;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #52525b;
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
          font-size: 13px;
        }

        .wallet-label,
        .user-id-label {
          color: #71717a;
        }

        .wallet-address {
          font-family: 'SF Mono', 'Monaco', monospace;
          background: #f4f4f5;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          color: #18181b;
        }

        .user-id {
          background: #f4f4f5;
          padding: 6px 10px;
          border-radius: 6px;
          font-weight: 500;
          color: #18181b;
          font-size: 13px;
        }

        .logout-button {
          padding: 8px 16px;
          background: #fff;
          color: #52525b;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .logout-button:hover {
          background: #fafafa;
          border-color: #d4d4d8;
          color: #18181b;
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

        .register-section {
          background: #fff;
          padding: 48px 40px;
          border-radius: 12px;
          border: 1px solid #e4e4e7;
          text-align: center;
        }

        .register-section h2 {
          margin: 0 0 8px 0;
          color: #18181b;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .register-section p {
          color: #71717a;
          margin-bottom: 32px;
          font-size: 15px;
        }

        .register-form {
          max-width: 360px;
          margin: 0 auto;
          text-align: left;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #3f3f46;
          font-weight: 500;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          font-size: 15px;
          box-sizing: border-box;
          transition: all 0.15s ease;
          background: #fff;
        }

        .form-group input:hover {
          border-color: #d4d4d8;
        }

        .form-group input:focus {
          outline: none;
          border-color: #18181b;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
        }

        .form-group small {
          display: block;
          margin-top: 6px;
          color: #a1a1aa;
          font-size: 12px;
        }

        .register-button {
          width: 100%;
          padding: 14px 20px;
          background: #18181b;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .register-button:hover:not(:disabled) {
          background: #27272a;
        }

        .register-button:disabled {
          background: #d4d4d8;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 20px;
          padding: 12px 14px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 8px;
          text-align: left;
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

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 12px 16px;
          }

          .dashboard-content {
            margin: 24px auto;
            padding: 0 16px;
          }

          .register-section {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
