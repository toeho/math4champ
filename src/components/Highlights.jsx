import { useLanguage } from "../components/LanguageContext";

export default function Highlights() {
  const { lang } = useLanguage();

  const highlights = lang === "hi"
    ? [
        "बड़े टच टारगेट्स",
        "साफ़ दृश्य पदानुक्रम",
        "सहज नेविगेशन",
        "प्रगति संकेतक",
        "चैट इंटरफ़ेस",
        "हिंदी भाषा समर्थन",
      ]
    : [
        "Large Touch Targets",
        "Clear Visual Hierarchy",
        "Intuitive Navigation",
        "Progress Indicators",
        "Chat Interface",
        "Hindi Language Support",
      ];

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {highlights.map((h, i) => (
        <span
          key={i}
          className="bg-white/10 text-white text-xs px-3 py-1 rounded-full"
        >
          {h}
        </span>
      ))}
    </div>
  );
}
