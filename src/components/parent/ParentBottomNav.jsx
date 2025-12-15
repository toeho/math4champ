import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Mic, User } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

export default function ParentBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();

  const navLinks = [
    {
      icon: LayoutDashboard,
      label: lang === "hi" ? "डैशबोर्ड" : "Dashboard",
      path: "/parent/dashboard",
    },
    {
      icon: Mic,
      label: lang === "hi" ? "वॉयस" : "Voice",
      path: "/parent/voice",
    },
    {
      icon: User,
      label: lang === "hi" ? "प्रोफाइल" : "Profile",
      path: "/parent/profile",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleKeyDown = (e, path) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigation(path);
    }
  };

  return (
    <nav
      className="sm:hidden mt-4 bg-white/10 backdrop-blur-md rounded-xl shadow-lg"
      role="navigation"
      aria-label="Parent portal mobile navigation"
    >
      <div className="flex justify-around items-center px-2 py-2">
        {navLinks.map((link, index) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;

          return (
            <button
              key={index}
              onClick={() => handleNavigation(link.path)}
              onKeyDown={(e) => handleKeyDown(e, link.path)}
              className={`
                flex flex-col items-center justify-center gap-1 
                px-4 py-2 rounded-lg min-w-[48px] min-h-[48px]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-600
                ${isActive
                  ? 'bg-white/30 text-white'
                  : 'text-white/70 hover:bg-white/20 hover:text-white active:bg-white/25'
                }
              `}
              aria-label={`Navigate to ${link.label}`}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
            >
              <Icon 
                size={24} 
                aria-hidden="true"
                className={isActive ? 'stroke-[2.5]' : 'stroke-2'}
              />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {link.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
