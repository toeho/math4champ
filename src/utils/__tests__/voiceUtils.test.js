import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  VoiceRecognition,
  VoiceSynthesis,
  checkVoiceSupport,
  requestMicrophonePermission,
  checkMicrophonePermission,
} from '../voiceUtils';

describe('voiceUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('VoiceRecognition', () => {
    it('should create VoiceRecognition instance', () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: vi.fn(),
        stop: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };

      global.SpeechRecognition = vi.fn(() => mockRecognition);

      const recognition = new VoiceRecognition();

      expect(recognition).toBeDefined();
      expect(recognition.recognition.continuous).toBe(true);
      expect(recognition.recognition.interimResults).toBe(true);
      expect(recognition.recognition.lang).toBe('en-US');
    });

    it('should throw error when SpeechRecognition is not supported', () => {
      global.SpeechRecognition = undefined;
      global.webkitSpeechRecognition = undefined;

      expect(() => new VoiceRecognition()).toThrow(
        'Speech recognition not supported'
      );
    });

    it('should start recognition and call onResult callback', () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: vi.fn(),
        stop: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };

      global.SpeechRecognition = vi.fn(() => mockRecognition);

      const recognition = new VoiceRecognition();
      const onResult = vi.fn();
      const onError = vi.fn();

      recognition.start(onResult, onError);

      expect(mockRecognition.start).toHaveBeenCalled();
      expect(recognition.isRecording).toBe(true);

      // Simulate recognition result
      const mockEvent = {
        results: [
          [{ transcript: 'Hello world', confidence: 0.9 }],
        ],
      };
      mockEvent.results[0].isFinal = true;

      mockRecognition.onresult(mockEvent);

      expect(onResult).toHaveBeenCalledWith('Hello world', true);
    });

    it('should handle multiple results and concatenate transcripts', () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: vi.fn(),
        stop: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };

      global.SpeechRecognition = vi.fn(() => mockRecognition);

      const recognition = new VoiceRecognition();
      const onResult = vi.fn();

      recognition.start(onResult, vi.fn());

      const mockEvent = {
        results: [
          [{ transcript: 'Hello', confidence: 0.9 }],
          [{ transcript: ' world', confidence: 0.85 }],
        ],
      };
      mockEvent.results[1].isFinal = false;

      mockRecognition.onresult(mockEvent);

      expect(onResult).toHaveBeenCalledWith('Hello world', false);
    });

    it('should call onError callback on error', () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: vi.fn(),
        stop: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };

      global.SpeechRecognition = vi.fn(() => mockRecognition);

      const recognition = new VoiceRecognition();
      const onError = vi.fn();

      recognition.start(vi.fn(), onError);

      mockRecognition.onerror({ error: 'no-speech' });

      expect(onError).toHaveBeenCalledWith('no-speech');
      expect(recognition.isRecording).toBe(false);
    });

    it('should stop recognition', () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: vi.fn(),
        stop: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };

      global.SpeechRecognition = vi.fn(() => mockRecognition);

      const recognition = new VoiceRecognition();
      recognition.start(vi.fn(), vi.fn());
      recognition.stop();

      expect(mockRecognition.stop).toHaveBeenCalled();
      expect(recognition.isRecording).toBe(false);
    });

    it('should set language', () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: vi.fn(),
        stop: vi.fn(),
      };

      global.SpeechRecognition = vi.fn(() => mockRecognition);

      const recognition = new VoiceRecognition();
      recognition.setLanguage('es-ES');

      expect(recognition.recognition.lang).toBe('es-ES');
    });

    it('should not start if already recording', () => {
      const mockRecognition = {
        continuous: false,
        interimResults: false,
        lang: '',
        start: vi.fn(),
        stop: vi.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      };

      global.SpeechRecognition = vi.fn(() => mockRecognition);

      const recognition = new VoiceRecognition();
      recognition.start(vi.fn(), vi.fn());
      
      mockRecognition.start.mockClear();
      recognition.start(vi.fn(), vi.fn());

      expect(mockRecognition.start).not.toHaveBeenCalled();
    });
  });

  describe('VoiceSynthesis', () => {
    it('should create VoiceSynthesis instance', () => {
      const synthesis = new VoiceSynthesis();
      expect(synthesis).toBeDefined();
      expect(synthesis.synth).toBe(global.speechSynthesis);
    });

    it('should throw error when speechSynthesis is not supported', () => {
      const originalSynth = global.speechSynthesis;
      global.speechSynthesis = undefined;

      expect(() => new VoiceSynthesis()).toThrow(
        'Speech synthesis not supported'
      );

      global.speechSynthesis = originalSynth;
    });

    it('should speak text with default options', () => {
      const synthesis = new VoiceSynthesis();
      
      global.SpeechSynthesisUtterance = vi.fn(function(text) {
        this.text = text;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
        this.lang = 'en-US';
      });

      synthesis.speak('Hello world');

      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('Hello world');
      expect(global.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should speak text with custom options', () => {
      const synthesis = new VoiceSynthesis();
      const onEnd = vi.fn();
      const onError = vi.fn();
      const onStart = vi.fn();

      global.SpeechSynthesisUtterance = vi.fn(function(text) {
        this.text = text;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
        this.lang = 'en-US';
      });

      synthesis.speak('Hello', {
        rate: 1.5,
        pitch: 1.2,
        volume: 0.8,
        lang: 'es-ES',
        onEnd,
        onError,
        onStart,
      });

      expect(global.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should stop speech', () => {
      const synthesis = new VoiceSynthesis();
      global.speechSynthesis.speaking = true;

      synthesis.stop();

      expect(global.speechSynthesis.cancel).toHaveBeenCalled();
      expect(synthesis.currentUtterance).toBeNull();
    });

    it('should pause speech', () => {
      const synthesis = new VoiceSynthesis();
      global.speechSynthesis.speaking = true;
      global.speechSynthesis.paused = false;

      synthesis.pause();

      expect(global.speechSynthesis.pause).toHaveBeenCalled();
    });

    it('should resume speech', () => {
      const synthesis = new VoiceSynthesis();
      global.speechSynthesis.paused = true;

      synthesis.resume();

      expect(global.speechSynthesis.resume).toHaveBeenCalled();
    });

    it('should get available voices', () => {
      const mockVoices = [
        { name: 'Voice 1', lang: 'en-US' },
        { name: 'Voice 2', lang: 'es-ES' },
      ];
      global.speechSynthesis.getVoices = vi.fn(() => mockVoices);

      const synthesis = new VoiceSynthesis();
      const voices = synthesis.getVoices();

      expect(voices).toEqual(mockVoices);
    });

    it('should check if speaking', () => {
      const synthesis = new VoiceSynthesis();
      global.speechSynthesis.speaking = true;

      expect(synthesis.isSpeaking()).toBe(true);

      global.speechSynthesis.speaking = false;
      expect(synthesis.isSpeaking()).toBe(false);
    });

    it('should check if paused', () => {
      const synthesis = new VoiceSynthesis();
      global.speechSynthesis.paused = true;

      expect(synthesis.isPaused()).toBe(true);

      global.speechSynthesis.paused = false;
      expect(synthesis.isPaused()).toBe(false);
    });
  });

  describe('checkVoiceSupport', () => {
    it('should return support status for both features', () => {
      global.SpeechRecognition = vi.fn();
      global.speechSynthesis = {};

      const support = checkVoiceSupport();

      expect(support).toEqual({
        recognition: true,
        synthesis: true,
      });
    });

    it('should return false when features are not supported', () => {
      global.SpeechRecognition = undefined;
      global.webkitSpeechRecognition = undefined;
      global.speechSynthesis = undefined;

      const support = checkVoiceSupport();

      expect(support).toEqual({
        recognition: false,
        synthesis: false,
      });
    });
  });

  describe('requestMicrophonePermission', () => {
    it('should request and grant microphone permission', async () => {
      const mockTrack = { stop: vi.fn() };
      const mockStream = { getTracks: vi.fn(() => [mockTrack]) };

      global.navigator.mediaDevices.getUserMedia = vi.fn(async () => mockStream);

      const result = await requestMicrophonePermission();

      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      });
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle permission denial', async () => {
      global.navigator.mediaDevices.getUserMedia = vi.fn(async () => {
        throw new Error('Permission denied');
      });

      const result = await requestMicrophonePermission();

      expect(result).toBe(false);
    });
  });

  describe('checkMicrophonePermission', () => {
    it('should check microphone permission status', async () => {
      const mockResult = { state: 'granted' };
      global.navigator.permissions.query = vi.fn(async () => mockResult);

      const result = await checkMicrophonePermission();

      expect(global.navigator.permissions.query).toHaveBeenCalledWith({
        name: 'microphone',
      });
      expect(result).toBe('granted');
    });

    it('should return prompt when permissions API is not supported', async () => {
      global.navigator.permissions = undefined;

      const result = await checkMicrophonePermission();

      expect(result).toBe('prompt');
    });

    it('should handle errors and return prompt', async () => {
      global.navigator.permissions.query = vi.fn(async () => {
        throw new Error('Query failed');
      });

      const result = await checkMicrophonePermission();

      expect(result).toBe('prompt');
    });
  });
});
