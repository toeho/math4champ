// src/components/UserContext.jsx
import { createContext, useState, useContext } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Dummy credentials for demo
  const VALID_USER = { username: "student", password: "1234" };

  const login = (username, password) => {
    if (username === VALID_USER.username && password === VALID_USER.password) {
      setUser({ name: username, classLevel: "Class 3", level: 2 });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
