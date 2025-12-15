/**
 * Parent API Utilities
 * Handles all API calls for the parent portal including authentication,
 * stats fetching, and feedback submission.
 */

import { parseError, handleError, isOnline } from './parentErrorHandler';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Register a new parent account
 * @param {Object} data - Parent registration data
 * @param {string} data.username - Parent username
 * @param {string} data.password - Parent password
 * @param {string} data.name - Parent name (optional)
 * @param {string} data.phone_number - Parent phone number (optional)
 * @param {string} data.student_username - Student username to link
 * @returns {Promise<Object>} Parent data
 * @throws {Error} If registration fails
 */
export async function registerParent(data) {
  // Check network connectivity
  if (!isOnline()) {
    const error = await parseError(null, new Error('No internet connection'));
    handleError(error, { redirectOnAuth: false });
    throw error;
  }

  try {
    const res = await fetch(`${API_URL}/parents/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await parseError(res, null);
      throw error;
    }

    return await res.json();
  } catch (error) {
    // If error is already parsed, re-throw it
    if (error.type) {
      throw error;
    }
    // Parse network errors
    const parsedError = await parseError(null, error);
    throw parsedError;
  }
}

/**
 * Login parent and receive JWT token
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Parent username
 * @param {string} credentials.password - Parent password
 * @returns {Promise<Object>} Authentication response with access_token
 * @throws {Error} If login fails
 */
export async function loginParent({ username, password }) {
  // Check network connectivity
  if (!isOnline()) {
    const error = await parseError(null, new Error('No internet connection'));
    handleError(error, { redirectOnAuth: false });
    throw error;
  }

  try {
    const res = await fetch(`${API_URL}/parents/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const error = await parseError(res, null);
      throw error;
    }

    const data = await res.json();
    
    // Store token in localStorage
    if (data.access_token) {
      localStorage.setItem("parentToken", data.access_token);
    }
    
    return data;
  } catch (error) {
    // If error is already parsed, re-throw it
    if (error.type) {
      throw error;
    }
    // Parse network errors
    const parsedError = await parseError(null, error);
    throw parsedError;
  }
}

/**
 * Fetch parent statistics including child performance and class comparisons
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Stats object with child and comparison data
 * @throws {Error} If stats fetch fails or token is invalid
 */
export async function fetchParentStats(token) {
  // Check network connectivity
  if (!isOnline()) {
    const error = await parseError(null, new Error('No internet connection'));
    handleError(error, { redirectOnAuth: false });
    throw error;
  }

  try {
    const res = await fetch(`${API_URL}/parents/stats`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!res.ok) {
      const error = await parseError(res, null);
      // Handle 401 errors with automatic redirect
      if (res.status === 401) {
        handleError(error, { redirectOnAuth: true });
      }
      throw error;
    }

    return await res.json();
  } catch (error) {
    // If error is already parsed, re-throw it
    if (error.type) {
      throw error;
    }
    // Parse network errors
    const parsedError = await parseError(null, error);
    throw parsedError;
  }
}

/**
 * Send parent feedback to be stored with student
 * @param {string} feedback - Feedback message text
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Feedback confirmation response
 * @throws {Error} If feedback submission fails
 */
export async function sendParentFeedback(feedback, token) {
  // Check network connectivity
  if (!isOnline()) {
    const error = await parseError(null, new Error('No internet connection'));
    handleError(error, { redirectOnAuth: false });
    throw error;
  }

  try {
    const res = await fetch(`${API_URL}/parents/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ feedback }),
    });

    if (!res.ok) {
      const error = await parseError(res, null);
      // Handle 401 errors with automatic redirect
      if (res.status === 401) {
        handleError(error, { redirectOnAuth: true });
      }
      throw error;
    }

    return await res.json();
  } catch (error) {
    // If error is already parsed, re-throw it
    if (error.type) {
      throw error;
    }
    // Parse network errors
    const parsedError = await parseError(null, error);
    throw parsedError;
  }
}

/**
 * Get the stored parent token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export function getParentToken() {
  return localStorage.getItem("parentToken");
}

/**
 * Remove the parent token from localStorage
 */
export function clearParentToken() {
  localStorage.removeItem("parentToken");
}

/**
 * Generate and send email report to parent
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Report generation confirmation response
 * @throws {Error} If report generation fails
 */
export async function generateParentReport(token) {
  // Check network connectivity
  if (!isOnline()) {
    const error = await parseError(null, new Error('No internet connection'));
    handleError(error, { redirectOnAuth: false });
    throw error;
  }

  try {
    const res = await fetch(`${API_URL}/parent/generate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!res.ok) {
      const error = await parseError(res, null);
      // Handle 401 errors with automatic redirect
      if (res.status === 401) {
        handleError(error, { redirectOnAuth: true });
      }
      throw error;
    }

    return await res.json();
  } catch (error) {
    // If error is already parsed, re-throw it
    if (error.type) {
      throw error;
    }
    // Parse network errors
    const parsedError = await parseError(null, error);
    throw parsedError;
  }
}

/**
 * Check if parent is authenticated
 * @returns {boolean} True if token exists
 */
export function isParentAuthenticated() {
  return !!getParentToken();
}
