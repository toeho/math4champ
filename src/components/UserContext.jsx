// src/components/UserContext.jsx
import { createContext, useState, useContext } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState({});

  const signup = (username, password) => {
    if (users[username]) {
      return { success: false, message: "User already exists" };
    }
    const newUser = {
      password,
      classLevel: "Class 1",
      level: 1,
      email: "",
      age: "",
      school: "",
      avatar: null, // 👈 added avatar
    };
    setUsers((prev) => ({ ...prev, [username]: newUser }));
    setUser({ name: username, ...newUser });
    return { success: true };
  };

  const login = (username, password) => {
    if (users[username] && users[username].password === password) {
      setUser({ name: username, ...users[username] });
      return { success: true };
    }
    return { success: false, message: "Invalid credentials" };
  };

  const updateUser = (updates) => {
    if (!user) return;
    setUsers((prev) => ({
      ...prev,
      [user.name]: { ...prev[user.name], ...updates },
    }));
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, users, signup, login, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
