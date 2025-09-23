// src/components/UserContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { fetchUser, saveUser, loginUser, signupUser } from "../utils/userApi";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    (async () => {
      const u = await fetchUser();
      if (u) setUser(u);
      setLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    try {
      const data = await loginUser({ username, password });
      setUser(data.user || data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Login failed" };
    }
  };

  const signup = async ({ name, username, password }) => {
    try {
      const data = await signupUser({ name, username, password });
      setUser(data.user || data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Signup failed" };
    }
  };

  const updateUserContext = async (updates) => {
    if (!user) return null;
    const updated = await saveUser({ ...user, ...updates });
    if (updated) setUser(updated);
    return updated;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        updateUser: updateUserContext,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}