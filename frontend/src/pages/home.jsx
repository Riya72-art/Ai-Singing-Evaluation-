import "./Home.css";
import HowItWorks from "./HowItWorks";
import CoreParameters from "./CoreParameters";
import RealWorld from "./RealWorld";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserDashboard();
    }
  }, [isLoggedIn]);

  const fetchUserDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const analysesResponse = await axios.get(
        "http://localhost:8000/api/analysis/history?limit=3",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecentAnalyses(analysesResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (score) => {
    return score !== null && score !== undefined ? `${Math.round(score)}%` : "N/A";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "#10b981";
      case "processing": return "#f59e0b";
      case "failed": return "#ef4444";
      default: return "#6b7280";
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <div className="hero">
        <div className="hero-left">
          <div className="badge">✨ Next-Gen Vocal Analysis</div>

          <h1>
            Elevate Your <br />
            <span>Singing Quality</span> <br />
            With AI.
          </h1>

          <p>
            Our advanced AI system analyzes your vocal performance across five
            crucial parameters, delivering instant, data-driven feedback to help
            you master your craft.
          </p>

          <div className="buttons">
            {isLoggedIn ? (
              <>
                <button className="primary" onClick={() => navigate("/upload")}>
                  🎤 Try Evaluator Now
                </button>
                <button className="secondary">Learn More →</button>
              </>
            ) : (
              <>
                <button className="primary" onClick={() => navigate("/login")}>
                  🔐 Login
                </button>
                <button className="secondary" onClick={() => navigate("/register")}>
                  ✨ Sign Up →
                </button>
              </>
            )}
          </div>
        </div>

        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1511379938547-c1f69419868d"
            alt="Sound Waves"
          />
          <div className="floating">
            <h3>98</h3>
            <p>Pitch Accuracy</p>
            <span>Exceptional</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD SECTION - Only for logged-in users */}
      {isLoggedIn && user && (
        <div className="dashboard-section">
          <div className="container">
            <div className="dashboard-header">
              <h2>🎵 Welcome back, {user.name}!</h2>
              <p>Your singing analysis dashboard</p>
            </div>

            <div className="dashboard-grid">
              {/* Upload CTA Card */}
              <div className="dashboard-card upload-cta-card">
                <div className="upload-cta-content">
                  <div className="upload-icon">🎤</div>
                  <h3>Ready to Evaluate Your Voice?</h3>
                  <p>Upload an audio file and get instant AI-powered feedback.</p>
                  <button
                    className="upload-cta-button"
                    onClick={() => navigate("/upload")}
                  >
                    ✨ Start Your Evaluation Now
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="dashboard-card stats-card">
                <h3>📊 Your Stats</h3>
                <div className="stats">
                  <div className="stat">
                    <span className="stat-number">{recentAnalyses.length}</span>
                    <span className="stat-label">Total Analyses</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">
                      {recentAnalyses.filter((a) => a.analysis_status === "completed").length}
                    </span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
                <button className="profile-btn" onClick={() => navigate("/profile")}>
                  👤 View Full Profile
                </button>
              </div>

              {/* Recent Analyses */}
              <div className="dashboard-card recent-card">
                <h3>🕒 Recent Analyses</h3>
                {loading ? (
                  <div className="loading">Loading your analyses...</div>
                ) : recentAnalyses.length > 0 ? (
                  <div className="recent-list">
                    {recentAnalyses.slice(0, 3).map((analysis) => (
                      <div key={analysis.id} className="recent-item">
                        <div className="recent-info">
                          <h4>{analysis.file_name}</h4>
                          <p>
                            Status:{" "}
                            <span style={{ color: getStatusColor(analysis.analysis_status) }}>
                              {analysis.analysis_status}
                            </span>
                          </p>
                          {analysis.overall_score && (
                            <p>Overall Score: {formatScore(analysis.overall_score)}</p>
                          )}
                          <small>{new Date(analysis.created_at).toLocaleDateString()}</small>
                        </div>
                        <button
                          className="view-results-btn"
                          onClick={() => navigate(`/results?id=${analysis.id}`)}
                        >
                          View Results
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-analyses">
                    <p>No analyses yet. Start your first evaluation!</p>
                    <button className="upload-btn" onClick={() => navigate("/upload")}>
                      🎤 Upload Audio
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="dashboard-card actions-card">
                <h3>⚡ Quick Actions</h3>
                <div className="action-buttons">
                  <button className="action-btn primary" onClick={() => navigate("/upload")}>
                    📤 New Analysis
                  </button>
                  <button className="action-btn secondary" onClick={() => navigate("/profile")}>
                    👤 My Profile
                  </button>
                  <button className="action-btn secondary" onClick={() => navigate("/results")}>
                    📊 All Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <HowItWorks />
      <CoreParameters />
      <RealWorld />
    </>
  );
}

export default Home;