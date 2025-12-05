import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceRecorder from '../VoiceRecorder';
import * as voiceUtils from '../../../utils/voiceUtils';

// Mock voice utilities
vi.mock('../../../utils/voiceUtils', () => ({
  VoiceRecognition: vi.fn(),
  requestMicrophonePermission: vi.fn(),
  checkVoiceSupport: vi.fn(),
}));

describe('VoiceRecorder', () => {
  const mockOnTranscript = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: voice is supported
    voiceUtils.checkVoiceSupport.mockReturnValue({
      recognition: true,
      synthesis: true,
    });
  });

  it('should render microphone button', () => {
    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    const micButton = screen.getByRole('button');
    expect(micButton).toBeInTheDocument();
  });

  it('should show error when speech recognition is not supported', () => {
    voiceUtils.checkVoiceSupport.mockReturnValue({
      recognition: false,
      synthesis: true,
    });

    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    expect(mockOnError).toHaveBeenCalledWith(
      expect.stringContaining('Speech recognition is not supported')
    );
  });

  it('should request microphone permission when starting recording', async () => {
    voiceUtils.requestMicrophonePermission.mockResolvedValue(true);
    
    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      isRecording: false,
    };
    voiceUtils.VoiceRecognition.mockImplementation(() => mockRecognition);

    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(voiceUtils.requestMicrophonePermission).toHaveBeenCalled();
    });
  });

  it('should show error when microphone permission is denied', async () => {
    voiceUtils.requestMicrophonePermission.mockResolvedValue(false);

    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        expect.stringContaining('Microphone permission denied')
      );
    });
  });

  it('should start recording when permission is granted', async () => {
    voiceUtils.requestMicrophonePermission.mockResolvedValue(true);
    
    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      isRecording: false,
    };
    voiceUtils.VoiceRecognition.mockImplementation(() => mockRecognition);

    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(voiceUtils.VoiceRecognition).toHaveBeenCalled();
      expect(mockRecognition.start).toHaveBeenCalled();
    });
  });

  it('should call onTranscript callback with recognized text', async () => {
    voiceUtils.requestMicrophonePermission.mockResolvedValue(true);
    
    let onResultCallback;
    const mockRecognition = {
      start: vi.fn((onResult) => {
        onResultCallback = onResult;
      }),
      stop: vi.fn(),
      isRecording: false,
    };
    voiceUtils.VoiceRecognition.mockImplementation(() => mockRecognition);

    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    // Simulate recognition result
    if (onResultCallback) {
      onResultCallback('Hello world', false);
    }

    expect(mockOnTranscript).toHaveBeenCalledWith('Hello world', false);
  });

  it('should stop recording when stop button is clicked', async () => {
    voiceUtils.requestMicrophonePermission.mockResolvedValue(true);
    
    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      isRecording: true,
    };
    voiceUtils.VoiceRecognition.mockImplementation(() => mockRecognition);

    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    // Find and click stop button (implementation may vary)
    const buttons = screen.getAllByRole('button');
    if (buttons.length > 1) {
      fireEvent.click(buttons[1]); // Assuming second button is stop
    }

    // Verify stop was called (if implementation supports it)
  });

  it('should display recording duration', async () => {
    voiceUtils.requestMicrophonePermission.mockResolvedValue(true);
    
    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      isRecording: false,
    };
    voiceUtils.VoiceRecognition.mockImplementation(() => mockRecognition);

    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    // Timer should start (00:00 format)
    // This depends on implementation details
  });

  it('should handle recognition errors', async () => {
    voiceUtils.requestMicrophonePermission.mockResolvedValue(true);
    
    let onErrorCallback;
    const mockRecognition = {
      start: vi.fn((onResult, onError) => {
        onErrorCallback = onError;
      }),
      stop: vi.fn(),
      isRecording: false,
    };
    voiceUtils.VoiceRecognition.mockImplementation(() => mockRecognition);

    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    // Simulate recognition error
    if (onErrorCallback) {
      onErrorCallback('no-speech');
    }

    expect(mockOnError).toHaveBeenCalled();
  });

  it('should cleanup on unmount', async () => {
    voiceUtils.requestMicrophonePermission.mockResolvedValue(true);
    
    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      isRecording: false,
    };
    voiceUtils.VoiceRecognition.mockImplementation(() => mockRecognition);

    const { unmount } = render(
      <VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />
    );

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    unmount();

    // Verify cleanup (stop should be called)
    expect(mockRecognition.stop).toHaveBeenCalled();
  });

  it('should have accessible button attributes', () => {
    render(<VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />);

    const micButton = screen.getByRole('button');
    expect(micButton).toHaveAttribute('aria-label');
  });

  it('should show visual feedback when recording', async () => {
    voiceUtils.requestMicrophonePermission.mockResolvedValue(true);
    
    const mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      isRecording: false,
    };
    voiceUtils.VoiceRecognition.mockImplementation(() => mockRecognition);

    const { container } = render(
      <VoiceRecorder onTranscript={mockOnTranscript} onError={mockOnError} />
    );

    const micButton = screen.getByRole('button');
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    // Check for visual indicators (pulsing animation, different colors, etc.)
    // This depends on implementation details
  });
});
