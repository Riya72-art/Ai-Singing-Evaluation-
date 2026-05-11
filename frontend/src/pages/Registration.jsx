import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Registration() {
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          username: form.email,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      // After successful registration, auto-login if backend returns a token
      // Otherwise, redirect to login page
      if (data.access_token || data.token) {
        const authToken = data.access_token || data.token;
        login({ email: form.email, name: form.fullName }, authToken);
        navigate("/evaluation");
      } else {
        // No token returned — redirect to login
        navigate("/login", { state: { message: "Account created! Please sign in." } });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="wave wave1" />
        <div className="wave wave2" />
        <div className="wave wave3" />
      </div>

      <div className="auth-card">
        <div className="auth-icon">🎵</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join your vocal studio</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Jane Smith"
              value={form.fullName}
              onChange={update("fullName")}
              required
            />
          </div>

          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              required
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={update("password")}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="field-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
