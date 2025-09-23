import { useLanguage } from "../hooks/useLanguage";

export default function FeatureGrid() {
  const { lang } = useLanguage();

  const features = [
    { label: lang === "hi" ? "संख्याएँ" : "Numbers", icon: "123" },
    { label: lang === "hi" ? "जोड़" : "Addition", icon: "+" },
    { label: lang === "hi" ? "घटाव" : "Subtraction", icon: "−" },
    { label: lang === "hi" ? "आकार" : "Shapes", icon: "⬤" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {features.map((f, i) => (
        <button key={i} className="bg-white/10 rounded-xl flex flex-col items-center justify-center p-3 shadow text-white text-sm font-medium hover:bg-white/20 transition">
          <div className="text-lg mb-1">{f.icon}</div>
          <div>{f.label}</div>
        </button>
      ))}
    </div>
  );
}
