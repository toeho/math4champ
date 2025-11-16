import { useEffect, useState } from "react";

export default function SuccessAnimation({ onComplete }) {
  const [soundWaves, setSoundWaves] = useState([]);

  useEffect(() => {
    // Create sound wave effects
    const waves = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      delay: i * 0.15,
    }));
    setSoundWaves(waves);

    // Auto-complete after animation
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      {/* Success icon with pop animation */}
      <div className="relative">
        <div className="text-6xl animate-success-pop">
          ✅
        </div>
        
        {/* Sound wave effects */}
        {soundWaves.map((wave) => (
          <div
            key={wave.id}
            className="absolute inset-0 border-4 border-green-400 rounded-full animate-sound-wave"
            style={{
              animationDelay: `${wave.delay}s`,
            }}
          />
        ))}
        
        {/* Sparkles around success icon */}
        <div className="absolute -top-4 -right-4 text-2xl animate-sparkle-twinkle">✨</div>
        <div className="absolute -bottom-4 -left-4 text-2xl animate-sparkle-twinkle animation-delay-300">✨</div>
        <div className="absolute -top-4 -left-4 text-2xl animate-sparkle-twinkle animation-delay-500">⭐</div>
        <div className="absolute -bottom-4 -right-4 text-2xl animate-sparkle-twinkle animation-delay-700">⭐</div>
      </div>
    </div>
  );
}
