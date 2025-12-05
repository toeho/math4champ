/**
 * Voice Utilities for Parent Portal
 * Provides speech recognition (voice-to-text) and speech synthesis (text-to-voice)
 * using the Web Speech API
 */

/**
 * VoiceRecognition class for converting speech to text
 * Uses Web Speech API's SpeechRecognition interface
 */
export class VoiceRecognition {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error("Speech recognition not supported in this browser");
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US'; // Default language, can be configured
    this.isRecording = false;
  }

  /**
   * Start speech recognition
   * @param {Function} onResult - Callback for recognition results (transcript, isFinal)
   * @param {Function} onError - Callback for errors
   */
  start(onResult, onError) {
    if (this.isRecording) {
      console.warn("Recognition already in progress");
      return;
    }

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      const isFinal = event.results[event.results.length - 1].isFinal;
      onResult(transcript, isFinal);
    };
    
    this.recognition.onerror = (event) => {
      this.isRecording = false;
      if (onError) {
        onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isRecording = false;
    };
    
    try {
      this.recognition.start();
      this.isRecording = true;
    } catch (error) {
      this.isRecording = false;
      if (onError) {
        onError(error.message);
      }
    }
  }

  /**
   * Stop speech recognition
   */
  stop() {
    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  /**
   * Set the language for recognition
   * @param {string} lang - Language code (e.g., 'en-US', 'es-ES')
   */
  setLanguage(lang) {
    this.recognition.lang = lang;
  }

  /**
   * Check if currently recording
   * @returns {boolean}
   */
  getIsRecording() {
    return this.isRecording;
  }
}

/**
 * VoiceSynthesis class for converting text to speech
 * Uses Web Speech API's SpeechSynthesis interface
 */
export class VoiceSynthesis {
  constructor() {
    if (!window.speechSynthesis) {
      throw new Error("Speech synthesis not supported in this browser");
    }
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
  }

  /**
   * Speak the given text
   * @param {string} text - Text to speak
   * @param {Object} options - Configuration options
   * @param {number} options.rate - Speech rate (0.1 to 10, default 1.0)
   * @param {number} options.pitch - Speech pitch (0 to 2, default 1.0)
   * @param {number} options.volume - Speech volume (0 to 1, default 1.0)
   * @param {string} options.lang - Language code (default 'en-US')
   * @param {Function} options.onEnd - Callback when speech ends
   * @param {Function} options.onError - Callback for errors
   * @param {Function} options.onStart - Callback when speech starts
   */
  speak(text, options = {}) {
    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || 'en-US';
    
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }
    
    if (options.onError) {
      utterance.onerror = options.onError;
    }

    if (options.onStart) {
      utterance.onstart = options.onStart;
    }
    
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Stop current speech and clear queue
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Get available voices
   * @returns {Array} Array of available SpeechSynthesisVoice objects
   */
  getVoices() {
    return this.synth.getVoices();
  }

  /**
   * Check if currently speaking
   * @returns {boolean}
   */
  isSpeaking() {
    return this.synth.speaking;
  }

  /**
   * Check if currently paused
   * @returns {boolean}
   */
  isPaused() {
    return this.synth.paused;
  }
}

/**
 * Check browser support for voice features
 * @returns {Object} Object with recognition and synthesis support flags
 */
export function checkVoiceSupport() {
  return {
    recognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    synthesis: !!window.speechSynthesis
  };
}

/**
 * Request microphone permission from the user
 * @returns {Promise<boolean>} True if permission granted, false otherwise
 */
export async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks immediately after getting permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error("Microphone permission denied:", error);
    return false;
  }
}

/**
 * Check if microphone permission is already granted
 * @returns {Promise<string>} Permission state: 'granted', 'denied', or 'prompt'
 */
export async function checkMicrophonePermission() {
  try {
    if (!navigator.permissions) {
      // Permissions API not supported, try to request access
      return 'prompt';
    }
    
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state;
  } catch (error) {
    console.error("Error checking microphone permission:", error);
    return 'prompt';
  }
}
