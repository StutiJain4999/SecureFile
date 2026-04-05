import axios from "axios";

const defaultApiUrl = "http://localhost:5000/api";
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, "")
  : defaultApiUrl;

const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
