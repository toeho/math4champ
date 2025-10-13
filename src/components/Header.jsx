import { useLanguage } from "../hooks/useLanguage";
import { resetSession } from "../utils/api";

export default function Header() {
  const { lang, toggleLang } = useLanguage();

  const handleReset = async () => {
    try {
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
    <div className="flex justify-between items-center bg-white/10 rounded-xl px-3 py-2 shadow select-none">
      {/* Make title clickable */}
      <h1
        onClick={handleReset}
        className="text-lg font-bold text-white cursor-pointer hover:text-orange-300 transition"
        title="Click to reset session"
      >
        📘 Math GPT
      </h1>

      <div className="flex gap-2">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="bg-orange-400 text-white px-2 py-1 rounded-full text-xs font-medium"
        >
          {lang === "hi" ? "अ" : "A"}
        </button>
      </div>
    </div>
  );
}
