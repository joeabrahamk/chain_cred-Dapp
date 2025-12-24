/**
 * Login Page
 * 
 * Entry point for the application.
 * Users can either connect with MetaMask or login as a Valuator.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithWallet, checkAuthStatus, formatAddress } from '../auth/walletAuth';
import { loginAsValuator, checkValuatorAuthStatus } from '../auth/valuatorAuth';
import { isMetaMaskInstalled } from '../blockchain/web3';

const Login = () => {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'valuator'
  
  // User login state
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState('');
  
  // Valuator login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [valuatorError, setValuatorError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkExistingAuth = async () => {
      // Check valuator first (from session)
      const valuatorAuth = checkValuatorAuthStatus();
      if (valuatorAuth.isAuthenticated) {
        navigate('/valuator');
        return;
      }

      // Check wallet connection
      const walletAuth = await checkAuthStatus();
      if (walletAuth.isAuthenticated) {
        navigate('/dashboard');
      }
    };

    checkExistingAuth();
  }, [navigate]);

  // Handle MetaMask connection
  const handleConnectWallet = async () => {
    setConnecting(true);
    setWalletError('');

    try {
      const auth = await loginWithWallet(true); // autoRegister = true
      console.log('Wallet connected:', formatAddress(auth.walletAddress));
      navigate('/dashboard');
    } catch (error) {
      console.error('Wallet connection error:', error);
      setWalletError(error.message);
    } finally {
      setConnecting(false);
    }
  };

  // Handle Valuator login
  const handleValuatorLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setValuatorError('');

    try {
      const auth = loginAsValuator(username, password);
      console.log('Valuator logged in:', auth.name);
      navigate('/valuator');
    } catch (error) {
      console.error('Valuator login error:', error);
      setValuatorError(error.message);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>CChain</h1>
        <p className="subtitle">Decentralized File Storage</p>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            General User
          </button>
          <button
            className={`tab ${activeTab === 'valuator' ? 'active' : ''}`}
            onClick={() => setActiveTab('valuator')}
          >
            Valuator
          </button>
        </div>

        {activeTab === 'user' ? (
          <div className="user-login">
            <h2>Connect Your Wallet</h2>
            <p className="description">
              Use MetaMask to connect your Ethereum wallet. 
              Your wallet address will be your identity.
            </p>

            {!isMetaMaskInstalled() ? (
              <div className="metamask-warning">
                <p>⚠️ MetaMask is not installed</p>
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="install-link"
                >
                  Install MetaMask →
                </a>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={connecting}
                className="connect-button"
              >
                {connecting ? 'Connecting...' : '🦊 Connect with MetaMask'}
              </button>
            )}

            {walletError && (
              <div className="error-message">
                <p>{walletError}</p>
              </div>
            )}

            <div className="info-box">
              <h4>First time?</h4>
              <ol>
                <li>Install MetaMask browser extension</li>
                <li>Create or import a wallet</li>
                <li>Switch to Ganache network (localhost:7545)</li>
                <li>Import a Ganache test account</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="valuator-login">
            <h2>Valuator Login</h2>
            <p className="description">
              Login with your valuator credentials to view user files.
            </p>

            <form onSubmit={handleValuatorLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  disabled={loggingIn}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loggingIn}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="login-button"
              >
                {loggingIn ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {valuatorError && (
              <div className="error-message">
                <p>{valuatorError}</p>
              </div>
            )}

            <div className="info-box">
              <h4>Note</h4>
              <p>Valuators have read-only access. You can view files but cannot upload or delete.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 450px;
          width: 100%;
        }

        h1 {
          text-align: center;
          margin: 0 0 5px 0;
          color: #333;
          font-size: 2.5rem;
        }

        .subtitle {
          text-align: center;
          color: #666;
          margin: 0 0 30px 0;
        }

        .tabs {
          display: flex;
          margin-bottom: 30px;
          border-bottom: 2px solid #eee;
        }

        .tab {
          flex: 1;
          padding: 12px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          color: #666;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #333;
        }

        .tab.active {
          color: #667eea;
          border-bottom: 2px solid #667eea;
          margin-bottom: -2px;
        }

        h2 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1.3rem;
        }

        .description {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .connect-button {
          width: 100%;
          padding: 14px 20px;
          background: #f6851b;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .connect-button:hover:not(:disabled) {
          background: #e2761b;
        }

        .connect-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .metamask-warning {
          text-align: center;
          padding: 20px;
          background: #fff3cd;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .install-link {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
        }

        .install-link:hover {
          text-decoration: underline;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
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

        .login-button {
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

        .login-button:hover:not(:disabled) {
          background: #5a6fd6;
        }

        .login-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 15px;
          padding: 12px;
          background: #f8d7da;
          color: #721c24;
          border-radius: 6px;
          font-size: 14px;
        }

        .info-box {
          margin-top: 25px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 13px;
        }

        .info-box h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .info-box ol {
          margin: 0;
          padding-left: 20px;
          color: #666;
        }

        .info-box li {
          margin-bottom: 5px;
        }

        .info-box p {
          margin: 0;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Login;
