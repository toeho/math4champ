import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Mic, User, FileText } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { useParent } from "../../contexts/ParentContext";
import { generateParentReport } from "../../utils/parentApi";
import { useState } from "react";
import ReportNotification from "./ReportNotification";

export default function ParentBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const { parent } = useParent();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [notification, setNotification] = useState(null);

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
      icon: FileText,
      label: lang === "hi" ? "रिपोर्ट" : "Report",
      action: "generate-report",
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

  const handleGenerateReport = async () => {
    if (!parent || isGeneratingReport) return;

    setIsGeneratingReport(true);
    try {
      const token = localStorage.getItem("parentToken");
      if (!token) {
        navigate("/parent/login");
        return;
      }

      await generateParentReport(token);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: lang === "hi" 
          ? "रिपोर्ट सफलतापूर्वक भेजी गई! कृपया अपना ईमेल चेक करें।" 
          : "Report sent successfully! Please check your email."
      });
    } catch (error) {
      console.error("Error generating report:", error);
      setNotification({
        type: 'error',
        message: lang === "hi" 
          ? "रिपोर्ट भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।" 
          : "Error sending report. Please try again."
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAction = (link) => {
    if (link.action === "generate-report") {
      handleGenerateReport();
    } else if (link.path) {
      handleNavigation(link.path);
    }
  };

  const handleKeyDown = (e, link) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction(link);
    }
  };

  return (
    <>
      <nav
        className="sm:hidden mt-4 bg-white/10 backdrop-blur-md rounded-xl shadow-lg"
        role="navigation"
        aria-label="Parent portal mobile navigation"
      >
      <div className="flex justify-around items-center px-2 py-2">
        {navLinks.map((link, index) => {
          const isActive = location.pathname === link.path;
          const isGenerateReport = link.action === "generate-report";
          const Icon = link.icon;

          return (
            <button
              key={index}
              onClick={() => handleAction(link)}
              onKeyDown={(e) => handleKeyDown(e, link)}
              disabled={isGenerateReport && isGeneratingReport}
              className={`
                flex flex-col items-center justify-center gap-1 
                px-2 py-2 rounded-lg min-w-[48px] min-h-[48px]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-600
                ${isActive
                  ? 'bg-white/30 text-white'
                  : isGenerateReport && isGeneratingReport
                  ? 'bg-white/5 text-white/50 cursor-not-allowed'
                  : 'text-white/70 hover:bg-white/20 hover:text-white active:bg-white/25'
                }
              `}
              aria-label={isGenerateReport 
                ? (lang === "hi" ? "रिपोर्ट जेनरेट करें" : "Generate Report")
                : `Navigate to ${link.label}`
              }
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
            >
              {isGenerateReport && isGeneratingReport ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <Icon 
                  size={24} 
                  aria-hidden="true"
                  className={isActive ? 'stroke-[2.5]' : 'stroke-2'}
                />
              )}
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {isGenerateReport && isGeneratingReport 
                  ? (lang === "hi" ? "भेजा जा रहा..." : "Sending...")
                  : link.label
                }
              </span>
            </button>
          );
        })}
      </div>
    </nav>

    {/* Notification */}
    {notification && (
      <ReportNotification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(null)}
      />
    )}
    </>
  );
}
