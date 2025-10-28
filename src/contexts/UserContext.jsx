// src/components/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { fetchUser, saveUser, loginUser, signupUser } from "../utils/userApi";

export const UserContext = createContext();

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside a UserProvider");
  return context;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check for JWT in localStorage and fetch user
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const u = await fetchUser(token);
        if (u) setUser(u);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    try {
      const data = await loginUser({ username, password });
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        const u = await fetchUser(data.access_token);
        setUser(u);
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Login failed" };
    }
  };

// UserProvider.jsx -> signup
const signup = async (username, password) => {
  try {
    const data = await signupUser({
      username,
      password,
      name: username,
      level: 1,
      email: "",
      avatar: "",
      class_level: "",
      age: null,  // ✅ null not ""
      school: "",
    });
    console.log("Payload sent to backend:", {
  username,
  password,
  name: username,
  level: 1,
  email: "",
  avatar: "",
  class_level: "",
  age: null,
  school: ""
});

    if (data) {
      return await login(username, password);
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Signup failed" };
  }
};


const updateUser = async (updates) => {
  const token = localStorage.getItem("token");
  if (!user || !token) return null;

  // Convert frontend camelCase → backend snake_case
  const payload = {
    ...updates,
    class_level: updates.classLevel, // ✅ map key
  };
  delete payload.classLevel; // remove duplicate

  const updated = await saveUser(payload, token);
  if (updated) setUser(updated);
  return updated;
};


  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}
