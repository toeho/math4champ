import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { LanguageProvider } from "./components/LanguageContext";
import { UserProvider } from "./components/UserContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </LanguageProvider>
  </StrictMode>
);
