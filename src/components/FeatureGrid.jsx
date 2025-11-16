import { useEffect, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export default function FeatureGrid({ onTopicClick }) {
  const { lang } = useLanguage();
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/topics/`);
        if (!res.ok) throw new Error("Failed to fetch topics");
        const data = await res.json();
        setTopics(data);
      } catch (err) {
        console.error("Error fetching topics:", err);
      }
    };
    fetchTopics();
  }, []);

  const icons = ["123", "+", "−", "⬤"];

  const features =
    topics.length > 0
      ? topics.map((topic, i) => ({
          label: lang === "hi"
            ? ["संख्याएँ", "जोड़", "घटाव", "आकार"][i] || topic
            : topic,
          icon: icons[i] || "❖",
        }))
      : [];

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {features.map((f, i) => (
        <button
          key={i}
          className="bg-white/10 rounded-xl flex flex-col items-center justify-center p-3 shadow text-white text-sm font-medium hover:bg-white/20 transition"
          onClick={() => onTopicClick(f.label)} // 👈 send clicked topic
        >
          <div className="text-lg mb-1">{f.icon}</div>
          <div>{f.label}</div>
        </button>
      ))}
    </div>
  );
}
