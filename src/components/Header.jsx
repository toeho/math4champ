import { useLanguage } from "../hooks/useLanguage";
import { resetSession } from "../utils/api";
import { useState } from "react";

export default function Header() {
  const { lang, toggleLang } = useLanguage();
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);

  const handleReset = async () => {
    try {
      // Trigger bounce animation
      setIsLogoAnimating(true);
      setTimeout(() => setIsLogoAnimating(false), 600);

      // 1. Call backend reset API if it exists
      if (typeof resetSession === "function") {
        await resetSession();
      }

      // 3. Force a *real* React-level reset
      // Instead of full hard reload, use a soft reload that remounts components
      window.location.href = window.location.origin; // ensures total reset
    } catch (error) {
      console.error("Error resetting session:", error);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-4 py-3 shadow-lg animate-pulse-glow select-none">
      {/* Animated gradient background with subtle pulse effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 opacity-50 animate-shimmer bg-[length:200%_100%]"></div>
      
      <div className="relative flex justify-between items-center">
        {/* Logo with bounce animation on click */}
        <div className="flex flex-col gap-1">
          <h1
            onClick={handleReset}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleReset();
              }
            }}
            className={`text-2xl lg:text-3xl font-bold text-white cursor-pointer hover:text-cyan-300 transition-colors duration-200 ${
              isLogoAnimating ? "animate-bounce-in" : ""
            }`}
            style={{
              transform: isLogoAnimating ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            }}
            title="Click to reset session"
            role="button"
            tabIndex={0}
            aria-label="Math GPT - Click to reset session"
          >
            📘 Math GPT
          </h1>
          
          {/* Welcome message with fade-in animation */}
          <p className="text-xs lg:text-sm text-white/80 animate-fade-in animation-delay-300">
            {lang === "hi" ? "गणित सीखने में मज़ा आता है!" : "Learning math is fun!"}
          </p>
        </div>

        {/* Language toggle with smooth transition and slide indicator */}
        <div className="relative">
          <button
            onClick={toggleLang}
            className="relative bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-all duration-200 overflow-hidden min-h-[44px] min-w-[44px]"
            aria-label={`Switch language to ${lang === "hi" ? "English" : "Hindi"}`}
          >
            {/* Slide indicator background */}
            <div
              className={`absolute inset-y-0 w-1/2 bg-cyan-400 rounded-full transition-transform duration-300 ease-out ${
                lang === "hi" ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ left: 0 }}
            ></div>
            
            {/* Language text */}
            <div className="relative flex gap-3 items-center justify-center">
              <span
                className={`transition-all duration-200 ${
                  lang === "hi" ? "text-white font-bold scale-110" : "text-white/70"
                }`}
              >
                अ
              </span>
              <span
                className={`transition-all duration-200 ${
                  lang === "en" ? "text-white font-bold scale-110" : "text-white/70"
                }`}
              >
                A
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
