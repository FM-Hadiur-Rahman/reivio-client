import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
