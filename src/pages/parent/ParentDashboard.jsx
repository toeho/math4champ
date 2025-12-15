// src/pages/parent/ParentDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParent } from "../../contexts/ParentContext";
import { useLanguage } from "../../hooks/useLanguage";
import { RefreshCw, AlertCircle, TrendingUp, User, GraduationCap } from "lucide-react";
import StatsCard from "../../components/parent/StatsCard";
import ComparisonChart from "../../components/parent/ComparisonChart";
import AccuracyTrendChart from "../../components/parent/AccuracyTrendChart";
import PerformanceRadarChart from "../../components/parent/PerformanceRadarChart";
import ProgressDonutChart from "../../components/parent/ProgressDonutChart";
import StreakActivityChart from "../../components/parent/StreakActivityChart";

export default function ParentDashboard() {
  const { stats, statsLoading, fetchStats, parent } = useParent();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch stats on component mount
  useEffect(() => {
    const loadStats = async () => {
      const result = await fetchStats();
      if (!result.success) {
        if (result.expired) {
          // Session expired, redirect to login
          navigate("/parent/login");
        } else {
          setError(result.message);
        }
      }
    };

    if (parent && !stats && !statsLoading) {
      loadStats();
    }
  }, [parent, stats, statsLoading, fetchStats, navigate]);

  // Handle refresh functionality
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    
    const result = await fetchStats();
    
    if (!result.success) {
      if (result.expired) {
        navigate("/parent/login");
      } else {
        setError(result.message);
      }
    }
    
    setIsRefreshing(false);
  };

  // Loading state
  if (statsLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-white text-lg">Loading dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <AlertCircle className="w-16 h-16 text-red-300" />
        <h2 className="text-white text-xl font-semibold">Error Loading Dashboard</h2>
        <p className="text-white/80 text-center">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                     transition-colors duration-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Empty state - no data available
  if (!stats || !stats.child) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <TrendingUp className="w-16 h-16 text-white/60" />
        <h2 className="text-white text-xl font-semibold">No Data Available</h2>
        <p className="text-white/80 text-center max-w-md">
          Your child hasn't started practicing yet. Once they begin, you'll see their progress and statistics here.
        </p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                     transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="space-y-6 pb-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {lang === "hi" ? "डैशबोर्ड" : "Dashboard"}
        </h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                     transition-colors duration-200 disabled:opacity-50"
          aria-label="Refresh statistics"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error banner (if error but stats exist from cache) */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium">Failed to refresh</p>
            <p className="text-white/80 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Child Overview Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <User className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {lang === "hi" ? "छात्र अवलोकन" : "Student Overview"}
          </h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <span className="text-white/70 text-sm font-medium">Name</span>
            <span className="text-white font-semibold">{stats.child.name}</span>
          </div>
          
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <span className="text-white/70 text-sm font-medium">Username</span>
            <span className="text-white font-semibold">{stats.child.username}</span>
          </div>
          
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-white/70" aria-hidden="true" />
              <span className="text-white/70 text-sm font-medium">Class Level</span>
            </div>
            <span className="text-white font-semibold">{stats.child.class_level}</span>
          </div>
          
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <span className="text-white/70 text-sm font-medium">Current Level</span>
            <span className="text-white font-semibold text-lg">{stats.child.level}</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          {lang === "hi" ? "प्रदर्शन मेट्रिक्स" : "Performance Metrics"}
        </h2>
        <StatsCard stats={stats.child} />
      </div>

      {/* Charts Section - Single Column Layout */}
      <div className="space-y-6">
        {/* Accuracy Trend Chart */}
        <AccuracyTrendChart stats={stats.child} />
        
        {/* Performance Radar Chart */}
        <PerformanceRadarChart stats={stats.child} comparison={stats.comparison} />
        
        {/* Progress Donut Chart */}
        <ProgressDonutChart stats={stats.child} comparison={stats.comparison} />
        
        {/* Streak Activity Chart */}
        <StreakActivityChart stats={stats.child} />
      </div>

      {/* Class Comparison Chart - Full Width */}
      <div>
        <ComparisonChart 
          comparison={stats.comparison} 
          childScore={stats.child.score} 
        />
      </div>
    </div>
  );
}
