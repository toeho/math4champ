// src/utils/fetchData.js
const BASE_URL =  import.meta.env.VITE_API_URL || "http://localhost:8000";
 // update as per your FastAPI URL

export async function getUserChats(username) {
  try {
    console.log(username)
    const res = await fetch(`${BASE_URL}/chat/user/${username}`);
    if (!res.ok) throw new Error("Failed to fetch user chats");
    const data = await res.json();
    console.log("✅ Loaded chats for", username, data);
    return data;
  } catch (err) {
    console.error("❌ Error loading user chats:", err);
    return [];
  }
}

export async function getChatsBySession(sessionId) {
  try {
    const res = await fetch(`${BASE_URL}/chat/session/${sessionId}`);
    if (!res.ok) throw new Error("Failed to fetch session chats");
    const data = await res.json();
    console.log("✅ Loaded chats by session");
    return data;
  } catch (err) {
    console.error("❌ Error loading session chats:", err);
    return [];
  }
}
