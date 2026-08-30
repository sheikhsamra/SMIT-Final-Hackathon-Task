import axios from "axios";

// Uses localhost for local development, and the environment variable for Vercel deployments
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically attaches the stored token to every request, if present
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// A 401 means the token is missing/expired/no longer valid (e.g. the account
// behind it no longer exists) — bounce straight to login instead of leaving
// the user stuck on a page full of confusing "server error" messages.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;