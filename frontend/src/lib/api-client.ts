// src/lib/api-client.ts
import axios from "axios";

// Ensure baseURL ends with exactly one slash so paths like "quran/students" resolve correctly
const rawBase = process.env.NEXT_PUBLIC_API_URL ?? "";
const baseURL = rawBase ? rawBase.replace(/\/+$/, "") + "/" : "";

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// only install this in the browser
if (typeof window !== "undefined") {
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export default apiClient;
