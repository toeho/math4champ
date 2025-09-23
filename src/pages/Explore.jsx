// src/pages/Explore.jsx
import { useEffect, useState } from "react";
import { getExploreData } from "../utils/exploreApi";

export default function Explore() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getExploreData().then((res) => setData(res));
  }, []);

  if (!data) return <div className="text-white p-4">Loading...</div>;

  const { progress, accuracy, practice, strengths, weeklyGoal, badges } = data;

  return (
    <div className="p-4 text-white space-y-4">
      {/* Row 1: Progress + Accuracy */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-4 shadow flex flex-col items-center">
          <h3 className="font-semibold mb-2">Progress Overview</h3>
          <div className="relative w-24 h-24 mb-2">
            <svg className="w-full h-full">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="white"
                strokeWidth="8"
                fill="none"
                className="opacity-30"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray="282.6"
                strokeDashoffset={282.6 - (progress.percentage / 100) * 282.6}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              {progress.percentage}%
            </div>
          </div>
          <p className="text-sm">
            Topics mastered {progress.mastered} / {progress.total}
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 shadow flex flex-col justify-center items-center">
          <h3 className="font-semibold mb-2">Accuracy</h3>
          <p className="text-2xl font-bold">{accuracy}%</p>
          <p className="text-sm text-gray-300">Last 7 days</p>
        </div>
      </div>

      {/* Row 2: Practice + Strengths */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-4 shadow flex flex-col items-center">
          <h3 className="font-semibold mb-2">Practice & Engagement</h3>
          <div className="flex gap-4 mb-2">
            <div className="text-center">
              <p className="text-lg font-bold">{practice.problems}</p>
              <p className="text-xs">Problems solved</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{practice.minutes}</p>
              <p className="text-xs">Minutes</p>
            </div>
          </div>
          <p className="text-orange-400 font-semibold">
            🔥 {practice.streak} day streak
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 shadow">
          <h3 className="font-semibold mb-2">Strengths & Focus</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-bold">Strongest: </span> {strengths.strongest}
            </div>
            <div>
              <span className="font-bold">Focus area: </span> {strengths.focus}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="bg-white/10 rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-2">Weekly Goal</h3>
        <p className="mb-2">
          Problems solved: {weeklyGoal.solved} / Goal: {weeklyGoal.goal}
        </p>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500"
            style={{
              width: `${(weeklyGoal.solved / weeklyGoal.goal) * 100}%`,
            }}
          ></div>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={weeklyGoal.goal}
            onChange={(e) =>
              setData({
                ...data,
                weeklyGoal: {
                  ...weeklyGoal,
                  goal: Number(e.target.value),
                },
              })
            }
            className="px-2 py-1 rounded text-black w-20"
          />
          <button
            onClick={() => alert("Goal updated!")}
            className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
          >
            Set
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white/10 rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-4">Badges & Rewards</h3>
        <div className="grid grid-cols-3 gap-4">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl text-center ${
                idx % 2 === 0 ? "bg-yellow-500/80" : "bg-white/20"
              }`}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
