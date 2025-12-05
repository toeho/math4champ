import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Notification Component
 * Displays toast-style notifications for user feedback
 */
export default function Notification({ message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: 'bg-green-500',
      icon: CheckCircle,
      text: 'text-white',
    },
    error: {
      bg: 'bg-red-500',
      icon: AlertCircle,
      text: 'text-white',
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: AlertTriangle,
      text: 'text-white',
    },
    info: {
      bg: 'bg-blue-500',
      icon: Info,
      text: 'text-white',
    },
  };

  const style = typeStyles[type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 ${style.bg} ${style.text} 
                  px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md
                  transition-all duration-300 ${
                    isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
                  }`}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

/**
 * NotificationContainer Component
 * Manages multiple notifications in a stack
 */
export function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Register the notification handler globally
    window.showParentNotification = (message, type = 'info', duration = 5000) => {
      const id = Date.now() + Math.random();
      setNotifications((prev) => [...prev, { id, message, type, duration }]);
    };

    return () => {
      delete window.showParentNotification;
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
