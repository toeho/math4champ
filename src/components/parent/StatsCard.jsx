// src/components/parent/StatsCard.jsx
import { useEffect, useState } from "react";
import { 
  Target, 
  CheckCircle, 
  TrendingUp, 
  Star, 
  Flame, 
  Trophy 
} from "lucide-react";

// Animated counter component
function AnimatedCounter({ value, duration = 1000, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

// Progress bar component for percentages
function ProgressBar({ percentage, color = "bg-green-500" }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden mt-2">
      <div
        className={`h-full ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
}

// Individual stat card component
function StatCard({ icon: Icon, label, value, color, showProgress, progressValue, suffix = "" }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:bg-white/15 transition-colors duration-200">
      <div className="flex items-start justify-between mb-2">
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-white/70 text-sm font-medium mb-1">{label}</p>
        <p className="text-white text-2xl font-bold">
          <AnimatedCounter value={value} suffix={suffix} />
        </p>
        
        {showProgress && progressValue !== undefined && (
          <ProgressBar percentage={progressValue} color={color} />
        )}
      </div>
    </div>
  );
}

// Main StatsCard component that displays all metrics
export default function StatsCard({ stats }) {
  if (!stats) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <p className="text-white/70 text-center">No statistics available</p>
      </div>
    );
  }

  const {
    total_attempts = 0,
    correct_attempts = 0,
    accuracy = 0,
    score = 0,
    current_streak = 0,
    max_streak = 0,
  } = stats;

  // Determine color for accuracy based on percentage
  const getAccuracyColor = () => {
    if (accuracy >= 80) return "bg-green-500";
    if (accuracy >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Attempts */}
      <StatCard
        icon={Target}
        label="Total Attempts"
        value={total_attempts}
        color="bg-blue-500"
        showProgress={false}
      />

      {/* Correct Attempts */}
      <StatCard
        icon={CheckCircle}
        label="Correct Attempts"
        value={correct_attempts}
        color="bg-green-500"
        showProgress={false}
      />

      {/* Accuracy Percentage */}
      <StatCard
        icon={TrendingUp}
        label="Accuracy"
        value={accuracy}
        suffix="%"
        color={getAccuracyColor()}
        showProgress={true}
        progressValue={accuracy}
      />

      {/* Score */}
      <StatCard
        icon={Star}
        label="Score"
        value={score}
        color="bg-purple-500"
        showProgress={false}
      />

      {/* Current Streak */}
      <StatCard
        icon={Flame}
        label="Current Streak"
        value={current_streak}
        color="bg-orange-500"
        showProgress={false}
      />

      {/* Max Streak */}
      <StatCard
        icon={Trophy}
        label="Max Streak"
        value={max_streak}
        color="bg-yellow-500"
        showProgress={false}
      />
    </div>
  );
}
