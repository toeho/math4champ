import { useLanguage } from "../hooks/useLanguage";
import { Home, Compass, User, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resetSession } from "../utils/api"; // <-- import here

export default function BottomNav({ setIsChatExpanded }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const handleNavigate = (path, collapseChat = true) => {
    // 🧹 Reset chat session before going anywhere
    resetSession();

    if (collapseChat) setIsChatExpanded(false);
    navigate(path);
  };

  const navItems = [
    {
      icon: <Home size={20} />,
      label: lang === "hi" ? "होम" : "Home",
      action: () => { 
          window.history.replaceState({}, document.title, "/"); 
        window.location.reload(); 
        handleNavigate("/");
      }
    },
    {
      icon: <MessageSquare size={20} />,
      label: lang === "hi" ? "चैट हिस्ट्री" : "Chat History",
      action: () => handleNavigate("/history", false),
    },
    {
      icon: <Compass size={20} />,
      label: lang === "hi" ? "खोजें" : "Explore",
      action: () => handleNavigate("/math"),
    },
    {
      icon: <User size={20} />,
      label: lang === "hi" ? "प्रोफ़ाइल" : "Profile",
      action: () => handleNavigate("/profile"),
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
