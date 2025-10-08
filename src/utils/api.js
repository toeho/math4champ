import axios from "axios";
import prompt from "../prompts/mathPrompt.json";

// ✅ Your FastAPI backend URL (set this in .env)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Create an Axios instance for backend
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

// --- Send message to FastAPI backend ---
export const sendToGemini = async (input) => {
  try {
    // Prepare payload — if image exists, include base64 string
    const payload = {
      text: input.text ? `${input.text} ${prompt.math_prompt}` : prompt.math_prompt,
      image: input.image?.data || null, // ensure we send raw base64 if image present
      sender: "user",
    };

    // 👇 Send to FastAPI backend
    const response = await postRequest("/chat/send", payload);

    // ✅ Extract Gemini’s bot message (backend returns chat with messages)
    const botMessage =
      response.messages?.find((m) => m.sender === "bot")?.text ||
      "No reply.";

    // ✅ Return structure consistent with frontend logic
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
