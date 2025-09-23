import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

export function useLanguage() {
  return useContext(LanguageContext);
}