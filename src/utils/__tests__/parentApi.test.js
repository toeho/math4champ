import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerParent,
  loginParent,
  fetchParentStats,
  sendParentFeedback,
  getParentToken,
  clearParentToken,
  isParentAuthenticated,
} from '../parentApi';

// Mock fetch globally
global.fetch = vi.fn();

describe('parentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('registerParent', () => {
    it('should successfully register a parent', async () => {
      const mockResponse = {
        id: 1,
        username: 'parent1',
        name: 'John Doe',
        phone_number: '+1234567890',
        student_username: 'student1',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const data = {
        username: 'parent1',
        password: 'password123',
        name: 'John Doe',
        phone_number: '+1234567890',
        student_username: 'student1',
      };

      const result = await registerParent(data);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/parents/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when registration fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Username already exists' }),
      });

      await expect(
        registerParent({
          username: 'parent1',
          password: 'password123',
          student_username: 'student1',
        })
      ).rejects.toThrow('Username already exists');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        registerParent({
          username: 'parent1',
          password: 'password123',
          student_username: 'student1',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('loginParent', () => {
    it('should successfully login and store token', async () => {
      const mockResponse = {
        access_token: 'test-token-123',
        token_type: 'bearer',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await loginParent({
        username: 'parent1',
        password: 'password123',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/parents/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'parent1',
            password: 'password123',
          }),
        }
      );
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('parentToken')).toBe('test-token-123');
    });

    it('should throw error for invalid credentials', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid credentials' }),
      });

      await expect(
        loginParent({ username: 'parent1', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('fetchParentStats', () => {
    it('should successfully fetch parent stats', async () => {
      const mockStats = {
        child: {
          username: 'student1',
          name: 'Jane Doe',
          class_level: 'Grade 5',
          level: 3,
          total_attempts: 100,
          correct_attempts: 85,
          accuracy: 85.0,
          score: 850,
          current_streak: 5,
          max_streak: 10,
        },
        comparison: {
          class_count: 30,
          avg_score: 750,
          avg_accuracy: 75.0,
          top_score: 950,
          rank: 5,
          percentile: 83.3,
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const result = await fetchParentStats('test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/parents/stats',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockStats);
    });

    it('should handle 401 error and clear token', async () => {
      localStorage.setItem('parentToken', 'expired-token');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Token expired' }),
      });

      await expect(fetchParentStats('expired-token')).rejects.toThrow(
        'Session expired'
      );
      expect(localStorage.getItem('parentToken')).toBeNull();
    });

    it('should handle other errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Server error' }),
      });

      await expect(fetchParentStats('test-token')).rejects.toThrow(
        'Server error'
      );
    });
  });

  describe('sendParentFeedback', () => {
    it('should successfully send feedback', async () => {
      const mockResponse = {
        status: 'success',
        student_username: 'student1',
        Parent_feedback: 'Great progress!',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sendParentFeedback('Great progress!', 'test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/parents/feedback',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          body: JSON.stringify({ feedback: 'Great progress!' }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle 401 error and clear token', async () => {
      localStorage.setItem('parentToken', 'expired-token');

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Token expired' }),
      });

      await expect(
        sendParentFeedback('Test feedback', 'expired-token')
      ).rejects.toThrow('Session expired');
      expect(localStorage.getItem('parentToken')).toBeNull();
    });
  });

  describe('Token management functions', () => {
    it('should get parent token from localStorage', () => {
      localStorage.setItem('parentToken', 'test-token');
      expect(getParentToken()).toBe('test-token');
    });

    it('should return null when no token exists', () => {
      expect(getParentToken()).toBeNull();
    });

    it('should clear parent token', () => {
      localStorage.setItem('parentToken', 'test-token');
      clearParentToken();
      expect(localStorage.getItem('parentToken')).toBeNull();
    });

    it('should check if parent is authenticated', () => {
      expect(isParentAuthenticated()).toBe(false);

      localStorage.setItem('parentToken', 'test-token');
      expect(isParentAuthenticated()).toBe(true);
    });
  });
});
