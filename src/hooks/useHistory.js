import { useContext } from "react";
import { HistoryContext } from "../contexts/HistoryContext";

export function useHistoryStore() {
  return useContext(HistoryContext);
}