import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only a logged-in user can access a route wrapped with this component.
// Pass roles={["worker", "admin"]} to also restrict it to specific roles.
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
