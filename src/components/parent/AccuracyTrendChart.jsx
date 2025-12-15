// src/components/parent/AccuracyTrendChart.jsx
import { useEffect, useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

// Mock data generator for trend visualization (in real app, this would come from API)
function generateTrendData(currentAccuracy, totalAttempts) {
  const points = Math.min(totalAttempts, 10); // Show last 10 sessions
  const data = [];
  
  for (let i = 0; i < points; i++) {
    const variation = (Math.random() - 0.5) * 20; // ±10% variation
    const accuracy = Math.max(0, Math.min(100, currentAccuracy + variation));
    data.push({
      session: i + 1,
      accuracy: accuracy,
      date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toLocaleDateString()
    });
  }
  
  // Ensure last point matches current accuracy
  if (data.length > 0) {
    data[data.length - 1].accuracy = currentAccuracy;
  }
  
  return data;
}

// SVG Line Chart Component
function LineChart({ data, width = 300, height = 150 }) {
  const [animatedData, setAnimatedData] = useState([]);
  
  useEffect(() => {
    // Animate line drawing
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [data]);

  if (!data || data.length === 0) return null;

  const maxAccuracy = Math.max(...data.map(d => d.accuracy));
  const minAccuracy = Math.min(...data.map(d => d.accuracy));
  const range = maxAccuracy - minAccuracy || 1;
  
  const padding = 20;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Generate path for the line
  const pathData = animatedData.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + ((maxAccuracy - point.accuracy) / range) * chartHeight;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate points for dots
  const points = animatedData.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + ((maxAccuracy - point.accuracy) / range) * chartHeight;
    return { x, y, accuracy: point.accuracy };
  });

  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* Line path */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        
        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="white"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              className="transition-all duration-500 hover:r-8"
              style={{ animationDelay: `${index * 100}ms` }}
            />
            <text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              className="text-xs fill-white font-semibold"
            >
              {point.accuracy.toFixed(0)}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AccuracyTrendChart({ stats }) {
  const { lang } = useLanguage();
  
  if (!stats) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <p className="text-white/70 text-center">
          {lang === "hi" ? "कोई ट्रेंड डेटा उपलब्ध नहीं" : "No trend data available"}
        </p>
      </div>
    );
  }

  const trendData = generateTrendData(stats.accuracy, stats.total_attempts);
  const trend = trendData.length > 1 ? 
    trendData[trendData.length - 1].accuracy - trendData[0].accuracy : 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h3 className="text-white text-xl font-bold">
            {lang === "hi" ? "सटीकता ट्रेंड" : "Accuracy Trend"}
          </h3>
        </div>
        
        {/* Trend indicator */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          trend > 0 ? 'bg-green-500/20 text-green-300' : 
          trend < 0 ? 'bg-red-500/20 text-red-300' : 
          'bg-gray-500/20 text-gray-300'
        }`}>
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart and Summary in compact layout */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Chart - smaller and more compact */}
        <div className="flex-shrink-0">
          <LineChart data={trendData} width={280} height={140} />
        </div>
        
        {/* Summary - vertical layout for mobile, horizontal for larger screens */}
        <div className="flex flex-row sm:flex-col gap-4 sm:gap-2 flex-1">
          <div className="text-center bg-white/5 rounded-lg p-3 flex-1">
            <p className="text-white/70 text-xs uppercase tracking-wide">
              {lang === "hi" ? "वर्तमान" : "Current"}
            </p>
            <p className="text-white text-lg font-bold">{stats.accuracy.toFixed(1)}%</p>
          </div>
          <div className="text-center bg-white/5 rounded-lg p-3 flex-1">
            <p className="text-white/70 text-xs uppercase tracking-wide">
              {lang === "hi" ? "सत्र" : "Sessions"}
            </p>
            <p className="text-white text-lg font-bold">{trendData.length}</p>
          </div>
          <div className="text-center bg-white/5 rounded-lg p-3 flex-1">
            <p className="text-white/70 text-xs uppercase tracking-wide">
              {lang === "hi" ? "ट्रेंड" : "Trend"}
            </p>
            <p className={`text-lg font-bold ${
              trend > 0 ? 'text-green-300' : 
              trend < 0 ? 'text-red-300' : 
              'text-gray-300'
            }`}>
              {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}