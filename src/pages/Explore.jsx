import { useEffect, useState } from "react";
import { getExploreData } from "../utils/exploreApi";
import CircularProgress from "../components/CircularProgress";
import Confetti from "../components/Confetti";
import BadgeUnlock from "../components/BadgeUnlock";

export default function Explore() {
  const [data, setData] = useState(null);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [previousStreak, setPreviousStreak] = useState(0);

  useEffect(() => {
    getExploreData().then(setData);
  }, []);

  // Count-up animation for accuracy
  useEffect(() => {
    if (data?.accuracy) {
      const duration = 1500;
      const steps = 60;
      const increment = data.accuracy / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= data.accuracy) {
          setAnimatedAccuracy(data.accuracy);
          clearInterval(timer);
        } else {
          setAnimatedAccuracy(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [data?.accuracy]);

  // Check for goal completion and trigger confetti
  useEffect(() => {
    if (data?.weeklyGoal) {
      const progress = (data.weeklyGoal.solved / data.weeklyGoal.goal) * 100;
      if (progress >= 100) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [data?.weeklyGoal]);

  // Check for streak milestones and trigger badge unlock
  useEffect(() => {
    if (data?.practice?.streak && previousStreak > 0) {
      const currentStreak = data.practice.streak;
      const milestones = [3, 7, 14, 30, 60, 100];
      
      // Check if we just hit a milestone
      const justUnlockedMilestone = milestones.find(
        milestone => currentStreak >= milestone && previousStreak < milestone
      );
      
      if (justUnlockedMilestone) {
        setUnlockedBadge({
          icon: "🔥",
          title: `${justUnlockedMilestone} Day Streak!`,
          description: `Amazing! You've practiced for ${justUnlockedMilestone} days in a row!`
        });
        setShowBadgeUnlock(true);
        setTimeout(() => setShowBadgeUnlock(false), 2500);
      }
    }
    
    if (data?.practice?.streak) {
      setPreviousStreak(data.practice.streak);
    }
  }, [data?.practice?.streak]);

  if (!data) return <div className="text-white p-4">Loading...</div>;

  const { progress, accuracy, practice, strengths, weeklyGoal, badges } = data;

  return (
    <div className="p-4 text-white space-y-4 animate-page-fade-in">
      {/* Confetti animation on goal completion */}
      {showConfetti && <Confetti />}
      
      {/* Badge unlock animation */}
      {showBadgeUnlock && unlockedBadge && (
        <BadgeUnlock badge={unlockedBadge} onComplete={() => setShowBadgeUnlock(false)} />
      )}
      
      {/* Row 1: Progress + Accuracy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center animate-fade-in">
          <h3 className="font-semibold mb-4 text-base sm:text-lg">Progress Overview</h3>
          {/* Mobile: 120px, Desktop (lg+): 160px */}
          <div className="block lg:hidden">
            <CircularProgress percentage={progress.percentage} size="mobile" />
          </div>
          <div className="hidden lg:block">
            <CircularProgress percentage={progress.percentage} size="desktop" />
          </div>
          <p className="text-xs sm:text-sm mt-4 text-gray-300">
            Topics mastered {progress.mastered} / {progress.total}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center items-center animate-fade-in relative">
          <h3 className="font-semibold mb-2 text-base sm:text-lg">Accuracy</h3>
          <div className="relative">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              {animatedAccuracy}%
            </p>
            {/* Sparkle effects for high accuracy */}
            {accuracy >= 90 && (
              <>
                <span className="absolute -top-2 -right-2 text-yellow-400 animate-bounce">✨</span>
                <span className="absolute -bottom-2 -left-2 text-yellow-400 animate-bounce animation-delay-300">✨</span>
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-300 mt-2">Last 7 days</p>
        </div>
      </div>

      {/* Row 2: Practice + Strengths */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center animate-fade-in">
          <h3 className="font-semibold mb-4 text-base sm:text-lg">Practice & Engagement</h3>
          <div className="flex gap-4 sm:gap-6 mb-4">
            <div className="text-center bg-white/10 rounded-xl p-3 min-w-[80px]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-blue-400">📝</span>
                <p className="text-xl sm:text-2xl font-bold">{practice.problems}</p>
              </div>
              <p className="text-xs text-gray-300">Problems</p>
            </div>
            <div className="text-center bg-white/10 rounded-xl p-3 min-w-[80px]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-green-400">⏱️</span>
                <p className="text-xl sm:text-2xl font-bold">{practice.minutes}</p>
              </div>
              <p className="text-xs text-gray-300">Minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-full">
            <span className="text-2xl animate-streak-fire">🔥</span>
            <p className="text-orange-400 font-bold text-sm sm:text-base">{practice.streak} day streak</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in">
          <h3 className="font-semibold mb-4 text-base sm:text-lg">Strengths & Focus</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <span className="font-bold text-green-400">💪 Strongest: </span>
              <span className="text-gray-200">{strengths.strongest}</span>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <span className="font-bold text-blue-400">🎯 Focus area: </span>
              <span className="text-gray-200">{strengths.focus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in relative">
        <h3 className="font-semibold mb-4 text-base sm:text-lg">Weekly Goal 🎯</h3>
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-gray-300">
            Problems solved: <span className="font-bold text-white">{weeklyGoal.solved}</span>
          </p>
          <p className="text-sm text-gray-300">
            Goal: <span className="font-bold text-white">{weeklyGoal.goal}</span>
          </p>
        </div>
        
        {/* Animated progress bar */}
        <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden mb-4 relative">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ease-out relative"
            style={{ 
              width: `${Math.min((weeklyGoal.solved / weeklyGoal.goal) * 100, 100)}%`,
              boxShadow: "0 0 10px rgba(74, 222, 128, 0.5)"
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                 style={{ backgroundSize: "200% 100%" }} />
          </div>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
            {Math.round((weeklyGoal.solved / weeklyGoal.goal) * 100)}%
          </div>
        </div>
        
        {/* Goal input section */}
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-300">Set new goal:</label>
          <input
            type="number"
            value={weeklyGoal.goal}
            onChange={(e) =>
              setData(prev => ({
                ...prev,
                weeklyGoal: { ...prev.weeklyGoal, goal: Number(e.target.value) },
              }))
            }
            className="px-3 py-2 rounded-lg text-black w-20 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          />
          <button
            onClick={() => {
              alert("Goal updated!");
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:brightness-110 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 active:scale-95"
          >
            Set
          </button>
        </div>
        
        {/* Goal completion celebration */}
        {(weeklyGoal.solved / weeklyGoal.goal) >= 1 && (
          <div className="mt-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3 text-center animate-bounce-in">
            <span className="text-2xl">🎉</span>
            <p className="text-sm font-bold text-green-400">Goal Completed!</p>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg animate-fade-in">
        <h3 className="font-semibold mb-4 text-base sm:text-lg">Badges & Rewards 🏆</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {badges.map((badge, idx) => {
            // Rotate through colorful gradient backgrounds
            const gradients = [
              "from-yellow-400 to-orange-500",
              "from-green-400 to-blue-500",
              "from-purple-400 to-pink-500",
              "from-blue-400 to-indigo-500",
              "from-pink-400 to-red-500",
              "from-indigo-400 to-purple-500",
            ];
            const gradient = gradients[idx % gradients.length];
            
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${gradient} p-4 rounded-xl text-center font-semibold text-white shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:rotate-2 transition-all duration-300 cursor-pointer animate-scale-in`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="text-2xl mb-1">
                  {idx === 0 ? "🌟" : idx === 1 ? "🎯" : idx === 2 ? "🔥" : idx === 3 ? "💎" : idx === 4 ? "🚀" : "⭐"}
                </div>
                <p className="text-xs sm:text-sm">{badge}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
