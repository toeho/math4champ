import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerNotificationHandler,
  showNotification,
  ErrorType,
  parseError,
  handleError,
  handleApiCall,
  retryApiCall,
  isOnline,
  setupNetworkListeners,
  validateResponse,
} from '../parentErrorHandler';

describe('parentErrorHandler', () => {
  let notificationSpy;

  beforeEach(() => {
    // Reset notification handler
    notificationSpy = vi.fn();
    registerNotificationHandler(notificationSpy);
    
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    // Mock window.location
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('registerNotificationHandler', () => {
    it('should register a notification callback', () => {
      const callback = vi.fn();
      registerNotificationHandler(callback);
      showNotification('Test message', 'info');
      expect(callback).toHaveBeenCalledWith('Test message', 'info', 5000);
    });
  });

  describe('showNotification', () => {
    it('should call registered notification handler with correct parameters', () => {
      showNotification('Test message', 'success', 3000);
      expect(notificationSpy).toHaveBeenCalledWith('Test message', 'success', 3000);
    });

    it('should use default values when not provided', () => {
      showNotification('Test message');
      expect(notificationSpy).toHaveBeenCalledWith('Test message', 'info', 5000);
    });

    it('should fallback to console.log when no handler is registered', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      registerNotificationHandler(null);
      showNotification('Test message', 'error');
      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test message');
      consoleSpy.mockRestore();
    });
  });

  describe('parseError', () => {
    it('should parse 401 authentication error', async () => {
      const response = {
        status: 401,
        json: vi.fn().mockResolvedValue({ detail: 'Unauthorized' }),
      };
      const error = await parseError(response, null);
      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.message).toBe('Session expired. Please login again.');
    });

    it('should parse 403 authorization error', async () => {
      const response = {
        status: 403,
        json: vi.fn().mockResolvedValue({ detail: 'Forbidden' }),
      };
      const error = await parseError(response, null);
      expect(error.type).toBe(ErrorType.AUTHORIZATION);
      expect(error.message).toBe('You do not have permission to perform this action.');
    });

    it('should parse 404 not found error', async () => {
      const response = {
        status: 404,
        json: vi.fn().mockResolvedValue({ detail: 'Not found' }),
      };
      const error = await parseError(response, null);
      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.message).toBe('The requested resource was not found.');
    });

    it('should parse 422 validation error with detail', async () => {
      const response = {
        status: 422,
        json: vi.fn().mockResolvedValue({ detail: 'Invalid student username' }),
      };
      const error = await parseError(response, null);
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.message).toBe('Invalid student username');
    });

    it('should parse 500 server error', async () => {
      const response = {
        status: 500,
        json: vi.fn().mockResolvedValue({ detail: 'Internal server error' }),
      };
      const error = await parseError(response, null);
      expect(error.type).toBe(ErrorType.SERVER);
      expect(error.message).toBe('Server error. Please try again later.');
    });

    it('should parse network error from error object', async () => {
      const error = new Error('fetch failed');
      const parsedError = await parseError(null, error);
      expect(parsedError.type).toBe(ErrorType.NETWORK);
      expect(parsedError.message).toBe('Network error. Please check your internet connection.');
    });

    it('should handle unknown errors', async () => {
      const error = new Error('Unknown error');
      const parsedError = await parseError(null, error);
      expect(parsedError.type).toBe(ErrorType.UNKNOWN);
      expect(parsedError.message).toBe('Unknown error');
    });
  });

  describe('handleError', () => {
    it('should redirect to login on authentication error', () => {
      vi.useFakeTimers();
      const error = { type: ErrorType.AUTHENTICATION, message: 'Session expired' };
      handleError(error, { redirectOnAuth: true });
      
      expect(notificationSpy).toHaveBeenCalledWith('Session expired', 'error', 3000);
      expect(localStorage.removeItem).toHaveBeenCalledWith('parentToken');
      
      vi.advanceTimersByTime(1000);
      expect(window.location.href).toBe('/parent/login');
      vi.useRealTimers();
    });

    it('should not redirect when redirectOnAuth is false', () => {
      const error = { type: ErrorType.AUTHENTICATION, message: 'Session expired' };
      handleError(error, { redirectOnAuth: false });
      
      expect(localStorage.removeItem).not.toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });

    it('should show warning notification for not found errors', () => {
      const error = { type: ErrorType.NOT_FOUND, message: 'Resource not found' };
      handleError(error);
      
      expect(notificationSpy).toHaveBeenCalledWith('Resource not found', 'warning', 5000);
    });

    it('should show error notification for network errors', () => {
      const error = { type: ErrorType.NETWORK, message: 'Network error' };
      handleError(error);
      
      expect(notificationSpy).toHaveBeenCalledWith('Network error', 'error', 5000);
    });

    it('should not show notification when showNotificationFlag is false', () => {
      const error = { type: ErrorType.NETWORK, message: 'Network error' };
      handleError(error, { showNotificationFlag: false });
      
      expect(notificationSpy).not.toHaveBeenCalled();
    });

    it('should log error when logError is true', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = { type: ErrorType.UNKNOWN, message: 'Unknown error' };
      handleError(error, { logError: true });
      
      expect(consoleSpy).toHaveBeenCalledWith('Parent Portal Error:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('handleApiCall', () => {
    it('should execute API function and return result', async () => {
      const apiFunction = vi.fn().mockResolvedValue({ data: 'success' });
      const result = await handleApiCall(apiFunction);
      
      expect(result).toEqual({ data: 'success' });
      expect(apiFunction).toHaveBeenCalled();
    });

    it('should show success notification when showSuccess is true', async () => {
      const apiFunction = vi.fn().mockResolvedValue({ data: 'success' });
      await handleApiCall(apiFunction, { showSuccess: true, successMessage: 'Done!' });
      
      expect(notificationSpy).toHaveBeenCalledWith('Done!', 'success', 3000);
    });

    it('should handle errors and call custom error handler', async () => {
      const apiFunction = vi.fn().mockRejectedValue({
        response: { status: 404 },
      });
      const onError = vi.fn();
      
      await expect(handleApiCall(apiFunction, { onError })).rejects.toThrow();
      expect(onError).toHaveBeenCalled();
    });

    it('should handle errors with default error handler', async () => {
      const apiFunction = vi.fn().mockRejectedValue({
        response: { status: 500 },
      });
      
      await expect(handleApiCall(apiFunction)).rejects.toThrow();
      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  describe('retryApiCall', () => {
    it('should succeed on first attempt', async () => {
      const apiFunction = vi.fn().mockResolvedValue({ data: 'success' });
      const result = await retryApiCall(apiFunction, 3, 100);
      
      expect(result).toEqual({ data: 'success' });
      expect(apiFunction).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      vi.useFakeTimers();
      const apiFunction = vi.fn()
        .mockRejectedValueOnce({ type: ErrorType.NETWORK, message: 'Network error' })
        .mockResolvedValueOnce({ data: 'success' });
      
      const promise = retryApiCall(apiFunction, 3, 100);
      
      // Fast-forward through retry delays
      await vi.advanceTimersByTimeAsync(100);
      
      const result = await promise;
      expect(result).toEqual({ data: 'success' });
      expect(apiFunction).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it('should not retry on authentication errors', async () => {
      const apiFunction = vi.fn().mockRejectedValue({
        type: ErrorType.AUTHENTICATION,
        message: 'Unauthorized',
      });
      
      await expect(retryApiCall(apiFunction, 3, 100)).rejects.toThrow();
      expect(apiFunction).toHaveBeenCalledTimes(1);
    });

    it('should not retry on validation errors', async () => {
      const apiFunction = vi.fn().mockRejectedValue({
        type: ErrorType.VALIDATION,
        message: 'Invalid input',
      });
      
      await expect(retryApiCall(apiFunction, 3, 100)).rejects.toThrow();
      expect(apiFunction).toHaveBeenCalledTimes(1);
    });

    it('should throw error after max retries', async () => {
      vi.useFakeTimers();
      const apiFunction = vi.fn().mockRejectedValue({
        type: ErrorType.NETWORK,
        message: 'Network error',
      });
      
      const promise = retryApiCall(apiFunction, 2, 100);
      
      // Fast-forward through all retry delays
      await vi.advanceTimersByTimeAsync(500);
      
      await expect(promise).rejects.toThrow();
      expect(apiFunction).toHaveBeenCalledTimes(3); // Initial + 2 retries
      vi.useRealTimers();
    });
  });

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      expect(isOnline()).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      expect(isOnline()).toBe(false);
    });
  });

  describe('setupNetworkListeners', () => {
    it('should setup online and offline event listeners', () => {
      const onOnline = vi.fn();
      const onOffline = vi.fn();
      
      setupNetworkListeners(onOnline, onOffline);
      
      // Simulate online event
      window.dispatchEvent(new Event('online'));
      expect(onOnline).toHaveBeenCalled();
      expect(notificationSpy).toHaveBeenCalledWith('Connection restored', 'success', 3000);
      
      // Simulate offline event
      window.dispatchEvent(new Event('offline'));
      expect(onOffline).toHaveBeenCalled();
      expect(notificationSpy).toHaveBeenCalledWith('No internet connection', 'error', 0);
    });
  });

  describe('validateResponse', () => {
    it('should return response when ok is true', async () => {
      const response = {
        ok: true,
        status: 200,
      };
      const result = await validateResponse(response);
      expect(result).toBe(response);
    });

    it('should throw error when ok is false', async () => {
      const response = {
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ detail: 'Not found' }),
      };
      
      await expect(validateResponse(response)).rejects.toThrow();
    });
  });
});
