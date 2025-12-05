import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Mic, User } from "lucide-react";

export default function ParentHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    {
      icon: <LayoutDashboard size={18} aria-hidden="true" />,
      label: "Dashboard",
      path: "/parent/dashboard",
    },
    {
      icon: <Mic size={18} aria-hidden="true" />,
      label: "Voice Assistant",
      path: "/parent/voice",
    },
    {
      icon: <User size={18} aria-hidden="true" />,
      label: "Profile",
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
    <header 
      className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl px-4 py-3 shadow-lg animate-pulse-glow select-none"
      role="banner"
    >
      {/* Animated gradient background with subtle pulse effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 opacity-50 animate-shimmer bg-[length:200%_100%]"></div>
      
      <div className="relative flex flex-col gap-3">
        {/* Logo and branding */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1
              className="text-2xl lg:text-3xl font-bold text-white"
              id="parent-portal-title"
            >
              👨‍👩‍👧 Parent Portal
            </h1>
            
            {/* Welcome message with fade-in animation */}
            <p className="text-xs lg:text-sm text-white/80 animate-fade-in animation-delay-300">
              Monitor your child's progress
            </p>
          </div>
        </div>

        {/* Navigation links - Desktop/Tablet only (mobile uses bottom nav) */}
        <nav 
          className="hidden sm:flex gap-2" 
          aria-label="Parent portal navigation"
          role="navigation"
        >
          {navLinks.map((link, index) => {
            const isActive = location.pathname === link.path;
            
            return (
              <button
                key={index}
                onClick={() => handleNavigation(link.path)}
                onKeyDown={(e) => handleKeyDown(e, link.path)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  transition-all duration-200 min-h-[44px]
                  focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-600
                  ${isActive 
                    ? 'bg-white/30 text-white font-semibold shadow-md' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }
                `}
                aria-label={`Navigate to ${link.label}`}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={0}
              >
                {link.icon}
                <span className="text-sm">{link.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
