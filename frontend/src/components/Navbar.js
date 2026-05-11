import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status whenever location changes
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div style={{
      background: "#111",
      color: "white",
      padding: "15px 25px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "18px"
          }}
        >
          🎤 AI Singing
        </Link>

        <div style={{ display: "flex", gap: "20px" }}>
          <Link
            to="/upload"
            style={{
              color: "white",
              textDecoration: "none",
              transition: "color 0.3s"
            }}
            onMouseEnter={(e) => (e.target.style.color = "#667eea")}
            onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            📤 Upload
          </Link>
          <Link
            to="/results"
            style={{
              color: "white",
              textDecoration: "none",
              transition: "color 0.3s"
            }}
            onMouseEnter={(e) => (e.target.style.color = "#667eea")}
            onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            📊 Results
          </Link>
          <Link
            to="/evaluation"
            style={{
              color: "white",
              textDecoration: "none",
              transition: "color 0.3s"
            }}
            onMouseEnter={(e) => (e.target.style.color = "#667eea")}
            onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            🎵 Evaluate
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "8px 16px",
                border: "1px solid white",
                borderRadius: "5px",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#333";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              🔐 Login
            </Link>
            <Link
              to="/register"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "8px 16px",
                background: "#667eea",
                borderRadius: "5px",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#764ba2";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#667eea";
              }}
            >
              ✨ Sign Up
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/profile"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "8px 16px",
                border: "1px solid white",
                borderRadius: "5px",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#667eea";
                e.target.style.borderColor = "#667eea";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.borderColor = "white";
              }}
            >
              👤 Profile
            </Link>
            <button
              onClick={handleLogout}
              style={{
                color: "white",
                background: "#f5576c",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#d63447";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#f5576c";
              }}
            >
              🚪 Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;