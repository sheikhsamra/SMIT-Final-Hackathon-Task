import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only a logged-in user can access a route wrapped with this component
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
