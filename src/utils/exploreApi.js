// src/api/ExploreApi.js
import axios from "axios";

// Flag from .env
const useApi = import.meta.env.VITE_EXPLORE_CALL === "true";

// Backend API base
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Fetch Explore Data
export async function getExploreData() {
  try {
    if (useApi) {
      // Call actual backend
      const res = await axios.get(`${API_BASE_URL}/explore`);
      return res.data;
    } else {
      // Load mock data
      const res = await fetch("/mock/explore.json");
      if (!res.ok) throw new Error("Failed to load mock explore.json");
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching explore data:", error);
    return null;
  }
}
