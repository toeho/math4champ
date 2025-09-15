import axios from "axios";
import prompt from "../prompts/mathPrompt.json"
const API_KEY = "AIzaSyAzgCde_H6Ie69UAAhXyXw3ZGMM3cihLws"
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use((config) => {
  if (!config.params) config.params = {};
  config.params.key = API_KEY; 
  return config;
});

// 🔹 GET request
export const getRequest = async (url, params = {}) => {
  const response = await api.get(url, { params });
  return response.data;
};

// 🔹 POST request
export const postRequest = async (url, data = {}, params = {}) => {
  const response = await api.post(url, data, { params });
  return response.data;
};

// 🔹 PUT request
export const putRequest = async (url, data = {}, params = {}) => {
  const response = await api.put(url, data, { params });
  return response.data;
};

// utils/api.js
export const sendToGemini = async (input, isImage = false) => {
  const requestBody = {
    contents: [
      {
        parts: isImage
          ? [
              { text: `${prompt.math_prompt}` },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: input.replace(/^data:image\/png;base64,/, ""),
                },
              },
            ]
          : [{ text: `${prompt.math_prompt}\n\n${input}` }],
      },
    ],
  };

  return postRequest("/gemma-3-27b-it:generateContent", requestBody);
};
