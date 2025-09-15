import { useLanguage } from "../components/LanguageContext";
import { Home, Compass, User, Infinity} from "lucide-react"; // ✅ import Infinity

export default function BottomNav({ setIsChatExpanded }) {
  const { lang } = useLanguage();

  const navItems = lang === "hi"
    ? [
        { icon: <Home size={20} />, label: "होम", action: () => setIsChatExpanded(false) },
        { icon: <Infinity size={20} />, label: "गणित" }, // ✅ use Infinity for Math
        { icon: <Compass size={20} />, label: "एक्सप्लोर" },
        { icon: <User size={20} />, label: "प्रोफ़ाइल" },
      ]
    : [
        { icon: <Home size={20} />, label: "Home", action: () => setIsChatExpanded(false) },
        { icon: <Infinity size={20} />, label: "Math" }, // ✅ use Infinity for Math
        { icon: <Compass size={20} />, label: "Explore" },
        { icon: <User size={20} />, label: "Profile" },
      ];

  return (
    <div className="flex justify-around items-center bg-white/10 rounded-xl py-1 mt-2 text-white text-xs">
      {navItems.map((n, i) => (
        <button
          key={i}
          className="flex flex-col items-center hover:text-orange-400"
          onClick={n.action}
        >
          <div>{n.icon}</div>
          <span className="mt-0.5">{n.label}</span>
        </button>
      ))}
    </div>
  );
}
