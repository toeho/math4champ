import { useLanguage } from "../components/LanguageContext";

export default function FeatureGrid() {
  const { lang } = useLanguage();

  const features = lang === "hi"
    ? [
        { label: "संख्याएँ", icon: "123" },
        { label: "जोड़", icon: "+" },
        { label: "घटाव", icon: "−" },
        { label: "आकार", icon: "⬤" },
      ]
    : [
        { label: "Numbers", icon: "123" },
        { label: "Addition", icon: "+" },
        { label: "Subtraction", icon: "−" },
        { label: "Shapes", icon: "⬤" },
      ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {features.map((f, i) => (
        <button
          key={i}
          className="bg-white/10 rounded-xl flex flex-col items-center justify-center p-3 shadow text-white text-sm font-medium hover:bg-white/20 transition"
        >
          <div className="text-lg mb-1">{f.icon}</div>
          {f.label}
        </button>
      ))}
    </div>
  );
}
