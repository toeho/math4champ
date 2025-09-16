import axios from "axios";
import prompt from "../prompts/mathPrompt.json";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  if (!config.params) config.params = {};
  config.params.key = API_KEY;
  return config;
});

// Requests
export const getRequest = async (url, params = {}) => {
  const response = await api.get(url, { params });
  return response.data;
};
export const postRequest = async (url, data = {}, params = {}) => {
  const response = await api.post(url, data, { params });
  return response.data;
};

// Send to Gemini
export const sendToGemini = async (input, isImage = false) => {
  let parts;
  if (isImage) {
    const { data, mime } = input;
    const base64Data = data.replace(/^data:[^;]+;base64,/, ""); // works for any type
    parts = [
      { text: `${prompt.math_prompt}` },
      {
        inline_data: {
          mime_type: mime, // dynamic
          data: base64Data,
        },
      },
    ];
  } else {
    parts = [{ text: `${prompt.math_prompt}\n\n${input}` }];
  }

  const requestBody = { contents: [{ parts }] };

  // ✅ Use proper Gemini vision model
  return postRequest("/gemma-3-27b-it:generateContent", requestBody);
};
