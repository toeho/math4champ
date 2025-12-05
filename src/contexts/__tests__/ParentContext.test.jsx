import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ParentProvider, useParent } from '../ParentContext';
import * as parentApi from '../../utils/parentApi';

// Mock the parentApi module
vi.mock('../../utils/parentApi', () => ({
  registerParent: vi.fn(),
  loginParent: vi.fn(),
  fetchParentStats: vi.fn(),
  sendParentFeedback: vi.fn(),
  getParentToken: vi.fn(),
  clearParentToken: vi.fn(),
}));

describe('ParentContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }) => <ParentProvider>{children}</ParentProvider>;

  describe('Initial state', () => {
    it('should initialize with null parent and loading true', () => {
      parentApi.getParentToken.mockReturnValue(null);

      const { result } = renderHook(() => useParent(), { wrapper });

      expect(result.current.parent).toBeNull();
      expect(result.current.stats).toBeNull();
    });

    it('should validate token on mount if token exists', async () => {
      const mockStats = {
        child: {
          username: 'student1',
          name: 'Jane Doe',
          class_level: 'Grade 5',
        },
      };

      parentApi.getParentToken.mockReturnValue('test-token');
      parentApi.fetchParentStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(parentApi.fetchParentStats).toHaveBeenCalledWith('test-token');
      expect(result.current.parent).toEqual({
        authenticated: true,
        student_username: 'student1',
      });
      expect(result.current.stats).toEqual(mockStats);
    });

    it('should clear token if validation fails', async () => {
      parentApi.getParentToken.mockReturnValue('invalid-token');
      parentApi.fetchParentStats.mockRejectedValue(new Error('Invalid token'));

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(parentApi.clearParentToken).toHaveBeenCalled();
      expect(result.current.parent).toBeNull();
    });
  });

  describe('register', () => {
    it('should successfully register a parent', async () => {
      const mockResponse = {
        id: 1,
        username: 'parent1',
        name: 'John Doe',
        student_username: 'student1',
      };

      parentApi.getParentToken.mockReturnValue(null);
      parentApi.registerParent.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register({
          username: 'parent1',
          password: 'password123',
          name: 'John Doe',
          student_username: 'student1',
        });
      });

      expect(registerResult).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('should handle registration failure', async () => {
      parentApi.getParentToken.mockReturnValue(null);
      parentApi.registerParent.mockRejectedValue(
        new Error('Username already exists')
      );

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register({
          username: 'parent1',
          password: 'password123',
          student_username: 'student1',
        });
      });

      expect(registerResult).toEqual({
        success: false,
        message: 'Username already exists',
      });
    });
  });

  describe('login', () => {
    it('should successfully login and fetch stats', async () => {
      const mockAuthResponse = {
        access_token: 'test-token-123',
        token_type: 'bearer',
      };

      const mockStats = {
        child: {
          username: 'student1',
          name: 'Jane Doe',
          class_level: 'Grade 5',
        },
      };

      parentApi.getParentToken.mockReturnValue(null);
      parentApi.loginParent.mockResolvedValue(mockAuthResponse);
      parentApi.fetchParentStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('parent1', 'password123');
      });

      expect(loginResult).toEqual({ success: true });
      expect(result.current.parent).toEqual({
        authenticated: true,
        username: 'parent1',
        student_username: 'student1',
      });
      expect(result.current.stats).toEqual(mockStats);
    });

    it('should handle login failure', async () => {
      parentApi.getParentToken.mockReturnValue(null);
      parentApi.loginParent.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('parent1', 'wrong');
      });

      expect(loginResult).toEqual({
        success: false,
        message: 'Invalid credentials',
      });
      expect(result.current.parent).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear parent data and token', async () => {
      const mockStats = {
        child: { username: 'student1' },
      };

      parentApi.getParentToken.mockReturnValue('test-token');
      parentApi.fetchParentStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.parent).not.toBeNull();
      });

      act(() => {
        result.current.logout();
      });

      expect(parentApi.clearParentToken).toHaveBeenCalled();
      expect(result.current.parent).toBeNull();
      expect(result.current.stats).toBeNull();
    });
  });

  describe('fetchStats', () => {
    it('should successfully fetch stats', async () => {
      const mockStats = {
        child: {
          username: 'student1',
          name: 'Jane Doe',
          total_attempts: 100,
          correct_attempts: 85,
          accuracy: 85.0,
        },
        comparison: {
          class_count: 30,
          avg_score: 750,
          rank: 5,
        },
      };

      parentApi.getParentToken.mockReturnValue('test-token');
      parentApi.fetchParentStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let fetchResult;
      await act(async () => {
        fetchResult = await result.current.fetchStats();
      });

      expect(fetchResult).toEqual({
        success: true,
        data: mockStats,
      });
      expect(result.current.stats).toEqual(mockStats);
    });

    it('should handle fetch failure without token', async () => {
      parentApi.getParentToken.mockReturnValue(null);

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let fetchResult;
      await act(async () => {
        fetchResult = await result.current.fetchStats();
      });

      expect(fetchResult).toEqual({
        success: false,
        message: 'Not authenticated',
      });
    });

    it('should handle token expiration', async () => {
      parentApi.getParentToken.mockReturnValue('expired-token');
      parentApi.fetchParentStats.mockRejectedValue(
        new Error('Session expired. Please login again.')
      );

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let fetchResult;
      await act(async () => {
        fetchResult = await result.current.fetchStats();
      });

      expect(fetchResult.success).toBe(false);
      expect(fetchResult.expired).toBe(true);
      expect(result.current.parent).toBeNull();
    });

    it('should set statsLoading during fetch', async () => {
      const mockStats = { child: { username: 'student1' } };

      parentApi.getParentToken.mockReturnValue('test-token');
      parentApi.fetchParentStats.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockStats), 100);
          })
      );

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.fetchStats();
      });

      expect(result.current.statsLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.statsLoading).toBe(false);
      });
    });
  });

  describe('sendFeedback', () => {
    it('should successfully send feedback', async () => {
      const mockResponse = {
        status: 'success',
        student_username: 'student1',
        Parent_feedback: 'Great progress!',
      };

      parentApi.getParentToken.mockReturnValue('test-token');
      parentApi.sendParentFeedback.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let feedbackResult;
      await act(async () => {
        feedbackResult = await result.current.sendFeedback('Great progress!');
      });

      expect(feedbackResult).toEqual({
        success: true,
        data: mockResponse,
      });
      expect(parentApi.sendParentFeedback).toHaveBeenCalledWith(
        'Great progress!',
        'test-token'
      );
    });

    it('should handle feedback failure without token', async () => {
      parentApi.getParentToken.mockReturnValue(null);

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let feedbackResult;
      await act(async () => {
        feedbackResult = await result.current.sendFeedback('Test feedback');
      });

      expect(feedbackResult).toEqual({
        success: false,
        message: 'Not authenticated',
      });
    });

    it('should handle token expiration during feedback', async () => {
      parentApi.getParentToken.mockReturnValue('expired-token');
      parentApi.sendParentFeedback.mockRejectedValue(
        new Error('Session expired. Please login again.')
      );

      const { result } = renderHook(() => useParent(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let feedbackResult;
      await act(async () => {
        feedbackResult = await result.current.sendFeedback('Test feedback');
      });

      expect(feedbackResult.success).toBe(false);
      expect(feedbackResult.expired).toBe(true);
      expect(result.current.parent).toBeNull();
    });
  });
});
