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

// A 401 on an *authenticated* request means the token is missing/expired/no
// longer valid (e.g. the account behind it no longer exists) — clear the
// stale session and send the user back to the home page, where the Login
// modal is one click away. This must NOT fire for the login/register
// requests themselves — a wrong password is a normal 401 that those forms
// already catch and display inline; redirecting on it would blow away the
// form before the user ever sees the error. There's also no standalone
// "/login" route in this app (login only happens via the navbar modal), so
// redirecting there would land on a blank page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = /\/auth\/(login|register)$/.test(error.config?.url || "");
    if (error.response?.status === 401 && !isAuthEndpoint && window.location.pathname !== "/") {
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;