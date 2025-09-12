import { useLanguage } from "../components/LanguageContext";

export default function Header() {
  const { lang, toggleLang } = useLanguage();

  return (
    <div className="flex justify-between items-center bg-white/10 rounded-xl px-3 py-2 shadow">
      <h1 className="text-lg font-bold text-white">📘 Math GPT</h1>
      <button
        onClick={toggleLang}
        className="bg-orange-400 text-white px-2 py-1 rounded-full text-xs font-medium"
      >
        {lang === "hi" ? "अ" : "A"}
      </button>
    </div>
  );
}
