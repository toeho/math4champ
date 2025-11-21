// src/contexts/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { fetchUser, saveUser, loginUser, signupUser } from "../utils/userApi";

export const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const u = await fetchUser(token);
        if (u) setUser(u);
      }
      setLoading(false);
    })();
  }, []);

  // LOGIN
  const login = async (username, password) => {
    try {
      const data = await loginUser({ username, password });

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;

        const u = await fetchUser(data.access_token);
        setUser(u);
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Login failed" };
    }
  };

  // SIGNUP
  const signup = async (username, password, classLevel) => {
    try {
      const payload = {
        username,
        password,
        name: username,
        level: 1,
        email: "",
        avatar: "",
        class_level: classLevel,  // ⬅️ NEW
        age: null,
        school: "",
      };

      const data = await signupUser(payload);
      if (data) return await login(username, password);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Signup failed" };
    }
  };

  // UPDATE USER
  const updateUser = async (updates) => {
    const token = localStorage.getItem("token");
    if (!user || !token) return null;

    const payload = {
      ...updates,
      class_level: updates.classLevel, // map camelCase → snake_case
    };

    delete payload.classLevel;

    const updated = await saveUser(payload, token);
    if (updated) setUser(updated);

    return updated;
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
