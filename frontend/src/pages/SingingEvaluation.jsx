import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "./SingingEvaluation.css";

const SCORE_LABELS = {
  pitch_score:   { label: "Pitch Accuracy",   icon: "🎯" },
  rhythm_score:  { label: "Rhythm",            icon: "🥁" },
  tone_score:    { label: "Tone Quality",      icon: "🎼" },
  clarity_score: { label: "Vocal Clarity",     icon: "✨" },
};

export default function SingingEvaluation() {
  const { token, user } = useAuth();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  /* ── File selection ── */
  const onFileChange = (f) => {
    if (!f) return;
    if (!f.type.startsWith("audio/")) {
      setError("Please select an audio file (mp3, wav, m4a, etc.)");
      return;
    }
    setFile(f);
    setResult(null);
    setError("");
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onFileChange(e.dataTransfer.files[0]);
  };

  /* ── Evaluate ── */
  const handleEvaluate = async () => {
    if (!file) { setError("Please select an audio file first."); return; }

    setLoading(true);
    setError("");
    setResult(null);
    setProgress("Uploading audio…");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress("Analyzing pitch and rhythm…");

      const response = await fetch("http://127.0.0.1:8000/api/analysis/evaluate", {
        method: "POST",
        headers: {
          // Don't set Content-Type — browser sets multipart boundary automatically
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setProgress("Generating AI feedback…");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed.");
      }

      setResult(data);
      setProgress("");

    } catch (err) {
      setError(err.message);
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const overallScore = result
    ? Math.round(
        Object.keys(SCORE_LABELS).reduce((sum, k) => sum + (result[k] || 0), 0) /
        Object.keys(SCORE_LABELS).length
      )
    : null;

  const scoreColor = (s) =>
    s >= 80 ? "#34d399" : s >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="eval-page">
      <div className="eval-header">
        <h1>Vocal Analysis</h1>
        <p>Upload your singing and get instant AI-powered feedback</p>
        {user && <span className="eval-user">👤 {user.name}</span>}
      </div>

      {/* ── Upload Zone ── */}
      <div
        className={`drop-zone ${dragging ? "drag-over" : ""} ${file ? "has-file" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          style={{ display: "none" }}
          onChange={(e) => onFileChange(e.target.files[0])}
        />
        {file ? (
          <>
            <div className="file-icon">🎵</div>
            <div className="file-name">{file.name}</div>
            <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            <div className="file-hint">Click to change file</div>
          </>
        ) : (
          <>
            <div className="upload-icon">🎤</div>
            <div className="upload-text">Drop your audio here</div>
            <div className="upload-hint">or click to browse · MP3, WAV, M4A, OGG</div>
          </>
        )}
      </div>

      {error && <div className="eval-error">{error}</div>}

      <button
        className="eval-btn"
        onClick={handleEvaluate}
        disabled={loading || !file}
      >
        {loading ? (
          <><span className="spinner" /> {progress}</>
        ) : (
          "✦ Analyze Singing"
        )}
      </button>

      {/* ── Results ── */}
      {result && (
        <div className="results-section">
          {/* Overall score */}
          <div className="overall-card">
            <div className="overall-label">Overall Score</div>
            <div className="overall-score" style={{ color: scoreColor(overallScore) }}>
              {overallScore}
              <span className="overall-unit">/100</span>
            </div>
            <div className="overall-grade">
              {overallScore >= 85 ? "🌟 Excellent" :
               overallScore >= 70 ? "👍 Good" :
               overallScore >= 55 ? "📈 Developing" : "💪 Keep Practicing"}
            </div>
          </div>

          {/* Score breakdown */}
          <div className="scores-grid">
            {Object.entries(SCORE_LABELS).map(([key, { label, icon }]) => {
              const val = result[key] ?? 0;
              return (
                <div key={key} className="score-card">
                  <div className="score-icon">{icon}</div>
                  <div className="score-label">{label}</div>
                  <div className="score-bar-wrap">
                    <div
                      className="score-bar-fill"
                      style={{ width: `${val}%`, background: scoreColor(val) }}
                    />
                  </div>
                  <div className="score-value" style={{ color: scoreColor(val) }}>
                    {val}/100
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Feedback */}
          {result.feedback && (
            <div className="feedback-card">
              <h3>🤖 AI Feedback</h3>
              <p>{result.feedback}</p>
            </div>
          )}

          {/* Tips */}
          {result.tips && result.tips.length > 0 && (
            <div className="tips-card">
              <h3>💡 Tips to Improve</h3>
              <ul>
                {result.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}

          <button className="reset-btn" onClick={() => { setFile(null); setResult(null); }}>
            Analyze Another Track
          </button>
        </div>
      )}
    </div>
  );
}