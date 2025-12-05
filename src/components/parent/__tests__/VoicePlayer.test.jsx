import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoicePlayer from '../VoicePlayer';

// Mock the voiceUtils module
vi.mock('../../../utils/voiceUtils', () => {
  return {
    VoiceSynthesis: class MockVoiceSynthesis {
      constructor() {
        this.speak = vi.fn((text, options) => {
          // Simulate async speech start
          setTimeout(() => {
            if (options?.onStart) options.onStart();
          }, 10);
          // Simulate speech end after a short delay
          setTimeout(() => {
            if (options?.onEnd) options.onEnd();
          }, 100);
        });
        this.stop = vi.fn();
        this.pause = vi.fn();
        this.resume = vi.fn();
      }
    }
  };
});

describe('VoicePlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders nothing when no text is provided', () => {
    const { container } = render(<VoicePlayer text="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders player controls when text is provided', () => {
    render(<VoicePlayer text="Hello world" />);
    
    expect(screen.getByLabelText('Play')).toBeInTheDocument();
    expect(screen.getByLabelText('Replay')).toBeInTheDocument();
    expect(screen.getByLabelText('Volume')).toBeInTheDocument();
  });

  it('displays play button initially', () => {
    render(<VoicePlayer text="Test message" />);
    
    const playButton = screen.getByLabelText('Play');
    expect(playButton).toBeInTheDocument();
  });

  it('changes to pause button when playing', async () => {
    render(<VoicePlayer text="Test message" />);
    
    const playButton = screen.getByLabelText('Play');
    fireEvent.click(playButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
    });
  });

  it('displays progress bar', () => {
    render(<VoicePlayer text="Test message" />);
    
    // Progress bar is a div, not a semantic progressbar role
    const progressBar = document.querySelector('.bg-purple-600.h-full');
    expect(progressBar).toBeInTheDocument();
  });

  it('displays time indicators', () => {
    render(<VoicePlayer text="Test message" />);
    
    // Should show 0:00 initially
    const timeElements = screen.getAllByText(/\d:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('displays volume control', () => {
    render(<VoicePlayer text="Test message" />);
    
    const volumeSlider = screen.getByLabelText('Volume');
    expect(volumeSlider).toBeInTheDocument();
    expect(volumeSlider).toHaveAttribute('type', 'range');
  });

  it('displays speed control buttons', () => {
    render(<VoicePlayer text="Test message" />);
    
    expect(screen.getByLabelText('Speed 0.5x')).toBeInTheDocument();
    expect(screen.getByLabelText('Speed 1x')).toBeInTheDocument();
    expect(screen.getByLabelText('Speed 1.5x')).toBeInTheDocument();
    expect(screen.getByLabelText('Speed 2x')).toBeInTheDocument();
  });

  it('highlights current speed', () => {
    render(<VoicePlayer text="Test message" />);
    
    const speed1x = screen.getByLabelText('Speed 1x');
    expect(speed1x).toHaveClass('bg-purple-600');
  });

  it('changes speed when speed button is clicked', () => {
    render(<VoicePlayer text="Test message" />);
    
    const speed2x = screen.getByLabelText('Speed 2x');
    fireEvent.click(speed2x);
    
    expect(speed2x).toHaveClass('bg-purple-600');
  });

  it('toggles mute when volume icon is clicked', () => {
    render(<VoicePlayer text="Test message" />);
    
    const muteButton = screen.getByLabelText('Mute');
    fireEvent.click(muteButton);
    
    expect(screen.getByLabelText('Unmute')).toBeInTheDocument();
  });

  it('updates volume when slider is changed', () => {
    render(<VoicePlayer text="Test message" />);
    
    const volumeSlider = screen.getByLabelText('Volume');
    fireEvent.change(volumeSlider, { target: { value: '0.5' } });
    
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays replay button', () => {
    render(<VoicePlayer text="Test message" />);
    
    const replayButton = screen.getByLabelText('Replay');
    expect(replayButton).toBeInTheDocument();
  });

  it('calls onPlaybackEnd when playback completes', async () => {
    const onPlaybackEnd = vi.fn();
    render(<VoicePlayer text="Test message" onPlaybackEnd={onPlaybackEnd} />);
    
    const playButton = screen.getByLabelText('Play');
    fireEvent.click(playButton);
    
    await waitFor(() => {
      expect(onPlaybackEnd).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it('auto-plays when autoPlay is true', async () => {
    render(<VoicePlayer text="Test message" autoPlay={true} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
    });
  });

  it('displays visual indicator when playing', async () => {
    render(<VoicePlayer text="Test message" />);
    
    const playButton = screen.getByLabelText('Play');
    fireEvent.click(playButton);
    
    await waitFor(() => {
      // Check for animated bars (visual indicator)
      const animatedBars = document.querySelectorAll('.animate-pulse');
      expect(animatedBars.length).toBeGreaterThan(0);
    });
  });
});
