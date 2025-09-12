import { Home, Compass, User } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";

export default function BottomNav() {
  const { lang } = useLanguage();

  const navItems = lang === "hi"
    ? [
        { icon: <Home size={18} />, label: "होम" },
        { icon: "👁", label: "गणित" },
        { icon: <Compass size={18} />, label: "एक्सप्लोर" },
        { icon: <User size={18} />, label: "प्रोफ़ाइल" },
      ]
    : [
        { icon: <Home size={18} />, label: "Home" },
        { icon: "👁", label: "Math" },
        { icon: <Compass size={18} />, label: "Explore" },
        { icon: <User size={18} />, label: "Profile" },
      ];

  return (
    <div className="flex justify-around items-center bg-white/10 rounded-xl py-1 mt-2 text-white text-xs">
      {navItems.map((n, i) => (
        <button
          key={i}
          className="flex flex-col items-center hover:text-orange-400"
        >
          <div>{n.icon}</div>
          <span className="mt-0.5">{n.label}</span>
        </button>
      ))}
    </div>
  );
}
