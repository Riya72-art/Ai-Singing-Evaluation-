import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0a0a0f", color: "#a78bfa"
      }}>
        Loading...
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
