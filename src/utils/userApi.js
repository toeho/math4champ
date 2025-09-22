// src/utils/userApi.js
const LOCAL_FILE = "/mock/user.json";
const API_URL = import.meta.env.VITE_API_URL || "https://your-server.com/api/user";
const MAKE_CALL = import.meta.env.VITE_API_CALL === "true"; // boolean flag

// GET user
export async function fetchUser() {
  try {
    // Local cache always preferred first
    const cached = localStorage.getItem("user");
    if (cached) {
      console.log("✅ Loaded from localStorage");
      return JSON.parse(cached);
    }

    if (!MAKE_CALL) {
      // Load from local mock JSON
      const res = await fetch(LOCAL_FILE);
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Loaded from local JSON");
        return data;
      }
      throw new Error("Local JSON not found");
    }

    // Otherwise call real API
    console.log("🌐 Fetching from API...");
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API fetch failed");
    return await res.json();
  } catch (err) {
    console.error("❌ fetchUser error:", err);
    return null;
  }
}

// SAVE user
export async function saveUser(userData) {
  try {
    if (!MAKE_CALL) {
      // Save locally
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("✅ Saved to localStorage");
      return userData;
    }

    // Save to API
    console.log("🌐 Saving to API...");
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error("API save failed");
    return await res.json();
  } catch (err) {
    console.error("❌ saveUser error:", err);
    return null;
  }
}
