import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { VoiceSynthesis } from '../../utils/voiceUtils';

/**
 * VoicePlayer Component
 * Provides audio playback interface for text-to-speech
 * Includes play/pause, progress bar, volume, speed controls, and replay
 */
export default function VoicePlayer({ text, autoPlay = false, onPlaybackEnd }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const synthesisRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Initialize synthesis on mount
  useEffect(() => {
    try {
      synthesisRef.current = new VoiceSynthesis();
    } catch (error) {
      console.error('Speech synthesis not supported:', error);
    }

    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.stop();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay && text && synthesisRef.current) {
      handlePlay();
    }
  }, [autoPlay, text]);

  // Estimate duration based on text length and speed
  const estimateDuration = (text, rate) => {
    // Average speaking rate is about 150 words per minute
    // Adjust based on speed setting
    const words = text.split(' ').length;
    const baseMinutes = words / 150;
    const seconds = (baseMinutes * 60) / rate;
    return Math.ceil(seconds);
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start playback
  const handlePlay = () => {
    if (!synthesisRef.current || !text) return;

    const estimatedDuration = estimateDuration(text, speed);
    setDuration(estimatedDuration);
    setCurrentTime(0);
    setProgress(0);

    synthesisRef.current.speak(text, {
      rate: speed,
      volume: isMuted ? 0 : volume,
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
        
        // Update progress bar
        progressIntervalRef.current = setInterval(() => {
          setCurrentTime(prev => {
            const newTime = prev + 0.1;
            const newProgress = (newTime / estimatedDuration) * 100;
            setProgress(Math.min(newProgress, 100));
            return newTime;
          });
        }, 100);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        setCurrentTime(estimatedDuration);
        
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        
        if (onPlaybackEnd) {
          onPlaybackEnd();
        }
      },
      onError: (error) => {
        console.error('Speech synthesis error:', error);
        setIsPlaying(false);
        setIsPaused(false);
        
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    });
  };

  // Pause playback
  const handlePause = () => {
    if (synthesisRef.current) {
      synthesisRef.current.pause();
      setIsPaused(true);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  // Resume playback
  const handleResume = () => {
    if (synthesisRef.current) {
      synthesisRef.current.resume();
      setIsPaused(false);
      
      // Resume progress updates
      const estimatedDuration = duration;
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          const newProgress = (newTime / estimatedDuration) * 100;
          setProgress(Math.min(newProgress, 100));
          return newTime;
        });
      }, 100);
    }
  };

  // Stop playback
  const handleStop = () => {
    if (synthesisRef.current) {
      synthesisRef.current.stop();
    }
    
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentTime(0);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  // Replay from beginning
  const handleReplay = () => {
    handleStop();
    setTimeout(() => handlePlay(), 100);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!isPlaying) {
      handlePlay();
    } else if (isPaused) {
      handleResume();
    } else {
      handlePause();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Change volume
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Change speed
  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    // If currently playing, restart with new speed
    if (isPlaying) {
      handleStop();
      setTimeout(() => handlePlay(), 100);
    }
  };

  if (!text) {
    return null;
  }

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 space-y-4">
      {/* Play/Pause and Replay Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={togglePlayPause}
          className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-colors shadow-lg"
          aria-label={isPlaying ? (isPaused ? "Resume" : "Pause") : "Play"}
        >
          {isPlaying && !isPaused ? (
            <Pause className="w-6 h-6 text-white" fill="white" />
          ) : (
            <Play className="w-6 h-6 text-white" fill="white" />
          )}
        </button>

        <button
          onClick={handleReplay}
          className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center transition-colors"
          aria-label="Replay"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
          <div
            className="bg-purple-600 h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-700 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleMute}
          className="text-gray-700 hover:text-purple-600 transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
          aria-label="Volume"
        />
        
        <span className="text-sm text-gray-700 font-medium w-10 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>

      {/* Speed Control */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 font-medium">Speed:</span>
        <div className="flex space-x-2">
          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${speed === s 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }
              `}
              aria-label={`Speed ${s}x`}
              aria-pressed={speed === s}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Visual Indicator */}
      {isPlaying && !isPaused && (
        <div className="flex items-center justify-center space-x-1">
          <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-6 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-5 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          <div className="w-1 h-7 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
          <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
        </div>
      )}
    </div>
  );
}
