// src/components/parent/StreakActivityChart.jsx
import { useEffect, useState } from "react";
import { Calendar, Flame, TrendingUp } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

// Generate mock activity data for the last 30 days
function generateActivityData(totalAttempts, currentStreak) {
  const days = 30;
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate activity based on current streak and total attempts
    let activity = 0;
    if (i < currentStreak) {
      // Recent streak days
      activity = Math.floor(Math.random() * 3) + 2; // 2-4 activities
    } else if (Math.random() < 0.6) {
      // Random activity on other days
      activity = Math.floor(Math.random() * 3); // 0-2 activities
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      dayName: date.toLocaleDateString('en', { weekday: 'short' }),
      activity: activity,
      isToday: i === 0
    });
  }
  
  return data;
}

// Activity Cell Component - smaller for compact layout
function ActivityCell({ day, activity, isToday, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  const getActivityColor = () => {
    if (activity === 0) return 'bg-white/10';
    if (activity === 1) return 'bg-green-500/30';
    if (activity === 2) return 'bg-green-500/60';
    if (activity >= 3) return 'bg-green-500/90';
    return 'bg-white/10';
  };

  const getActivityIntensity = () => {
    if (activity === 0) return 'No activity';
    if (activity === 1) return 'Light activity';
    if (activity === 2) return 'Moderate activity';
    if (activity >= 3) return 'High activity';
    return 'No activity';
  };

  return (
    <div
      className={`
        w-4 h-4 rounded-sm transition-all duration-300 cursor-pointer
        ${getActivityColor()}
        ${isToday ? 'ring-1 ring-white' : ''}
        ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        hover:scale-110 hover:brightness-110
      `}
      title={`${day}: ${getActivityIntensity()} (${activity} problems)`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {isToday && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
}

// Week Row Component
function WeekRow({ weekData, startDelay = 0 }) {
  return (
    <div className="flex gap-1">
      {weekData.map((day, index) => (
        <ActivityCell
          key={day.date}
          day={day.day}
          activity={day.activity}
          isToday={day.isToday}
          delay={startDelay + index * 50}
        />
      ))}
    </div>
  );
}

// Streak Stats Component - more compact
function StreakStats({ stats, activityData, lang }) {
  const totalActiveDays = activityData.filter(day => day.activity > 0).length;
  const averageActivity = activityData.reduce((sum, day) => sum + day.activity, 0) / activityData.length;

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      <div className="text-center bg-white/5 rounded-lg p-2">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Flame className="w-3 h-3 text-orange-400" />
          <span className="text-white text-sm font-bold">{stats.current_streak}</span>
        </div>
        <p className="text-white/70 text-xs">{lang === "hi" ? "स्ट्रीक" : "Streak"}</p>
      </div>
      
      <div className="text-center bg-white/5 rounded-lg p-2">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Calendar className="w-3 h-3 text-blue-400" />
          <span className="text-white text-sm font-bold">{totalActiveDays}</span>
        </div>
        <p className="text-white/70 text-xs">{lang === "hi" ? "सक्रिय" : "Active"}</p>
      </div>
      
      <div className="text-center bg-white/5 rounded-lg p-2">
        <div className="flex items-center justify-center gap-1 mb-1">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-white text-sm font-bold">{averageActivity.toFixed(1)}</span>
        </div>
        <p className="text-white/70 text-xs">{lang === "hi" ? "औसत" : "Avg"}</p>
      </div>
    </div>
  );
}

// Helper function to calculate longest streak
function calculateLongestStreak(activityData) {
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const day of activityData) {
    if (day.activity > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
}

export default function StreakActivityChart({ stats }) {
  const { lang } = useLanguage();
  
  if (!stats) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <p className="text-white/70 text-center">
          {lang === "hi" ? "कोई गतिविधि डेटा उपलब्ध नहीं" : "No activity data available"}
        </p>
      </div>
    );
  }

  const activityData = generateActivityData(stats.total_attempts, stats.current_streak);
  
  // Group data by weeks (7 days each)
  const weeks = [];
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
  }

  // Ensure last week is complete (pad with empty days if needed)
  const lastWeek = weeks[weeks.length - 1];
  while (lastWeek && lastWeek.length < 7) {
    lastWeek.push({ date: '', day: '', activity: 0, isToday: false });
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h3 className="text-white text-xl font-bold">
            {lang === "hi" ? "गतिविधि हीटमैप" : "Activity Heatmap"}
          </h3>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span>{lang === "hi" ? "कम" : "Less"}</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-white/10 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500/30 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500/60 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500/90 rounded-sm"></div>
          </div>
          <span>{lang === "hi" ? "अधिक" : "More"}</span>
        </div>
      </div>

      {/* Day labels - smaller for compact layout */}
      <div className="flex justify-between mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="w-4 text-center">
            <span className="text-white/70 text-xs">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Activity Grid */}
      <div className="space-y-1 mb-4">
        {weeks.map((week, weekIndex) => (
          <WeekRow
            key={weekIndex}
            weekData={week}
            startDelay={weekIndex * 100}
          />
        ))}
      </div>

      {/* Stats */}
      <StreakStats stats={stats} activityData={activityData} lang={lang} />

      {/* Motivational Message */}
      <div className="mt-4 pt-4 border-t border-white/20">
        {stats.current_streak >= 7 ? (
          <div className="flex items-center gap-2 text-green-300">
            <Flame className="w-5 h-5" />
            <p className="text-sm font-medium">
              Amazing! You're on a {stats.current_streak}-day streak! Keep it up! 🔥
            </p>
          </div>
        ) : stats.current_streak >= 3 ? (
          <div className="flex items-center gap-2 text-yellow-300">
            <TrendingUp className="w-5 h-5" />
            <p className="text-sm font-medium">
              Great progress! You're building a solid learning habit! 📈
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-blue-300">
            <Calendar className="w-5 h-5" />
            <p className="text-sm font-medium">
              Keep practicing daily to build your learning streak! 💪
            </p>
          </div>
        )}
      </div>
    </div>
  );
}