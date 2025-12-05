import { useState, useEffect } from 'react';
import Notification from './Notification';
import { registerNotificationHandler } from '../../utils/parentErrorHandler';

/**
 * NotificationContainer Component
 * Manages multiple notifications and provides a global notification system
 */
export default function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Register the notification handler
    registerNotificationHandler((message, type, duration) => {
      const id = Date.now() + Math.random();
      const newNotification = { id, message, type, duration };
      
      setNotifications(prev => [...prev, newNotification]);
    });
  }, []);

  const handleClose = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {notifications.map((notification, index) => (
        <div key={notification.id} className="pointer-events-auto" style={{ marginTop: `${index * 80}px` }}>
          <Notification
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => handleClose(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}
