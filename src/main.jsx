import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"
import App from "./App.jsx";
import { UserProvider } from "./contexts/UserContext";
import { LanguageProvider } from "./contexts/LanguageProvider";
import { HistoryProvider } from "./contexts/HistoryProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <LanguageProvider>
        <HistoryProvider>
          <App />
        </HistoryProvider>
      </LanguageProvider>
    </UserProvider>
  </React.StrictMode>
);
