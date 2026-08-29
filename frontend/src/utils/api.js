import axios from "axios";

// Local development ke liye localhost, aur Vercel deployment ke liye environment variable use hoga
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Har request ke saath agar token store hai to automatically bhej dega
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;