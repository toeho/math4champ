import axios from "axios";
import { useUser } from "../contexts/UserContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const backendApi = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Generic requests ---
export const getRequest = async (url, params = {}) => {
  const response = await backendApi.get(url, { params });
  return response.data;
};

export const postRequest = async (url, data = {}, params = {}) => {
  const response = await backendApi.post(url, data, { params });
  return response.data;
};

// 🧩 Session Management
let currentSessionId = localStorage.getItem("session_id") || null;

// --- Send message to FastAPI backend using username ---
export const sendToGemini = async (input, username) => {
  try {
    // Load or create session ID
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      localStorage.setItem("session_id", currentSessionId);
    }

    const payload = {
      text: input.text || "",
      image: input.image?.data || null,
      sender: "user",
      session_id: currentSessionId, // ✅ attach session ID
    };

    if (!username) throw new Error("Username is required to send messages");

    // Call backend with username as path variable
    const response = await postRequest(`/chat/send/instant/${username}`, payload);
    console.log(response)

    const botMessage =
      response.bot_message.text || "No reply.";

    return {
      candidates: [
        {
          content: {
            parts: [{ text: botMessage }],
          },
        },
      ],
    };
  } catch (error) {
    console.error("❌ Backend call failed:", error);
    throw error;
  }
};

export const resetSession = () => {
  currentSessionId = null;

  // 🧹 Clean all storage
  localStorage.removeItem("session_id");
  localStorage.removeItem("chatMessages");
  sessionStorage.clear();

  console.log("🔄 Chat session reset successfully");

  // ✅ Force navigation reset (not just reload)
  window.history.replaceState({}, document.title, "/"); // clear React Router state
  window.location.reload(); // trigger re-render of Home
};
