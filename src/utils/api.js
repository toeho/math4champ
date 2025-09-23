import axios from "axios";
import prompt from "../prompts/mathPrompt.json";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const USE_GEMINI = import.meta.env.VITE_USE_GEMINI === "true"; // ✅ new env flag
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "/api"; // fallback backend

const geminiApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
geminiApi.interceptors.request.use((config) => {
  if (!config.params) config.params = {};
  config.params.key = API_KEY;
  return config;
});

const backendApi = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

// Generic requests
export const getRequest = async (url, params = {}) => {
  const apiInstance = USE_GEMINI ? geminiApi : backendApi;
  const response = await apiInstance.get(url, { params });
  return response.data;
};

export const postRequest = async (url, data = {}, params = {}) => {
  const apiInstance = USE_GEMINI ? geminiApi : backendApi;
  const response = await apiInstance.post(url, data, { params });
  return response.data;
};

// Send to Gemini or backend
export const sendToGemini = async (input, isImage = false) => {
  if (USE_GEMINI) {
    // Gemini request
    let parts;
    if (isImage) {
      const { data, mime } = input;
      const base64Data = data.replace(/^data:[^;]+;base64,/, "");
      parts = [
        { text: `${prompt.math_prompt}` },
        {
          inline_data: {
            mime_type: mime,
            data: base64Data,
          },
        },
      ];
    } else {
      parts = [{ text: `${prompt.math_prompt}\n\n${input}` }];
    }

    const requestBody = { contents: [{ parts }] };
    return postRequest("/gemma-3-27b-it:generateContent", requestBody);

  } else {
    // Fallback to backend
    const payload = isImage
      ? { image: input.data, mime: input.mime, prompt: prompt.math_prompt }
      : { prompt: `${prompt.math_prompt}\n\n${input}` };

    return postRequest("/gemini", payload); // your backend endpoint
  }
};
