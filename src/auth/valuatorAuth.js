/**
 * Valuator Authentication
 * 
 * This module handles username/password authentication for valuators.
 * Valuators have read-only access to view any user's files.
 * 
 * NOTE: This is a prototype implementation. In production, use proper
 * authentication with hashed passwords and secure storage.
 */

import valuatorsConfig from '../config/valuators.json';

/**
 * Valuator authentication state
 */
let valuatorAuthState = {
  isAuthenticated: false,
  username: null,
  name: null
};

/**
 * Get current valuator authentication state
 * @returns {Object} The current auth state
 */
export const getValuatorAuthState = () => ({ ...valuatorAuthState });

/**
 * Login as a valuator
 * @param {string} username - The valuator's username
 * @param {string} password - The valuator's password
 * @returns {Object} The auth state after login
 */
export const loginAsValuator = (username, password) => {
  // Validate inputs
  if (!username || !password) {
    throw new Error('Please enter both username and password.');
  }

  // Find the valuator in the config
  const valuator = valuatorsConfig.valuators.find(
    (v) => v.username === username && v.password === password
  );

  if (!valuator) {
    throw new Error('Invalid username or password.');
  }

  // Update state
  valuatorAuthState = {
    isAuthenticated: true,
    username: valuator.username,
    name: valuator.name || valuator.username
  };

  // Store in session (optional - for page refreshes)
  sessionStorage.setItem('valuatorAuth', JSON.stringify(valuatorAuthState));

  return valuatorAuthState;
};

/**
 * Check if valuator is logged in (including from session storage)
 * @returns {Object} The auth state
 */
export const checkValuatorAuthStatus = () => {
  // Check session storage first
  const stored = sessionStorage.getItem('valuatorAuth');
  
  if (stored) {
    try {
      valuatorAuthState = JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored auth state:', error);
      valuatorAuthState = {
        isAuthenticated: false,
        username: null,
        name: null
      };
    }
  }

  return valuatorAuthState;
};

/**
 * Logout valuator
 */
export const logoutValuator = () => {
  valuatorAuthState = {
    isAuthenticated: false,
    username: null,
    name: null
  };
  
  // Clear session storage
  sessionStorage.removeItem('valuatorAuth');
};

/**
 * Check if a user is a valuator (not a wallet user)
 * @returns {boolean} True if logged in as valuator
 */
export const isValuator = () => {
  return valuatorAuthState.isAuthenticated;
};

/**
 * Get list of all valuator usernames (for admin purposes)
 * @returns {Array<string>} Array of usernames
 */
export const getValuatorUsernames = () => {
  return valuatorsConfig.valuators.map(v => v.username);
};

export default {
  getValuatorAuthState,
  loginAsValuator,
  checkValuatorAuthStatus,
  logoutValuator,
  isValuator,
  getValuatorUsernames
};
