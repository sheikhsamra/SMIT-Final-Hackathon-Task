import { createContext, useContext, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Registering no longer logs you in directly — the account needs its
  // email verified first. The response is just { needsVerification, email }.
  const register = async (name, email, password, role, specialization) => {
    const { data } = await api.post("/auth/register", { name, email, password, role, specialization });
    return data;
  };

  const verifyEmail = async (email, code) => {
    const { data } = await api.post("/auth/verify-email", { email, code });
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const resendVerification = async (email) => {
    const { data } = await api.post("/auth/resend-verification", { email });
    return data;
  };

  const googleLogin = async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Updates the logged-in user's own name and/or avatar. Keeps the existing
  // token (the backend response doesn't include one) and merges the rest.
  const updateProfile = async (fields) => {
    const { data } = await api.patch("/auth/profile", fields);
    const updated = { ...user, ...data };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, verifyEmail, resendVerification, googleLogin, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Use "const { user, login, logout } = useAuth();" in any component
export const useAuth = () => useContext(AuthContext);
