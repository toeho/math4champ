import { useLanguage } from "../components/LanguageContext";
import { Home, Compass, User, Infinity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BottomNav({ setIsChatExpanded }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const navItems = lang === "hi"
    ? [
        { 
          icon: <Home size={20} />, 
          label: "होम", 
          action: () => {
            setIsChatExpanded(false);
            navigate("/");
          } 
        },
        { icon: <Infinity size={20} />, label: "गणित", action: () => navigate("/math") },
        { icon: <Compass size={20} />, label: "एक्सप्लोर", action: () => navigate("/explore") },
        { icon: <User size={20} />, label: "प्रोफ़ाइल", action: () => navigate("/profile") },
      ]
    : [
        { 
          icon: <Home size={20} />, 
          label: "Home", 
          action: () => {
            setIsChatExpanded(false);
            navigate("/");
          } 
        },
        { icon: <Infinity size={20} />, label: "Math", action: () => navigate("/math") },
        { icon: <Compass size={20} />, label: "Explore", action: () => navigate("/explore") },
        { icon: <User size={20} />, label: "Profile", action: () => navigate("/profile") },
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
