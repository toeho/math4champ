import { useState } from "react";
import { LanguageContext } from "./LanguageContext";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  const toggleLang = () => setLang((prev) => (prev === "hi" ? "en" : "hi"));

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
