import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Mic, User, Home } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

export default function ParentHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang } = useLanguage();

  const navLinks = [
    {
      icon: <LayoutDashboard size={18} aria-hidden="true" />,
      label: lang === "hi" ? "डैशबोर्ड" : "Dashboard",
      path: "/parent/dashboard",
    },
    {
      icon: <Mic size={18} aria-hidden="true" />,
      label: lang === "hi" ? "वॉयस असिस्टेंट" : "Voice Assistant",
      path: "/parent/voice",
    },
    {
      icon: <User size={18} aria-hidden="true" />,
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
              {lang === "hi" ? "अपने बच्चे की प्रगति देखें" : "Monitor your child's progress"}
            </p>
          </div>

          {/* Controls section with home link and language toggle */}
          <div className="flex items-center gap-3">
            {/* Home Link */}
            <a
              href="/"
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-all duration-200 min-h-[44px] flex items-center gap-2"
              aria-label="Go to Student Home"
            >
              <Home size={18} aria-hidden="true" />
              <span className="hidden sm:inline">{lang === "hi" ? "होम" : "Home"}</span>
            </a>

            {/* Language toggle with smooth transition and slide indicator */}
            <div className="relative">
              <button
                onClick={toggleLang}
                className="relative bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-all duration-200 overflow-hidden min-h-[44px] min-w-[44px]"
                aria-label={`Switch language to ${lang === "hi" ? "English" : "Hindi"}`}
              >
                {/* Slide indicator background */}
                <div
                  className={`absolute inset-y-0 w-1/2 bg-cyan-400 rounded-full transition-transform duration-300 ease-out ${
                    lang === "hi" ? "translate-x-0" : "translate-x-full"
                  }`}
                  style={{ left: 0 }}
                ></div>
                
                {/* Language text */}
                <div className="relative flex gap-3 items-center justify-center">
                  <span
                    className={`transition-all duration-200 ${
                      lang === "hi" ? "text-white font-bold scale-110" : "text-white/70"
                    }`}
                  >
                    अ
                  </span>
                  <span
                    className={`transition-all duration-200 ${
                      lang === "en" ? "text-white font-bold scale-110" : "text-white/70"
                    }`}
                  >
                    A
                  </span>
                </div>
              </button>
            </div>
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
