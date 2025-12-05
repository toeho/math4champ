import axios from "axios";
import { useUser } from "../contexts/UserContext";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      localStorage.setItem("session_id", currentSessionId);
    }

    const payload = {
      text: input.text || "",
      image: input.image?.data || null,
      time_taken: input.time_taken || 0, // ⏱️ added here
      sender: "user",
      session_id: currentSessionId,
    };
console.log(payload)
    if (!username) throw new Error("Username is required");

    const response = await postRequest(`/chat/send/instant/${username}`, payload);
    const botMessage = response.bot_message?.text || "No reply.";

    return {
      candidates: [{ content: { parts: [{ text: botMessage }] } }],
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
  // trigger re-render of Home
};

// Allow other modules to explicitly set the current session id
export const setSessionId = (id) => {
  if (!id) return;
  currentSessionId = id;
  try {
    localStorage.setItem("session_id", id);
  } catch (e) {
    // ignore storage errors
  }
};

export const getSessionId = () => currentSessionId;
export const sendCheckRequest = async (input, username) => {
  try {
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      localStorage.setItem("session_id", currentSessionId);
    }

    const payload = {
      text: input.text || "",
      image: input.image?.data || null,
      time_taken: input.time_taken || 0,
      sender: "user",
      session_id: currentSessionId,
    };

    const response = await postRequest(`/chat/send/check/${username}`, payload);
    return response; // expect { bot_message: "...text..." }
  } catch (error) {
    console.error("❌ Check Request failed:", error);
    throw error;
  }
};
