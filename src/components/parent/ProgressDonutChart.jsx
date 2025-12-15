// src/components/parent/ProgressDonutChart.jsx
import { useEffect, useState } from "react";
import { Target, Award, Zap } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

// Animated Donut Chart Component
function DonutChart({ percentage, size = 120, strokeWidth = 12, color = "#3B82F6", label, value }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white text-lg font-bold">{animatedPercentage.toFixed(0)}%</span>
          {value && (
            <span className="text-white/70 text-xs">{value}</span>
          )}
        </div>
      </div>
      
      {/* Label */}
      <p className="text-white/90 text-sm font-medium mt-2 text-center">{label}</p>
    </div>
  );
}

// Mini Progress Ring Component
function MiniProgressRing({ percentage, color, size = 60 }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [percentage]);

  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-xs font-bold">{animatedPercentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export default function ProgressDonutChart({ stats, comparison }) {
  const { lang } = useLanguage();
  
  if (!stats) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <p className="text-white/70 text-center">
          {lang === "hi" ? "कोई प्रगति डेटा उपलब्ध नहीं" : "No progress data available"}
        </p>
      </div>
    );
  }

  // Calculate various progress metrics
  const accuracyProgress = stats.accuracy;
  const levelProgress = Math.min(100, (stats.level / 10) * 100); // Assuming max level is 10
  const streakProgress = Math.min(100, (stats.current_streak / Math.max(stats.max_streak, 1)) * 100);
  const classRankProgress = comparison ? Math.max(0, 100 - comparison.percentile) : 0;

  // Additional metrics for mini rings
  const engagementProgress = Math.min(100, (stats.total_attempts / 100) * 100);
  const consistencyProgress = stats.total_attempts > 0 ? (stats.correct_attempts / stats.total_attempts) * 100 : 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-white/20 p-2 rounded-lg">
          <Target className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <h3 className="text-white text-xl font-bold">
          {lang === "hi" ? "प्रगति अवलोकन" : "Progress Overview"}
        </h3>
      </div>

      {/* Compact Progress Donuts - smaller size */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <DonutChart
          percentage={accuracyProgress}
          size={100}
          strokeWidth={8}
          color="#10B981"
          label={lang === "hi" ? "सटीकता" : "Accuracy"}
          value={`${stats.correct_attempts}/${stats.total_attempts}`}
        />
        
        <DonutChart
          percentage={levelProgress}
          size={100}
          strokeWidth={8}
          color="#3B82F6"
          label={lang === "hi" ? "स्तर प्रगति" : "Level Progress"}
          value={lang === "hi" ? `स्तर ${stats.level}` : `Level ${stats.level}`}
        />
        
        <DonutChart
          percentage={streakProgress}
          size={100}
          strokeWidth={8}
          color="#F59E0B"
          label={lang === "hi" ? "वर्तमान स्ट्रीक" : "Current Streak"}
          value={lang === "hi" ? `${stats.current_streak} सही` : `${stats.current_streak} correct`}
        />
        
        <DonutChart
          percentage={classRankProgress}
          size={100}
          strokeWidth={8}
          color="#8B5CF6"
          label={lang === "hi" ? "कक्षा प्रदर्शन" : "Class Performance"}
          value={comparison ? (lang === "hi" ? `रैंक ${comparison.rank}` : `Rank ${comparison.rank}`) : 'N/A'}
        />
      </div>

      {/* Compact Additional Metrics */}
      <div className="border-t border-white/20 pt-4">
        <div className="grid grid-cols-3 gap-2">
          {/* Engagement */}
          <div className="flex flex-col items-center bg-white/5 rounded-lg p-2">
            <MiniProgressRing percentage={engagementProgress} color="#06B6D4" size={50} />
            <p className="text-white/70 text-xs mt-1 text-center">{lang === "hi" ? "सहभागिता" : "Engagement"}</p>
            <p className="text-white text-xs font-bold">{stats.total_attempts}</p>
          </div>
          
          {/* Consistency */}
          <div className="flex flex-col items-center bg-white/5 rounded-lg p-2">
            <MiniProgressRing percentage={consistencyProgress} color="#EF4444" size={50} />
            <p className="text-white/70 text-xs mt-1 text-center">{lang === "hi" ? "निरंतरता" : "Consistency"}</p>
            <p className="text-white text-xs font-bold">{consistencyProgress.toFixed(0)}%</p>
          </div>
          
          {/* Score */}
          <div className="flex flex-col items-center bg-white/5 rounded-lg p-2">
            <MiniProgressRing percentage={Math.min(100, stats.score)} color="#F97316" size={50} />
            <p className="text-white/70 text-xs mt-1 text-center">{lang === "hi" ? "स्कोर" : "Score"}</p>
            <p className="text-white text-xs font-bold">{stats.score.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex flex-wrap gap-2 justify-center">
          {stats.accuracy >= 80 && (
            <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Award className="w-3 h-3" />
              High Accuracy
            </div>
          )}
          
          {stats.current_streak >= 5 && (
            <div className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              On Fire!
            </div>
          )}
          
          {comparison && comparison.percentile <= 25 && (
            <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Target className="w-3 h-3" />
              Top Performer
            </div>
          )}
          
          {stats.total_attempts >= 50 && (
            <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Award className="w-3 h-3" />
              Dedicated Learner
            </div>
          )}
        </div>
      </div>
    </div>
  );
}