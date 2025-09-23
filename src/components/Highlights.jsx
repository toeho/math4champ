import { useLanguage } from "./LanguageContext";

export default function Highlights() {
  const { lang } = useLanguage();

  const highlights = [
    lang === "hi" ? "बड़े टच टारगेट्स" : "Large Touch Targets",
    lang === "hi" ? "साफ़ दृश्य पदानुक्रम" : "Clear Visual Hierarchy",
    lang === "hi" ? "सहज नेविगेशन" : "Intuitive Navigation",
    lang === "hi" ? "प्रगति संकेतक" : "Progress Indicators",
    lang === "hi" ? "चैट इंटरफ़ेस" : "Chat Interface",
    lang === "hi" ? "हिंदी भाषा समर्थन" : "Hindi Language Support",
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {highlights.map((h, i) => (
        <span key={i} className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{h}</span>
      ))}
    </div>
  );
}
