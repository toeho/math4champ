import { useEffect, useState } from "react";

export default function CircularProgress({ percentage, size = "mobile" }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Responsive sizing: 120px mobile, 160px desktop
  const dimensions = size === "desktop" ? 160 : 120;
  const radius = size === "desktop" ? 70 : 52;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    // Trigger mount for arc drawing animation
    setMounted(true);
    
    // Count-up animation for percentage in center
    const duration = 1000; // 1 second to match arc animation
    const steps = 60;
    const increment = percentage / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= percentage) {
        setAnimatedPercentage(percentage);
        clearInterval(timer);
      } else {
        setAnimatedPercentage(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [percentage]);

  return (
    <div 
      className="relative mx-auto"
      style={{ width: `${dimensions}px`, height: `${dimensions}px` }}
    >
      {/* Glow effect around circle */}
      <div 
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)",
          filter: "blur(20px)"
        }}
      />
      
      {/* SVG Circle */}
      <svg 
        className="w-full h-full transform -rotate-90" 
        viewBox={`0 0 ${dimensions} ${dimensions}`}
      >
        <defs>
          {/* Gradient stroke from green-400 to blue-500 */}
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" /> {/* green-400 */}
            <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle with arc drawing animation (1s ease-out) */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? strokeDashoffset : circumference}
          strokeLinecap="round"
          style={{
            transition: mounted ? "stroke-dashoffset 1s ease-out" : "none",
            filter: "drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))"
          }}
        />
      </svg>
      
      {/* Center percentage text with count-up animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className={`font-bold text-white ${
            size === "desktop" ? "text-3xl" : "text-2xl"
          }`}
          style={{
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)"
          }}
        >
          {animatedPercentage}%
        </span>
      </div>
    </div>
  );
}
