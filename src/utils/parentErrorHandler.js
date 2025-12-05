/**
 * Parent Portal Error Handling Utilities
 * Provides consistent error handling, notifications, and recovery mechanisms
 */

// Error notification queue for displaying to users
let notificationCallback = null;

/**
 * Register a callback function to display notifications
 * @param {Function} callback - Function that receives (message, type, duration)
 */
export function registerNotificationHandler(callback) {
  notificationCallback = callback;
}

/**
 * Display a notification to the user
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export function showNotification(message, type = 'info', duration = 5000) {
  if (notificationCallback) {
    notificationCallback(message, type, duration);
  } else {
    // Fallback to console if no handler registered
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

/**
 * Error types for categorization
 */
export const ErrorType = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  VALIDATION: 'validation',
  NETWORK: 'network',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

/**
 * Parse error response and categorize
 * @param {Response} response - Fetch response object
 * @param {Error} error - Error object
 * @returns {Object} Parsed error with type and message
 */
export async function parseError(response, error) {
  let errorType = ErrorType.UNKNOWN;
  let message = 'An unexpected error occurred';

  if (response) {
    // HTTP status-based error categorization
    switch (response.status) {
      case 401:
        errorType = ErrorType.AUTHENTICATION;
        message = 'Session expired. Please login again.';
        break;
      case 403:
        errorType = ErrorType.AUTHORIZATION;
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorType = ErrorType.NOT_FOUND;
        message = 'The requested resource was not found.';
        break;
      case 422:
        errorType = ErrorType.VALIDATION;
        try {
          const data = await response.json();
          message = data.detail || 'Validation error. Please check your input.';
        } catch {
          message = 'Validation error. Please check your input.';
        }
        break;
      case 500:
      case 502:
      case 503:
        errorType = ErrorType.SERVER;
        message = 'Server error. Please try again later.';
        break;
      default:
        try {
          const data = await response.json();
          message = data.detail || data.message || message;
        } catch {
          // Keep default message
        }
    }
  } else if (error) {
    // Network or other errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      errorType = ErrorType.NETWORK;
      message = 'Network error. Please check your internet connection.';
    } else {
      message = error.message || message;
    }
  }

  return { type: errorType, message };
}

/**
 * Handle API errors with automatic recovery actions
 * @param {Object} error - Parsed error object
 * @param {Object} options - Recovery options
 */
export function handleError(error, options = {}) {
  const { 
    showNotificationFlag = true, 
    redirectOnAuth = true,
    logError = true 
  } = options;

  // Log error for debugging
  if (logError) {
    console.error('Parent Portal Error:', error);
  }

  // Handle authentication errors
  if (error.type === ErrorType.AUTHENTICATION && redirectOnAuth) {
    localStorage.removeItem('parentToken');
    showNotification(error.message, 'error', 3000);
    setTimeout(() => {
      window.location.href = '/parent/login';
    }, 1000);
    return;
  }

  // Handle not found errors
  if (error.type === ErrorType.NOT_FOUND) {
    if (showNotificationFlag) {
      showNotification(error.message, 'warning');
    }
    return;
  }

  // Handle network errors
  if (error.type === ErrorType.NETWORK) {
    if (showNotificationFlag) {
      showNotification(error.message, 'error');
    }
    // Could add offline indicator here
    return;
  }

  // Handle all other errors
  if (showNotificationFlag) {
    showNotification(error.message, 'error');
  }
}

/**
 * Wrapper function for API calls with consistent error handling
 * @param {Function} apiFunction - API function to call
 * @param {Object} options - Error handling options
 * @returns {Promise} API call result or throws error
 */
export async function handleApiCall(apiFunction, options = {}) {
  const {
    showLoading = false,
    showSuccess = false,
    successMessage = 'Operation completed successfully',
    onError = null,
    ...errorOptions
  } = options;

  try {
    if (showLoading) {
      showNotification('Loading...', 'info', 0);
    }

    const result = await apiFunction();

    if (showSuccess) {
      showNotification(successMessage, 'success', 3000);
    }

    return result;
  } catch (error) {
    // Parse and handle the error
    const parsedError = await parseError(error.response, error);
    
    // Call custom error handler if provided
    if (onError) {
      onError(parsedError);
    } else {
      handleError(parsedError, errorOptions);
    }

    throw parsedError;
  }
}

/**
 * Retry an API call with exponential backoff
 * @param {Function} apiFunction - API function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise} API call result
 */
export async function retryApiCall(apiFunction, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      lastError = error;

      // Don't retry on authentication or validation errors
      if (error.type === ErrorType.AUTHENTICATION || 
          error.type === ErrorType.VALIDATION) {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      showNotification(`Retrying... (${attempt + 1}/${maxRetries})`, 'info', 2000);
    }
  }

  throw lastError;
}

/**
 * Check if the user is online
 * @returns {boolean} True if online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Setup online/offline event listeners
 * @param {Function} onOnline - Callback when coming online
 * @param {Function} onOffline - Callback when going offline
 */
export function setupNetworkListeners(onOnline, onOffline) {
  window.addEventListener('online', () => {
    showNotification('Connection restored', 'success', 3000);
    if (onOnline) onOnline();
  });

  window.addEventListener('offline', () => {
    showNotification('No internet connection', 'error', 0);
    if (onOffline) onOffline();
  });
}

/**
 * Validate response before processing
 * @param {Response} response - Fetch response
 * @returns {Promise<Response>} Validated response
 * @throws {Error} If response is not ok
 */
export async function validateResponse(response) {
  if (!response.ok) {
    const error = await parseError(response, null);
    throw error;
  }
  return response;
}
