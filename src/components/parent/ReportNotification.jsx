// src/components/parent/ReportNotification.jsx
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export default function ReportNotification({ type, message, onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!message) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-300 ease-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        rounded-xl shadow-2xl backdrop-blur-lg border p-4 flex items-start gap-3
        ${type === 'success' 
          ? 'bg-green-500/20 border-green-500/50 text-green-100' 
          : 'bg-red-500/20 border-red-500/50 text-red-100'
        }
      `}>
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
        </div>
        
        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors duration-200"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}