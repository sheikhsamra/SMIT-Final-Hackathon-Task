import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Jo route isse wrap hoga, wahan sirf logged-in user hi ja sakega
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
