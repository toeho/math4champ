import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, AlertCircle } from 'lucide-react';
import { VoiceRecognition, requestMicrophonePermission, checkVoiceSupport } from '../../utils/voiceUtils';

/**
 * VoiceRecorder Component
 * Provides voice recording functionality with visual feedback, timer, and permission handling
 * 
 * @param {Function} onTranscript - Callback when transcription is available (transcript, isFinal)
 * @param {Function} onError - Callback when an error occurs
 * @param {Function} onRecordingStateChange - Callback when recording state changes (isRecording)
 */
export default function VoiceRecorder({ onTranscript, onError, onRecordingStateChange }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Check browser support on mount
  useEffect(() => {
    const support = checkVoiceSupport();
    if (!support.recognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update recording time
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Notify parent component of recording state changes
  useEffect(() => {
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecording);
    }
  }, [isRecording, onRecordingStateChange]);

  /**
   * Format time in MM:SS format
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Handle starting the recording
   */
  const handleStartRecording = async () => {
    // Reset error states
    setError(null);
    setPermissionDenied(false);

    // Check if supported
    if (!isSupported) {
      return;
    }

    try {
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      
      if (!hasPermission) {
        setPermissionDenied(true);
        setError('Microphone permission denied. Please enable microphone access in your browser settings.');
        if (onError) {
          onError('Microphone permission denied');
        }
        return;
      }

      // Create recognition instance
      recognitionRef.current = new VoiceRecognition();

      // Start recognition
      recognitionRef.current.start(
        (transcript, isFinal) => {
          if (onTranscript) {
            onTranscript(transcript, isFinal);
          }
        },
        (errorMessage) => {
          console.error('Recognition error:', errorMessage);
          setIsRecording(false);
          
          // Handle specific error types
          if (errorMessage === 'not-allowed' || errorMessage === 'permission-denied') {
            setPermissionDenied(true);
            setError('Microphone permission denied. Please enable microphone access in your browser settings.');
          } else if (errorMessage === 'no-speech') {
            setError('No speech detected. Please try again.');
          } else if (errorMessage === 'network') {
            setError('Network error. Please check your internet connection.');
          } else {
            setError(`Recording error: ${errorMessage}`);
          }
          
          if (onError) {
            onError(errorMessage);
          }
        }
      );

      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError(error.message || 'Failed to start recording');
      if (onError) {
        onError(error.message);
      }
    }
  };

  /**
   * Handle stopping the recording
   */
  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  /**
   * Handle canceling the recording
   */
  const handleCancelRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
    // Clear the transcript by sending empty string
    if (onTranscript) {
      onTranscript('', true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Error/Permission Messages */}
      {(error || permissionDenied) && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-sm">{error}</p>
            {permissionDenied && (
              <div className="mt-2 text-xs">
                <p className="font-semibold mb-1">To enable microphone access:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Click the lock icon in your browser's address bar</li>
                  <li>Find "Microphone" in the permissions list</li>
                  <li>Change the setting to "Allow"</li>
                  <li>Refresh the page and try again</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recording Timer */}
      {isRecording && (
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-purple-700">
            {formatTime(recordingTime)}
          </div>
          <p className="text-sm text-gray-600 mt-1">Recording...</p>
        </div>
      )}

      {/* Microphone Button */}
      <div className="relative">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!isSupported}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-lg
            focus:outline-none focus:ring-4 focus:ring-purple-300
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-purple-600 hover:bg-purple-700'
            }
          `}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          aria-pressed={isRecording}
        >
          {isRecording ? (
            <MicOff className="w-10 h-10 text-white" aria-hidden="true" />
          ) : (
            <Mic className="w-10 h-10 text-white" aria-hidden="true" />
          )}
        </button>

        {/* Pulsing ring animation when recording */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75" />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isRecording && (
          <>
            <button
              onClick={handleStopRecording}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg
                       font-medium transition-colors shadow-md
                       focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Stop recording"
            >
              Stop
            </button>
            <button
              onClick={handleCancelRecording}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg
                       font-medium transition-colors shadow-md flex items-center gap-2
                       focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Cancel recording"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!isRecording && !error && (
        <p className="text-sm text-gray-600 text-center max-w-xs">
          {isSupported 
            ? 'Click the microphone button to start recording your message'
            : 'Voice recording is not supported in your browser'
          }
        </p>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isRecording && `Recording in progress. Duration: ${formatTime(recordingTime)}`}
        {error && `Error: ${error}`}
      </div>
    </div>
  );
}
