// src/components/parent/ComparisonChart.jsx
import { useEffect, useState } from "react";
import { TrendingUp, Award, Users } from "lucide-react";

// Animated bar component
function AnimatedBar({ value, maxValue, color, label, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, delay);

    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/90 text-sm font-medium">{label}</span>
        <span className="text-white font-bold">{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-8 overflow-hidden relative">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
          style={{ width: `${width}%` }}
        >
          {width > 15 && (
            <span className="text-white text-xs font-semibold">
              {value.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Percentile badge component
function PercentileBadge({ percentile }) {
  let badgeColor = "bg-green-500";
  let badgeText = "Top";

  if (percentile <= 25) {
    badgeColor = "bg-green-500";
    badgeText = "Top";
  } else if (percentile <= 50) {
    badgeColor = "bg-blue-500";
    badgeText = "Upper";
  } else if (percentile <= 75) {
    badgeColor = "bg-yellow-500";
    badgeText = "Middle";
  } else {
    badgeColor = "bg-orange-500";
    badgeText = "Lower";
  }

  return (
    <div className={`${badgeColor} text-white px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-lg`}>
      <Award className="w-5 h-5" aria-hidden="true" />
      <span className="font-bold text-sm">
        {badgeText} {percentile.toFixed(0)}%
      </span>
    </div>
  );
}

export default function ComparisonChart({ comparison, childScore }) {
  if (!comparison) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <p className="text-white/70 text-center">No comparison data available</p>
      </div>
    );
  }

  const {
    class_count,
    avg_score,
    top_score,
    rank,
    percentile,
  } = comparison;

  // Determine color for child's score based on comparison with average
  const getScoreColor = () => {
    if (childScore > avg_score) {
      return "bg-green-500"; // Above average
    } else if (childScore >= avg_score * 0.9) {
      return "bg-yellow-500"; // Around average (within 10%)
    } else {
      return "bg-red-500"; // Below average
    }
  };

  // Find max value for scaling bars
  const maxScore = Math.max(childScore, avg_score, top_score);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-white/20 p-2 rounded-lg">
          <TrendingUp className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <h3 className="text-white text-xl font-bold">Class Comparison</h3>
      </div>

      {/* Rank and Percentile Section */}
      <div className="mb-6 space-y-4">
        {/* Rank Display */}
        <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-white/70" aria-hidden="true" />
            <span className="text-white/90 font-medium">Class Rank</span>
          </div>
          <span className="text-white text-lg font-bold">
            {rank} out of {class_count} students
          </span>
        </div>

        {/* Percentile Badge */}
        <div className="flex justify-center">
          <PercentileBadge percentile={percentile} />
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="mt-6">
        <h4 className="text-white/90 text-sm font-semibold mb-4 uppercase tracking-wide">
          Score Comparison
        </h4>

        {/* Child's Score */}
        <AnimatedBar
          value={childScore}
          maxValue={maxScore}
          color={getScoreColor()}
          label="Your Child's Score"
          delay={100}
        />

        {/* Class Average */}
        <AnimatedBar
          value={avg_score}
          maxValue={maxScore}
          color="bg-blue-500"
          label="Class Average"
          delay={300}
        />

        {/* Top Score */}
        <AnimatedBar
          value={top_score}
          maxValue={maxScore}
          color="bg-purple-500"
          label="Top Score"
          delay={500}
        />
      </div>

      {/* Performance Indicator */}
      <div className="mt-6 pt-4 border-t border-white/20">
        {childScore > avg_score ? (
          <div className="flex items-center gap-2 text-green-400">
            <TrendingUp className="w-5 h-5" aria-hidden="true" />
            <p className="text-sm font-medium">
              Performing {((childScore / avg_score - 1) * 100).toFixed(1)}% above class average
            </p>
          </div>
        ) : childScore >= avg_score * 0.9 ? (
          <div className="flex items-center gap-2 text-yellow-400">
            <TrendingUp className="w-5 h-5" aria-hidden="true" />
            <p className="text-sm font-medium">
              Performing around class average
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-orange-400">
            <TrendingUp className="w-5 h-5" aria-hidden="true" />
            <p className="text-sm font-medium">
              Room for improvement - {((1 - childScore / avg_score) * 100).toFixed(1)}% below class average
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
