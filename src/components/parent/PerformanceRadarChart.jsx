// src/components/parent/PerformanceRadarChart.jsx
import { useEffect, useState } from "react";
import { Radar, Star } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

// Radar Chart Component
function RadarChart({ data, size = 200 }) {
  const [animatedValues, setAnimatedValues] = useState(data.map(() => 0));
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(data.map(d => d.value));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [data]);

  const center = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / data.length;

  // Generate polygon points for the data
  const generatePolygonPoints = (values) => {
    return values.map((value, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const r = (value / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Generate grid circles
  const gridCircles = [20, 40, 60, 80, 100].map(percent => {
    const r = (percent / 100) * radius;
    return (
      <circle
        key={percent}
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
    );
  });

  // Generate axis lines
  const axisLines = data.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const x2 = center + radius * Math.cos(angle);
    const y2 = center + radius * Math.sin(angle);
    return (
      <line
        key={index}
        x1={center}
        y1={center}
        x2={x2}
        y2={y2}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
    );
  });

  // Generate labels
  const labels = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const labelRadius = radius + 25;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    
    return (
      <text
        key={index}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs fill-white font-medium"
      >
        {item.label}
      </text>
    );
  });

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid */}
      {gridCircles}
      {axisLines}
      
      {/* Data polygon */}
      <polygon
        points={generatePolygonPoints(animatedValues)}
        fill="url(#radarGradient)"
        stroke="#3B82F6"
        strokeWidth="2"
        fillOpacity="0.3"
        className="transition-all duration-1000 ease-out"
      />
      
      {/* Data points */}
      {animatedValues.map((value, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const r = (value / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="4"
            fill="#3B82F6"
            stroke="white"
            strokeWidth="2"
            className="transition-all duration-1000 ease-out"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        );
      })}
      
      {/* Labels */}
      {labels}
      
      {/* Gradient definition */}
      <defs>
        <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.1" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function PerformanceRadarChart({ stats, comparison }) {
  const { lang } = useLanguage();
  
  if (!stats || !comparison) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <p className="text-white/70 text-center">
          {lang === "hi" ? "कोई प्रदर्शन डेटा उपलब्ध नहीं" : "No performance data available"}
        </p>
      </div>
    );
  }

  // Calculate performance metrics as percentages
  const performanceData = [
    {
      label: lang === "hi" ? "सटीकता" : "Accuracy",
      value: stats.accuracy,
      description: lang === "hi" ? "समस्या समाधान सटीकता" : "Problem solving accuracy"
    },
    {
      label: lang === "hi" ? "निरंतरता" : "Consistency",
      value: Math.min(100, (stats.current_streak / Math.max(stats.max_streak, 1)) * 100),
      description: lang === "hi" ? "सीखने की निरंतरता" : "Learning consistency"
    },
    {
      label: lang === "hi" ? "प्रगति" : "Progress",
      value: Math.min(100, (stats.level / 10) * 100), // Assuming max level is 10
      description: lang === "hi" ? "सीखने की प्रगति" : "Learning progress"
    },
    {
      label: lang === "hi" ? "सहभागिता" : "Engagement",
      value: Math.min(100, (stats.total_attempts / 100) * 100), // Normalize attempts
      description: lang === "hi" ? "अभ्यास सहभागिता" : "Practice engagement"
    },
    {
      label: lang === "hi" ? "कक्षा रैंक" : "Class Rank",
      value: Math.max(0, 100 - comparison.percentile), // Invert percentile for better visualization
      description: lang === "hi" ? "सापेक्ष प्रदर्शन" : "Relative performance"
    }
  ];

  const averageScore = performanceData.reduce((sum, item) => sum + item.value, 0) / performanceData.length;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Radar className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h3 className="text-white text-xl font-bold">
            {lang === "hi" ? "प्रदर्शन अवलोकन" : "Performance Overview"}
          </h3>
        </div>
        
        {/* Overall score */}
        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-bold">{averageScore.toFixed(0)}%</span>
        </div>
      </div>

      {/* Compact Chart Layout */}
      <div className="flex flex-col items-center gap-4">
        {/* Radar Chart - smaller and centered */}
        <div className="flex-shrink-0">
          <RadarChart data={performanceData} size={200} />
        </div>
        
        {/* Compact Legend - horizontal layout */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
          {performanceData.map((item, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-2 flex items-center justify-between">
              <div className="flex-1">
                <span className="text-white font-medium text-xs">{item.label}</span>
                <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${item.value}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
              <span className="text-white font-bold text-sm ml-2">{item.value.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-white/70 text-xs uppercase tracking-wide">Strongest Area</p>
            <p className="text-white font-bold">
              {performanceData.reduce((max, item) => item.value > max.value ? item : max).label}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/70 text-xs uppercase tracking-wide">Focus Area</p>
            <p className="text-white font-bold">
              {performanceData.reduce((min, item) => item.value < min.value ? item : min).label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}