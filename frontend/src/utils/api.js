import axios from "axios";

// Backend ka base URL — hackathon ke din agar port change ho to bas yahan badal dena
const api = axios.create({
  baseURL: "http://localhost:5000/api",
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
