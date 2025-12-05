// src/contexts/ParentContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  registerParent,
  loginParent,
  fetchParentStats,
  sendParentFeedback,
  getParentToken,
  clearParentToken,
} from "../utils/parentApi";
import { registerNotificationHandler } from "../utils/parentErrorHandler";

export const ParentContext = createContext();

export function useParent() {
  return useContext(ParentContext);
}

export function ParentProvider({ children }) {
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Register notification handler on mount
  useEffect(() => {
    registerNotificationHandler((message, type, duration) => {
      if (window.showParentNotification) {
        window.showParentNotification(message, type, duration);
      }
    });
  }, []);

  // Automatic token validation on app mount
  useEffect(() => {
    (async () => {
      const token = getParentToken();
      if (token) {
        try {
          // Validate token by fetching stats
          const statsData = await fetchParentStats(token);
          if (statsData) {
            // Extract parent info from stats if available
            setParent({
              authenticated: true,
              student_username: statsData.child?.username,
            });
            setStats(statsData);
          }
        } catch (error) {
          // Token is invalid or expired
          console.error("Token validation failed:", error);
          clearParentToken();
          setParent(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  // REGISTER
  const register = async (parentData) => {
    try {
      const data = await registerParent(parentData);
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message || "Registration failed" };
    }
  };

  // LOGIN
  const login = async (username, password) => {
    try {
      const data = await loginParent({ username, password });

      if (data.access_token) {
        // Fetch stats to get parent and child information
        const statsData = await fetchParentStats(data.access_token);
        
        setParent({
          authenticated: true,
          username,
          student_username: statsData.child?.username,
        });
        setStats(statsData);
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Login failed" };
    }
  };

  // LOGOUT
  const logout = () => {
    clearParentToken();
    setParent(null);
    setStats(null);
  };

  // FETCH STATS
  const fetchStats = async () => {
    const token = getParentToken();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    setStatsLoading(true);
    try {
      const statsData = await fetchParentStats(token);
      setStats(statsData);
      return { success: true, data: statsData };
    } catch (err) {
      // Handle token expiration
      if (err.message.includes("Session expired") || err.message.includes("401")) {
        logout();
        return { success: false, message: "Session expired. Please login again.", expired: true };
      }
      return { success: false, message: err.message || "Failed to fetch stats" };
    } finally {
      setStatsLoading(false);
    }
  };

  // SEND FEEDBACK
  const sendFeedback = async (message) => {
    const token = getParentToken();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    try {
      const response = await sendParentFeedback(message, token);
      return { success: true, data: response };
    } catch (err) {
      // Handle token expiration
      if (err.message.includes("Session expired") || err.message.includes("401")) {
        logout();
        return { success: false, message: "Session expired. Please login again.", expired: true };
      }
      return { success: false, message: err.message || "Failed to send feedback" };
    }
  };

  return (
    <ParentContext.Provider
      value={{
        parent,
        loading,
        stats,
        statsLoading,
        register,
        login,
        logout,
        fetchStats,
        sendFeedback,
      }}
    >
      {children}
    </ParentContext.Provider>
  );
}
