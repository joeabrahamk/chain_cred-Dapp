/**
 * Login Page
 * 
 * Entry point for the application.
 * Users can either connect with MetaMask or login as a Valuator.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithWallet, checkAuthStatus, formatAddress, wasLoggedOut } from '../auth/walletAuth';
import { loginAsValuator, signupValuator, checkValuatorAuthStatus } from '../auth/valuatorAuth';
import { isMetaMaskInstalled } from '../blockchain/web3';

const Login = () => {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'valuator'
  
  // Valuator sub-tab state
  const [valuatorMode, setValuatorMode] = useState('login'); // 'login' or 'signup'
  
  // User login state
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState('');
  
  // Valuator login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [valuatorError, setValuatorError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  
  // Valuator signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupCompanyName, setSignupCompanyName] = useState('');
  const [signingUp, setSigningUp] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkExistingAuth = async () => {
      // Check valuator first (from session)
      const valuatorAuth = checkValuatorAuthStatus();
      if (valuatorAuth.isAuthenticated) {
        navigate('/valuator');
        return;
      }

      // Don't auto-reconnect if user explicitly logged out
      if (wasLoggedOut()) {
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
      const auth = await loginAsValuator(email, password);
      console.log('Valuator logged in:', auth.name);
      navigate('/valuator');
    } catch (error) {
      console.error('Valuator login error:', error);
      setValuatorError(error.message);
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Valuator signup
  const handleValuatorSignup = async (e) => {
    e.preventDefault();
    setSigningUp(true);
    setSignupError('');
    setSignupSuccess(false);

    // Validate passwords match
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match.');
      setSigningUp(false);
      return;
    }

    try {
      const auth = await signupValuator({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        companyName: signupCompanyName
      });
      console.log('Valuator signed up:', auth.name);
      setSignupSuccess(true);
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/valuator');
      }, 1500);
    } catch (error) {
      console.error('Valuator signup error:', error);
      setSignupError(error.message);
    } finally {
      setSigningUp(false);
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
            <div className="valuator-tabs">
              <button
                className={`valuator-tab ${valuatorMode === 'login' ? 'active' : ''}`}
                onClick={() => { setValuatorMode('login'); setSignupError(''); setValuatorError(''); }}
              >
                Login
              </button>
              <button
                className={`valuator-tab ${valuatorMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setValuatorMode('signup'); setSignupError(''); setValuatorError(''); }}
              >
                Sign Up
              </button>
            </div>

            {valuatorMode === 'login' ? (
              <>
                <p className="description">
                  Login with your valuator credentials to view user files.
                </p>

                <form onSubmit={handleValuatorLogin}>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
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

                <p className="switch-mode">
                  Don't have an account?{' '}
                  <button onClick={() => setValuatorMode('signup')} className="link-button">
                    Sign up
                  </button>
                </p>
              </>
            ) : (
              <>
                <p className="description">
                  Create a valuator account to access file viewing features.
                </p>

                {signupSuccess ? (
                  <div className="success-message">
                    <p>✓ Account created successfully! Redirecting...</p>
                  </div>
                ) : (
                  <form onSubmit={handleValuatorSignup}>
                    <div className="form-group">
                      <label htmlFor="signupName">Full Name</label>
                      <input
                        type="text"
                        id="signupName"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Enter your full name"
                        disabled={signingUp}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="signupEmail">Email</label>
                      <input
                        type="email"
                        id="signupEmail"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={signingUp}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="signupCompanyName">Company Name</label>
                      <input
                        type="text"
                        id="signupCompanyName"
                        value={signupCompanyName}
                        onChange={(e) => setSignupCompanyName(e.target.value)}
                        placeholder="Enter your company name"
                        disabled={signingUp}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="signupPassword">Password</label>
                      <input
                        type="password"
                        id="signupPassword"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        disabled={signingUp}
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="signupConfirmPassword">Confirm Password</label>
                      <input
                        type="password"
                        id="signupConfirmPassword"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        disabled={signingUp}
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={signingUp}
                      className="login-button"
                    >
                      {signingUp ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>
                )}

                {signupError && (
                  <div className="error-message">
                    <p>{signupError}</p>
                  </div>
                )}

                <p className="switch-mode">
                  Already have an account?{' '}
                  <button onClick={() => setValuatorMode('login')} className="link-button">
                    Login
                  </button>
                </p>
              </>
            )}

            <div className="info-box">
              <p>Valuators have read-only access to view files.</p>
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
          background: #fafafa;
          padding: 24px;
          position: relative;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: #000;
          z-index: 0;
        }

        .login-container {
          background: #fff;
          padding: 48px 40px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          max-width: 420px;
          width: 100%;
          position: relative;
          z-index: 10;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        h1 {
          text-align: center;
          margin: 0 0 4px 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.5px;
        }

        .subtitle {
          text-align: center;
          color: #71717a;
          margin: 0 0 32px 0;
          font-size: 14px;
          font-weight: 400;
        }

        .tabs {
          display: flex;
          margin-bottom: 32px;
          border-bottom: 1px solid #e4e4e7;
        }

        .tab {
          flex: 1;
          padding: 12px 0;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #a1a1aa;
          transition: all 0.2s ease;
          position: relative;
        }

        .tab::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: transparent;
          transition: all 0.2s ease;
        }

        .tab:hover {
          color: #52525b;
        }

        .tab.active {
          color: #000;
        }

        .tab.active::after {
          background: #000;
        }

        h2 {
          margin: 0 0 8px 0;
          color: #18181b;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .description {
          color: #71717a;
          font-size: 14px;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .connect-button {
          width: 100%;
          padding: 14px 20px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .connect-button:hover:not(:disabled) {
          background: #27272a;
          transform: translateY(-1px);
        }

        .connect-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .connect-button:disabled {
          background: #d4d4d8;
          cursor: not-allowed;
        }

        .metamask-warning {
          text-align: center;
          padding: 20px;
          background: #fef3c7;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .metamask-warning p {
          margin: 0 0 8px 0;
          font-weight: 500;
          color: #92400e;
          font-size: 14px;
        }

        .install-link {
          color: #000;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
        }

        .install-link:hover {
          text-decoration: underline;
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
          border-color: #000;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
        }

        .form-group input::placeholder {
          color: #a1a1aa;
        }

        .login-button {
          width: 100%;
          padding: 14px 20px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-button:hover:not(:disabled) {
          background: #27272a;
          transform: translateY(-1px);
        }

        .login-button:disabled {
          background: #d4d4d8;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 20px;
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

        .error-message p {
          margin: 0;
        }

        .info-box {
          margin-top: 28px;
          padding: 16px;
          background: #fafafa;
          border-radius: 10px;
          font-size: 13px;
          border: 1px solid #f4f4f5;
        }

        .info-box h4 {
          margin: 0 0 10px 0;
          color: #18181b;
          font-size: 13px;
          font-weight: 600;
        }

        .info-box ol {
          margin: 0;
          padding-left: 18px;
          color: #71717a;
        }

        .info-box li {
          margin-bottom: 4px;
          line-height: 1.5;
        }

        .info-box p {
          margin: 0;
          color: #71717a;
          line-height: 1.5;
        }

        .valuator-tabs {
          display: flex;
          background: #f4f4f5;
          border-radius: 8px;
          padding: 4px;
          margin-bottom: 24px;
        }

        .valuator-tab {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #71717a;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .valuator-tab:hover {
          color: #18181b;
        }

        .valuator-tab.active {
          background: #fff;
          color: #18181b;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .switch-mode {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #71717a;
        }

        .link-button {
          background: none;
          border: none;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          text-decoration: underline;
        }

        .link-button:hover {
          opacity: 0.7;
        }

        .success-message {
          padding: 16px;
          background: #f0fdf4;
          color: #16a34a;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          text-align: center;
          border: 1px solid #bbf7d0;
        }

        .success-message p {
          margin: 0;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 32px 24px;
          }

          h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
