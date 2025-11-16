import { useEffect } from "react";

export default function BadgeUnlock({ badge, onComplete }) {
  useEffect(() => {
    // Auto-complete after animation
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl animate-badge-unlock">
        {/* Badge icon */}
        <div className="text-6xl mb-4 text-center">
          {badge.icon || "🏆"}
        </div>
        
        {/* Badge title */}
        <h3 className="text-2xl font-bold text-white text-center mb-2">
          {badge.title || "Achievement Unlocked!"}
        </h3>
        
        {/* Badge description */}
        <p className="text-white/80 text-center text-sm">
          {badge.description || "You've earned a new badge!"}
        </p>
        
        {/* Sparkle effects */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-sparkle-twinkle">✨</div>
        <div className="absolute top-1/2 -left-6 text-2xl animate-sparkle-twinkle animation-delay-300">⭐</div>
        <div className="absolute top-1/2 -right-6 text-2xl animate-sparkle-twinkle animation-delay-500">⭐</div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-3xl animate-sparkle-twinkle animation-delay-700">✨</div>
      </div>
    </div>
  );
}
