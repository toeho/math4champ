import { useState, useEffect, useRef } from 'react';
import { Send, Edit2, Mic, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import VoiceRecorder from '../../components/parent/VoiceRecorder';
import VoicePlayer from '../../components/parent/VoicePlayer';
import { useParent } from '../../contexts/ParentContext';
import { useNavigate } from 'react-router-dom';
import { checkVoiceSupport } from '../../utils/voiceUtils';

/**
 * ParentVoiceAssistant Page
 * Allows parents to send voice messages that are converted to text
 * Receives responses that are converted to speech for playback
 * Includes manual text input as fallback and editing capabilities
 */
export default function ParentVoiceAssistant() {
  const { sendFeedback } = useParent();
  const navigate = useNavigate();

  const [transcript, setTranscript] = useState('');
  const [editedTranscript, setEditedTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [useManualInput, setUseManualInput] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [ttsError, setTtsError] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);

  const textareaRef = useRef(null);
  const messageHistoryRef = useRef(null);
  const voiceSupport = checkVoiceSupport();

  // Character limit for feedback
  const MAX_CHARACTERS = 1000;

  // Auto-focus textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-scroll to latest message when message history updates
  useEffect(() => {
    if (messageHistoryRef.current && messageHistory.length > 0) {
      messageHistoryRef.current.scrollTop = messageHistoryRef.current.scrollHeight;
    }
  }, [messageHistory]);

  /**
   * Handle transcript updates from VoiceRecorder
   */
  const handleTranscript = (text, isFinal) => {
    setTranscript(text);

    // When final, set as edited transcript and enable editing
    if (isFinal) {
      setEditedTranscript(text);
      setIsEditing(true);
    }
  };

  /**
   * Handle recording errors
   */
  const handleRecordingError = (errorMessage) => {
    console.error('Recording error:', errorMessage);
    setError(`Recording failed: ${errorMessage}`);
  };

  /**
   * Handle recording state changes
   */
  const handleRecordingStateChange = (recording) => {
    setIsRecording(recording);

    // Clear previous messages when starting new recording
    if (recording) {
      setError(null);
      setSuccess(false);
      setTranscript('');
      setEditedTranscript('');
      setIsEditing(false);
    }
  };

  /**
   * Handle manual text input changes
   */
  const handleManualInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setEditedTranscript(value);
    }
  };

  /**
   * Handle edited transcript changes
   */
  const handleEditChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTERS) {
      setEditedTranscript(value);
    }
  };

  /**
   * Toggle manual input mode
   */
  const handleToggleManualInput = () => {
    setUseManualInput(!useManualInput);
    setError(null);
    setSuccess(false);
    setTranscript('');
    setEditedTranscript('');
    setIsEditing(false);
  };

  /**
   * Send the feedback message
   */
  const handleSendFeedback = async () => {
    const messageToSend = editedTranscript.trim();

    if (!messageToSend) {
      setError('Please enter a message before sending');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);
    setResponseText('');
    setTtsError(false);

    try {
      const result = await sendFeedback(messageToSend);

      if (result.success) {
        setSuccess(true);
        
        // Add message to history
        const newMessage = {
          id: Date.now(),
          text: messageToSend,
          timestamp: new Date(),
          type: 'sent'
        };
        setMessageHistory(prev => [...prev, newMessage]);

        // Extract response text from API response
        let responseMessage = 'Feedback received successfully.';
        
        if (result.data) {
          // Check various possible response formats
          if (result.data.message) {
            responseMessage = result.data.message;
          } else if (result.data.status) {
            responseMessage = `${result.data.status}. Your feedback has been recorded.`;
          } else if (result.data.Parent_feedback) {
            responseMessage = `Feedback recorded: "${result.data.Parent_feedback}"`;
          }
        }

        // Set response text for TTS and display
        setResponseText(responseMessage);

        // Add response to history
        const responseHistoryItem = {
          id: Date.now() + 1,
          text: responseMessage,
          timestamp: new Date(),
          type: 'received'
        };
        setMessageHistory(prev => [...prev, responseHistoryItem]);

        // Clear input fields
        setTranscript('');
        setEditedTranscript('');
        setIsEditing(false);

        // Check if TTS is supported
        if (!voiceSupport.synthesis) {
          setTtsError(true);
        }
      } else {
        if (result.expired) {
          // Session expired, redirect to login
          navigate('/parent/login');
        } else {
          setError(result.message || 'Failed to send feedback');
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle playback end
   */
  const handlePlaybackEnd = () => {
    // Optional: Add any cleanup or state updates after playback ends
    console.log('Playback completed');
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  /**
   * Get character count color based on usage
   */
  const getCharCountColor = () => {
    const length = editedTranscript.length;
    const percentage = (length / MAX_CHARACTERS) * 100;

    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Voice Assistant</h1>
        <p className="text-sm text-white/80">
          Send a voice message or type your feedback
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm flex-1">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && !responseText && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm flex-1">Feedback sent successfully!</p>
        </div>
      )}

      {/* Response Section with Text-to-Speech */}
      {responseText && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-semibold text-white">Response</h3>
          </div>

          {/* Text Response (fallback or always visible) */}
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-white text-sm">{responseText}</p>
          </div>

          {/* Voice Player for TTS */}
          {voiceSupport.synthesis && !ttsError ? (
            <div>
              <p className="text-xs text-white/70 mb-2">Listen to response:</p>
              <VoicePlayer 
                text={responseText} 
                autoPlay={true}
                onPlaybackEnd={handlePlaybackEnd}
              />
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs flex-1">
                Text-to-speech is not available in your browser. Please read the response above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Toggle between Voice and Manual Input */}
      <div className="flex justify-center">
        <button
          onClick={handleToggleManualInput}
          disabled={isRecording || isSending}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg
                   font-medium transition-colors text-sm
                   focus:outline-none focus:ring-2 focus:ring-white/50
                   disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={useManualInput ? "Switch to voice input" : "Switch to manual input"}
        >
          {useManualInput ? (
            <>
              <Mic className="w-4 h-4 inline mr-2" aria-hidden="true" />
              Switch to Voice Input
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 inline mr-2" aria-hidden="true" />
              Switch to Manual Input
            </>
          )}
        </button>
      </div>

      {/* Voice Recording Section */}
      {!useManualInput && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <VoiceRecorder
            onTranscript={handleTranscript}
            onError={handleRecordingError}
            onRecordingStateChange={handleRecordingStateChange}
          />
        </div>
      )}

      {/* Transcription Display / Manual Input */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Real-time Transcript (while recording) */}
        {isRecording && transcript && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="text-sm font-medium text-white">Transcribing...</p>
            </div>
            <p className="text-white/90 text-sm italic">{transcript}</p>
          </div>
        )}

        {/* Editable Transcript or Manual Input */}
        {(isEditing || useManualInput) && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label htmlFor="feedback-text" className="text-sm font-medium text-white">
                {useManualInput ? 'Your Message' : 'Edit Transcription'}
              </label>
              <span className={`text-xs font-medium ${getCharCountColor()}`}>
                {editedTranscript.length} / {MAX_CHARACTERS}
              </span>
            </div>

            <textarea
              id="feedback-text"
              ref={textareaRef}
              value={editedTranscript}
              onChange={useManualInput ? handleManualInputChange : handleEditChange}
              placeholder={useManualInput
                ? "Type your message here..."
                : "Edit the transcription before sending..."
              }
              className="w-full h-32 px-3 py-2 bg-white/20 text-white placeholder-white/50
                       border border-white/30 rounded-lg resize-none
                       focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              maxLength={MAX_CHARACTERS}
              aria-label="Feedback message"
            />

            {/* Send Button */}
            <button
              onClick={handleSendFeedback}
              disabled={!editedTranscript.trim() || isSending}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg
                       font-medium transition-colors shadow-md flex items-center justify-center gap-2
                       focus:outline-none focus:ring-2 focus:ring-purple-400
                       disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send feedback"
            >
              {isSending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" aria-hidden="true" />
                  Send Feedback
                </>
              )}
            </button>
          </div>
        )}

        {/* Initial State - No recording or manual input yet */}
        {!isRecording && !isEditing && !useManualInput && !transcript && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <p className="text-white/80 text-sm">
              Click the microphone button above to start recording your message,
              or switch to manual input to type your feedback.
            </p>
          </div>
        )}
      </div>

      {/* Message History */}
      {messageHistory.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Message History</h3>
          <div 
            ref={messageHistoryRef}
            className="space-y-2 max-h-48 overflow-y-auto scroll-smooth"
            role="log"
            aria-label="Message history"
            aria-live="polite"
          >
            {messageHistory.map((msg) => (
              <div
                key={msg.id}
                className={`
                  p-3 rounded-lg text-sm
                  ${msg.type === 'sent' 
                    ? 'bg-purple-600/50 text-white ml-4' 
                    : 'bg-white/20 text-white mr-4'
                  }
                `}
                role="article"
                aria-label={`${msg.type === 'sent' ? 'Sent' : 'Received'} message at ${formatTimestamp(msg.timestamp)}`}
              >
                <p className="text-xs opacity-70 mb-1">
                  {msg.type === 'sent' ? 'You' : 'System'} • {formatTimestamp(msg.timestamp)}
                </p>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-2">How to use:</h3>
        <ul className="text-xs text-white/80 space-y-1 list-disc list-inside">
          <li>Click the microphone to record your voice message</li>
          <li>Review and edit the transcription before sending</li>
          <li>Or switch to manual input to type your message</li>
          <li>Your feedback will be sent and you'll receive a voice response</li>
        </ul>
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isRecording && "Recording in progress"}
        {isSending && "Sending feedback"}
        {success && responseText && `Feedback sent successfully. Response: ${responseText}`}
        {success && !responseText && "Feedback sent successfully"}
        {error && `Error: ${error}`}
        {ttsError && "Text-to-speech not available. Please read the text response."}
      </div>
    </div>
  );
}
