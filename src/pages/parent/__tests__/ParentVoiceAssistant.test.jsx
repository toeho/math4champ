import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ParentVoiceAssistant from '../ParentVoiceAssistant';
import { ParentContext } from '../../../contexts/ParentContext';
import * as voiceUtils from '../../../utils/voiceUtils';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock VoiceRecorder component
vi.mock('../../../components/parent/VoiceRecorder', () => ({
  default: ({ onTranscript, onRecordingStateChange }) => (
    <div data-testid="voice-recorder">
      <button
        onClick={() => {
          onRecordingStateChange(true);
          setTimeout(() => {
            onTranscript('Test feedback message', true);
            onRecordingStateChange(false);
          }, 100);
        }}
      >
        Start Recording
      </button>
    </div>
  ),
}));

// Mock VoicePlayer component
vi.mock('../../../components/parent/VoicePlayer', () => ({
  default: ({ text, autoPlay, onPlaybackEnd }) => (
    <div data-testid="voice-player">
      <p data-testid="player-text">{text}</p>
      <button onClick={onPlaybackEnd}>Play</button>
      {autoPlay && <span data-testid="auto-play">Auto-playing</span>}
    </div>
  ),
}));

describe('ParentVoiceAssistant - Text-to-Speech', () => {
  const mockSendFeedback = vi.fn();
  const mockContextValue = {
    sendFeedback: mockSendFeedback,
    parent: { username: 'testparent' },
    loading: false,
    stats: null,
    statsLoading: false,
  };

  const renderWithContext = (contextValue = mockContextValue) => {
    return render(
      <BrowserRouter>
        <ParentContext.Provider value={contextValue}>
          <ParentVoiceAssistant />
        </ParentContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock checkVoiceSupport to return true for synthesis
    vi.spyOn(voiceUtils, 'checkVoiceSupport').mockReturnValue({
      recognition: true,
      synthesis: true,
    });
  });

  it('should display response text after successful feedback submission', async () => {
    mockSendFeedback.mockResolvedValue({
      success: true,
      data: {
        status: 'Feedback received',
        message: 'Thank you for your feedback',
      },
    });

    renderWithContext();

    // Switch to manual input
    const manualInputButton = screen.getByRole('button', { name: /switch to manual input/i });
    fireEvent.click(manualInputButton);

    // Type feedback
    const textarea = screen.getByLabelText('Feedback message');
    fireEvent.change(textarea, { target: { value: 'This is my feedback' } });

    // Send feedback
    const sendButton = screen.getByRole('button', { name: /send feedback/i });
    fireEvent.click(sendButton);

    // Wait for response section to appear
    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument();
    });
    
    // Verify response text is displayed
    expect(screen.getAllByText(/Thank you for your feedback/i).length).toBeGreaterThan(0);
  });

  it('should integrate VoicePlayer component when TTS is supported', async () => {
    mockSendFeedback.mockResolvedValue({
      success: true,
      data: {
        message: 'Feedback recorded successfully',
      },
    });

    renderWithContext();

    // Switch to manual input and send feedback
    const manualInputButton = screen.getByRole('button', { name: /switch to manual input/i });
    fireEvent.click(manualInputButton);

    const textarea = screen.getByLabelText('Feedback message');
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    const sendButton = screen.getByRole('button', { name: /send feedback/i });
    fireEvent.click(sendButton);

    // Wait for VoicePlayer to appear
    await waitFor(() => {
      expect(screen.getByTestId('voice-player')).toBeInTheDocument();
    });

    // Verify VoicePlayer receives correct text
    expect(screen.getByTestId('player-text')).toHaveTextContent('Feedback recorded successfully');
    
    // Verify auto-play is enabled
    expect(screen.getByTestId('auto-play')).toBeInTheDocument();
  });

  it('should display fallback text when TTS is not supported', async () => {
    // Mock TTS as not supported
    vi.spyOn(voiceUtils, 'checkVoiceSupport').mockReturnValue({
      recognition: true,
      synthesis: false,
    });

    mockSendFeedback.mockResolvedValue({
      success: true,
      data: {
        message: 'Feedback received',
      },
    });

    renderWithContext();

    // Send feedback
    const manualInputButton = screen.getByRole('button', { name: /switch to manual input/i });
    fireEvent.click(manualInputButton);

    const textarea = screen.getByLabelText('Feedback message');
    fireEvent.change(textarea, { target: { value: 'Test' } });

    const sendButton = screen.getByRole('button', { name: /send feedback/i });
    fireEvent.click(sendButton);

    // Wait for fallback message
    await waitFor(() => {
      expect(screen.getByText(/Text-to-speech is not available/i)).toBeInTheDocument();
    });

    // Response text should still be visible (appears in multiple places)
    expect(screen.getAllByText('Feedback received').length).toBeGreaterThan(0);
  });

  it('should show visual indicator during playback', async () => {
    mockSendFeedback.mockResolvedValue({
      success: true,
      data: {
        message: 'Response message',
      },
    });

    renderWithContext();

    // Send feedback
    const manualInputButton = screen.getByRole('button', { name: /switch to manual input/i });
    fireEvent.click(manualInputButton);

    const textarea = screen.getByLabelText('Feedback message');
    fireEvent.change(textarea, { target: { value: 'Test' } });

    const sendButton = screen.getByRole('button', { name: /send feedback/i });
    fireEvent.click(sendButton);

    // Wait for response section
    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument();
    });

    // Verify visual elements are present
    expect(screen.getByTestId('voice-player')).toBeInTheDocument();
  });

  it('should add messages to history', async () => {
    mockSendFeedback.mockResolvedValue({
      success: true,
      data: {
        message: 'Feedback recorded',
      },
    });

    renderWithContext();

    // Send feedback
    const manualInputButton = screen.getByRole('button', { name: /switch to manual input/i });
    fireEvent.click(manualInputButton);

    const textarea = screen.getByLabelText('Feedback message');
    fireEvent.change(textarea, { target: { value: 'My feedback message' } });

    const sendButton = screen.getByRole('button', { name: /send feedback/i });
    fireEvent.click(sendButton);

    // Wait for message history to appear
    await waitFor(() => {
      expect(screen.getByText('Message History')).toBeInTheDocument();
    });

    // Verify sent message is in history
    expect(screen.getByText('My feedback message')).toBeInTheDocument();
    
    // Verify response is in history (appears in multiple places)
    expect(screen.getAllByText('Feedback recorded').length).toBeGreaterThan(0);
  });

  it('should handle different response formats', async () => {
    const testCases = [
      {
        response: { data: { message: 'Custom message' } },
        expected: 'Custom message',
      },
      {
        response: { data: { status: 'Success' } },
        expected: 'Success. Your feedback has been recorded.',
      },
      {
        response: { data: { Parent_feedback: 'Test feedback' } },
        expected: 'Feedback recorded: "Test feedback"',
      },
      {
        response: { data: {} },
        expected: 'Feedback received successfully.',
      },
    ];

    for (const testCase of testCases) {
      vi.clearAllMocks();
      mockSendFeedback.mockResolvedValue({
        success: true,
        ...testCase.response,
      });

      const { unmount } = renderWithContext();

      const manualInputButton = screen.getByRole('button', { name: /switch to manual input/i });
      fireEvent.click(manualInputButton);

      const textarea = screen.getByLabelText('Feedback message');
      fireEvent.change(textarea, { target: { value: 'Test' } });

      const sendButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        // Text appears in multiple places (response section, player, history)
        expect(screen.getAllByText(testCase.expected).length).toBeGreaterThan(0);
      });

      unmount();
    }
  });

  it('should clear input after successful submission', async () => {
    mockSendFeedback.mockResolvedValue({
      success: true,
      data: { message: 'Success' },
    });

    renderWithContext();

    const manualInputButton = screen.getByRole('button', { name: /switch to manual input/i });
    fireEvent.click(manualInputButton);

    const textarea = screen.getByLabelText('Feedback message');
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    expect(textarea.value).toBe('Test message');

    const sendButton = screen.getByRole('button', { name: /send feedback/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('should announce response to screen readers', async () => {
    mockSendFeedback.mockResolvedValue({
      success: true,
      data: { message: 'Feedback processed' },
    });

    renderWithContext();

    const manualInputButton = screen.getByRole('button', { name: /switch to manual input/i });
    fireEvent.click(manualInputButton);

    const textarea = screen.getByLabelText('Feedback message');
    fireEvent.change(textarea, { target: { value: 'Test' } });

    const sendButton = screen.getByRole('button', { name: /send feedback/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const srAnnouncement = screen.getByRole('status');
      expect(srAnnouncement).toHaveTextContent(/Feedback sent successfully.*Feedback processed/);
    });
  });
});
