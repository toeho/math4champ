import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

// Mock Web Speech API
global.SpeechRecognition = vi.fn();
global.webkitSpeechRecognition = vi.fn();
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  paused: false,
};
global.SpeechSynthesisUtterance = vi.fn();

// Mock navigator.mediaDevices
global.navigator.mediaDevices = {
  getUserMedia: vi.fn(),
};

// Mock navigator.permissions
global.navigator.permissions = {
  query: vi.fn(),
};
