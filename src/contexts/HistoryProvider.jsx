import { useState } from "react";
import { HistoryContext } from "./HistoryContext";

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);

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
