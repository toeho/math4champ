// src/components/HistoryContext.jsx
import { createContext, useState, useContext } from "react";

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]); 
  // each item = { id, title, messages }

  const addConversation = (messages) => {
    const id = Date.now();
    const title = messages[0]?.text?.slice(0, 20) || "New Chat";
    setHistory((prev) => [{ id, title, messages }, ...prev]);
  };

  return (
    <HistoryContext.Provider value={{ history, addConversation }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistoryStore() {
  return useContext(HistoryContext);
}
