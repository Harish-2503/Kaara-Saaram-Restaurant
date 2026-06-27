// src/admin/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "./authService";

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
