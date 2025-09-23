import { useLanguage } from "../hooks/useLanguage";
import { Home, Compass, User, Infinity, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BottomNav({ setIsChatExpanded }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    {
      icon: <Home size={20} />,
      label: lang === "hi" ? "होम" : "Home",
      action: () => {
        setIsChatExpanded(false);
        navigate("/");
      },
    },
    {
      icon: <MessageSquare size={20} />,
      label: lang === "hi" ? "चैट हिस्ट्री" : "Chat History",
      action: () => navigate("/history"),
    },
    {
      icon: <Compass size={20} />,
      label: lang === "hi" ? "खोजें" : "Explore",
      action: () => navigate("/math"),
    },
    {
      icon: <User size={20} />,
      label: lang === "hi" ? "प्रोफ़ाइल" : "Profile",
      action: () => navigate("/profile"),
    },
  ];

  return (
    <div className="flex justify-around items-center bg-white/10 rounded-xl py-1 mt-2 text-white text-xs">
      {navItems.map((n, i) => (
        <button
          key={i}
          onClick={n.action}
          className="flex flex-col items-center hover:text-orange-400 transition-colors"
          aria-label={n.label}
        >
          <div>{n.icon}</div>
          <span className="mt-0.5">{n.label}</span>
        </button>
      ))}
    </div>
  );
}
