// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { LanguageProvider } from "./contexts/LanguageContext";
import { UserProvider } from "./contexts/UserContext";
import { HistoryProvider } from "./contexts/HistoryContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <UserProvider>
        <HistoryProvider>
          <App />
        </HistoryProvider>
      </UserProvider>
    </LanguageProvider>
  </StrictMode>
);
