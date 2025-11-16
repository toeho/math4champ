import { useEffect, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FeatureGrid({ onTopicClick }) {
  const { lang } = useLanguage();
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/topics/`);
        if (!res.ok) throw new Error("Failed to fetch topics");
        const data = await res.json();
        setTopics(data);
      } catch (err) {
        console.error("Error fetching topics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const icons = ["123", "+", "−", "⬤"];
  
  // Colorful gradient backgrounds for each topic
  const gradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-yellow-500",
  ];
  
  // Colored glow effects for hover
  const glows = [
    "shadow-glow-purple",
    "shadow-glow-blue",
    "shadow-glow-green",
    "shadow-lg",
  ];

  const features =
    topics.length > 0
      ? topics.map((topic, i) => ({
          label: lang === "hi"
            ? ["संख्याएँ", "जोड़", "घटाव", "आकार"][i] || topic
            : topic,
          icon: icons[i] || "❖",
          gradient: gradients[i] || "from-purple-500 to-pink-500",
          glow: glows[i] || "shadow-glow-purple",
        }))
      : [];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            <div className="w-16 h-16 bg-white/20 rounded-full mb-3" />
            <div className="w-20 h-4 bg-white/20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
      {features.map((f, i) => (
        <button
          key={i}
          className={`
            group relative
            bg-white/10 backdrop-blur-md 
            rounded-2xl 
            flex flex-col items-center justify-center 
            p-4 sm:p-6
            min-h-[120px] sm:min-h-[140px]
            min-w-[44px]
            text-white font-medium
            border-2 border-white/20
            shadow-lg
            transition-all duration-300 ease-out
            hover:scale-105 hover:shadow-2xl hover:${f.glow}
            active:scale-95
            animate-fade-in
            gpu-accelerated
            ${i === 3 ? 'sm:hidden lg:flex' : ''}
          `}
          style={{
            animationDelay: `${i * 100}ms`,
            animationFillMode: 'backwards'
          }}
          onClick={() => onTopicClick(f.label)}
          aria-label={`${lang === "hi" ? "विषय चुनें" : "Select topic"}: ${f.label}`}
        >
          {/* Gradient icon background */}
          <div className={`
            w-16 h-16 sm:w-20 sm:h-20
            rounded-full 
            bg-gradient-to-br ${f.gradient}
            flex items-center justify-center
            mb-3
            text-2xl sm:text-3xl
            transition-transform duration-300
            group-hover:scale-110
            group-active:scale-90
            gpu-accelerated
          `}
          aria-hidden="true">
            {f.icon}
          </div>
          
          {/* Topic label */}
          <div className="text-sm sm:text-base text-center">
            {f.label}
          </div>
        </button>
      ))}
    </div>
  );
}
