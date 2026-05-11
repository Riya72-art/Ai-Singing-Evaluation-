import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        // Fetch analysis count
        const analysisRes = await fetch(
          "http://localhost:8000/api/analysis/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (analysisRes.ok) {
          const analyses = await analysisRes.json();
          setAnalysisCount(analyses.length);
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!userData) {
    return <div className="profile-error">Failed to load profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>👤 {userData.full_name}</h2>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <label>Full Name:</label>
            <p>{userData.full_name}</p>
          </div>

          <div className="info-item">
            <label>Email:</label>
            <p>{userData.email}</p>
          </div>

          <div className="info-item">
            <label>Member Since:</label>
            <p>{new Date(userData.created_at).toLocaleDateString()}</p>
          </div>

          <div className="info-item">
            <label>Total Evaluations:</label>
            <p>{analysisCount}</p>
          </div>

          <div className="info-item">
            <label>Account Status:</label>
            <p className="status-active">
              {userData.is_active ? "✓ Active" : "✗ Inactive"}
            </p>
          </div>
        </div>

        <div className="profile-actions">
          <button className="action-button" onClick={() => navigate("/upload")}>
            📊 New Analysis
          </button>
          <button className="action-button" onClick={() => navigate("/results")}>
            📈 View Results
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;