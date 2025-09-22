// src/utils/fetchData.js

// Mock local JSON file (placed in public/mock/data.json)
const LOCAL_JSON = "/mock/data.json";

// API fallback endpoint
const API_URL = "https://your-server.com/api/data";

export async function fetchData() {
  try {
    // Try reading from local JSON file first
    const localResponse = await fetch(LOCAL_JSON);

    if (localResponse.ok) {
      const data = await localResponse.json();
      console.log("✅ Loaded from local JSON");
      return data;
    } else {
      throw new Error("Local JSON not found");
    }
  } catch (err) {
    console.warn("⚠️ Local JSON missing, falling back to API...", err);

    // Fallback → actual API call
    try {
      const apiResponse = await fetch(API_URL);
      if (!apiResponse.ok) {
        throw new Error("API request failed");
      }
      const data = await apiResponse.json();
      console.log("✅ Loaded from server API");
      return data;
    } catch (apiErr) {
      console.error("❌ Failed to fetch data:", apiErr);
      return null; // or throw apiErr if you want error propagation
    }
  }
}

