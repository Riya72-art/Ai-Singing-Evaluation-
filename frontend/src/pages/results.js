import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend
);

function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>❌ No Results Found</h2>
          <p>Please analyze a song first.</p>
          <button onClick={() => navigate("/upload")} style={styles.btn}>
            Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  const overallScore = Math.round(
    ((result.pitch_score || 0) + (result.rhythm_score || 0) +
     (result.tone_score || 0) + (result.clarity_score || 0)) / 4
  );

  const scoreColor = (s) => s >= 80 ? "#34d399" : s >= 60 ? "#fbbf24" : "#f87171";
  const getGrade = (s) =>
    s >= 85 ? "🌟 Excellent" : s >= 70 ? "👍 Good" : s >= 55 ? "📈 Developing" : "💪 Keep Practicing";

  // Bar chart
  const barData = {
    labels: ["Pitch", "Rhythm", "Tone", "Clarity"],
    datasets: [{
      label: "Your Score",
      data: [result.pitch_score||0, result.rhythm_score||0, result.tone_score||0, result.clarity_score||0],
      backgroundColor: ["rgba(99,102,241,0.8)", "rgba(236,72,153,0.8)", "rgba(34,197,94,0.8)", "rgba(251,191,36,0.8)"],
      borderRadius: 8,
    }],
  };

  // Comparison bar chart
  const compBarData = result.comparison ? {
    labels: ["Pitch Match", "Tempo Match", "Tone Match", "Rhythm Match"],
    datasets: [{
      label: "Similarity with Original (%)",
      data: [
        result.comparison.pitch_match,
        result.comparison.tempo_match,
        result.comparison.tone_match,
        result.comparison.rhythm_match,
      ],
      backgroundColor: ["rgba(99,102,241,0.8)", "rgba(236,72,153,0.8)", "rgba(34,197,94,0.8)", "rgba(251,191,36,0.8)"],
      borderRadius: 8,
    }],
  } : null;

  // Frequency comparison chart
  const userF0 = result.f0_values || [];
  const origF0 = result.original_f0_values || [];
  const maxLen = Math.max(userF0.length, origF0.length);
  const freqLabels = Array.from({ length: maxLen }, (_, i) => i);

  const freqData = {
    labels: freqLabels,
    datasets: [
      {
        label: `Your Voice (${result.gender === "female" ? "Female 🎀" : "Male 🎤"})`,
        data: userF0,
        borderColor: result.gender === "female" ? "rgba(236,72,153,0.9)" : "rgba(99,102,241,0.9)",
        backgroundColor: result.gender === "female" ? "rgba(236,72,153,0.1)" : "rgba(99,102,241,0.1)",
        borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true,
      },
      ...(origF0.length > 0 ? [{
        label: "Original Song",
        data: origF0,
        borderColor: "rgba(251,191,36,0.9)",
        backgroundColor: "rgba(251,191,36,0.1)",
        borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true,
      }] : []),
    ],
  };

  const freqOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: origF0.length > 0
          ? "Your Pitch vs Original Song Frequency"
          : `Your Pitch Frequency (${result.gender === "female" ? "Female 🎀" : "Male 🎤"})`,
      },
    },
    scales: {
      y: { title: { display: true, text: "Frequency (Hz)" }, min: 0, max: 400 },
      x: { title: { display: true, text: "Time (frames)" } },
    },
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h2>📊 Vocal Analysis Results</h2>
        {result.song_title && (
          <p style={styles.subtitle}>
            🎵 {result.detected_song?.title || result.song_title}
            {(result.detected_song?.artist || result.singer_name) &&
              ` — ${result.detected_song?.artist || result.singer_name}`}
          </p>
        )}
        {result.detected_song?.title && result.detected_song.title !== result.song_title && (
          <p style={styles.detectedTag}>🎯 Recognized: {result.detected_song.title} by {result.detected_song.artist}</p>
        )}
      </div>

      {/* Overall Score */}
      <div style={styles.overallCard}>
        <div style={styles.overallLabel}>Overall Score</div>
        <div style={{ ...styles.overallScore, color: scoreColor(overallScore) }}>
          {overallScore}<span style={styles.unit}>/100</span>
        </div>
        <div style={styles.grade}>{getGrade(overallScore)}</div>
        <div style={styles.genderBadge}>
          {result.gender === "female" ? "🎀 Female Voice" : "🎤 Male Voice"} — Avg Pitch: {result.avg_pitch_hz} Hz
        </div>
      </div>

      {/* Score Cards */}
      <div style={styles.cards}>
        {[
          { label: "🎯 Pitch", value: result.pitch_score },
          { label: "🥁 Rhythm", value: result.rhythm_score },
          { label: "🎼 Tone", value: result.tone_score },
          { label: "✨ Clarity", value: result.clarity_score },
        ].map(({ label, value }) => (
          <div key={label} style={styles.card}>
            <div style={styles.cardLabel}>{label}</div>
            <div style={{ ...styles.cardValue, color: scoreColor(value || 0) }}>{value || 0}/100</div>
            <div style={styles.barWrap}>
              <div style={{ ...styles.barFill, width: `${value || 0}%`, background: scoreColor(value || 0) }} />
            </div>
          </div>
        ))}
      </div>

      {/* Score Bar Chart */}
      <div style={styles.chartBox}>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: "Vocal Score Breakdown" } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
      </div>

      {/* Comparison Section */}
      {result.has_comparison && result.comparison && (
        <div style={styles.comparisonSection}>
          <h3 style={styles.sectionTitle}>🎵 Comparison with Original Song</h3>

          {/* Overall Similarity */}
          <div style={styles.similarityCard}>
            <div style={styles.overallLabel}>Overall Similarity</div>
            <div style={{ ...styles.overallScore, color: scoreColor(result.comparison.overall_similarity) }}>
              {result.comparison.overall_similarity}<span style={styles.unit}>%</span>
            </div>
            <p style={styles.genderNote}>{result.comparison.gender_note}</p>
          </div>

          {/* Comparison Cards */}
          <div style={styles.cards}>
            {[
              { label: "🎯 Pitch Match", value: result.comparison.pitch_match },
              { label: "🥁 Tempo Match", value: result.comparison.tempo_match },
              { label: "🎼 Tone Match", value: result.comparison.tone_match },
              { label: "🎵 Rhythm Match", value: result.comparison.rhythm_match },
            ].map(({ label, value }) => (
              <div key={label} style={styles.card}>
                <div style={styles.cardLabel}>{label}</div>
                <div style={{ ...styles.cardValue, color: scoreColor(value || 0) }}>{value || 0}%</div>
                <div style={styles.barWrap}>
                  <div style={{ ...styles.barFill, width: `${value || 0}%`, background: scoreColor(value || 0) }} />
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Bar Chart */}
          {compBarData && (
            <div style={styles.chartBox}>
              <Bar data={compBarData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: "Your Voice vs Original Song" } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
            </div>
          )}

          {/* Pitch Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Your Avg Pitch</div>
              <div style={styles.statValue}>{result.comparison.user_pitch_hz} Hz</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Original Avg Pitch</div>
              <div style={styles.statValue}>{result.comparison.original_pitch_hz} Hz</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Pitch Difference</div>
              <div style={{ ...styles.statValue, color: result.comparison.pitch_diff_hz > 20 ? "#f87171" : "#34d399" }}>
                {result.comparison.pitch_diff_hz} Hz
              </div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Tempo Difference</div>
              <div style={{ ...styles.statValue, color: result.comparison.tempo_diff_bpm > 10 ? "#f87171" : "#34d399" }}>
                {result.comparison.tempo_diff_bpm} BPM
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frequency Graph */}
      {userF0.length > 0 && (
        <div style={styles.chartBox}>
          <Line data={freqData} options={freqOptions} />
          {origF0.length === 0 && (
            <p style={styles.freqNote}>
              {result.gender === "female"
                ? "⚠️ Female voice range: 165–255 Hz"
                : "⚠️ Male voice range: 85–155 Hz"}
            </p>
          )}
        </div>
      )}

      {/* Audio Info */}
      <div style={styles.infoRow}>
        <span>⏱ {result.duration_seconds}s</span>
        <span>🎵 {result.tempo_bpm} BPM</span>
        <span>{result.gender === "female" ? "🎀 Female" : "🎤 Male"}</span>
        <span>🎙 {result.avg_pitch_hz} Hz</span>
      </div>

      {/* AI Feedback */}
      {result.feedback && (
        <div style={styles.feedbackBox}>
          <h3>🤖 AI Vocal Coach Feedback</h3>
          <p style={styles.feedbackText}>{result.feedback}</p>
        </div>
      )}

      {/* Tips */}
      {result.tips && result.tips.length > 0 && (
        <div style={styles.tipsBox}>
          <h3>💡 Tips to Improve</h3>
          <ul style={styles.tipsList}>
            {result.tips.map((tip, i) => <li key={i} style={styles.tipItem}>{tip}</li>)}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        <button onClick={() => navigate("/upload")} style={styles.primaryBtn}>🔄 New Analysis</button>
        <button onClick={() => navigate("/")} style={styles.secondaryBtn}>🏠 Home</button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#0f172a", padding: "40px 20px", color: "#f1f5f9", fontFamily: "sans-serif" },
  header: { textAlign: "center", marginBottom: "30px" },
  subtitle: { color: "#94a3b8", fontSize: "16px" },
  detectedTag: { color: "#34d399", fontSize: "14px", marginTop: "8px" },
  errorBox: { background: "#1e293b", borderRadius: "12px", padding: "40px", maxWidth: "500px", margin: "100px auto", textAlign: "center" },
  overallCard: { background: "linear-gradient(135deg,#1e293b,#0f172a)", border: "1px solid #334155", borderRadius: "16px", padding: "30px", textAlign: "center", maxWidth: "400px", margin: "0 auto 30px" },
  overallLabel: { color: "#94a3b8", fontSize: "14px", marginBottom: "10px" },
  overallScore: { fontSize: "72px", fontWeight: "bold", lineHeight: 1 },
  unit: { fontSize: "24px", color: "#94a3b8" },
  grade: { fontSize: "18px", marginTop: "10px" },
  genderBadge: { marginTop: "12px", padding: "6px 14px", background: "#1e293b", borderRadius: "20px", fontSize: "13px", color: "#94a3b8", display: "inline-block" },
  cards: { display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "30px" },
  card: { background: "#1e293b", borderRadius: "12px", padding: "20px", minWidth: "140px", textAlign: "center" },
  cardLabel: { color: "#94a3b8", fontSize: "13px", marginBottom: "8px" },
  cardValue: { fontSize: "24px", fontWeight: "bold", marginBottom: "10px" },
  barWrap: { background: "#0f172a", borderRadius: "4px", height: "6px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px" },
  chartBox: { background: "#1e293b", borderRadius: "16px", padding: "24px", maxWidth: "700px", margin: "0 auto 30px" },
  comparisonSection: { maxWidth: "700px", margin: "0 auto 30px" },
  sectionTitle: { textAlign: "center", fontSize: "22px", marginBottom: "20px", color: "#f1f5f9" },
  similarityCard: { background: "linear-gradient(135deg,#1e293b,#0f172a)", border: "1px solid #334155", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "24px" },
  genderNote: { color: "#94a3b8", fontSize: "13px", marginTop: "8px" },
  statsRow: { display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "20px" },
  statBox: { background: "#1e293b", borderRadius: "12px", padding: "16px 24px", textAlign: "center", minWidth: "140px" },
  statLabel: { color: "#94a3b8", fontSize: "12px", marginBottom: "6px" },
  statValue: { fontSize: "20px", fontWeight: "bold", color: "#f1f5f9" },
  freqNote: { marginTop: "12px", padding: "10px", background: "#0f172a", borderRadius: "8px", fontSize: "13px", color: "#94a3b8", textAlign: "center" },
  infoRow: { display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", background: "#1e293b", borderRadius: "12px", padding: "16px", maxWidth: "700px", margin: "0 auto 30px", color: "#94a3b8", fontSize: "14px" },
  feedbackBox: { background: "#1e293b", borderRadius: "16px", padding: "24px", maxWidth: "700px", margin: "0 auto 20px", textAlign: "left" },
  feedbackText: { color: "#cbd5e1", lineHeight: 1.7, fontSize: "15px" },
  tipsBox: { background: "#1e293b", borderRadius: "16px", padding: "24px", maxWidth: "700px", margin: "0 auto 30px", textAlign: "left" },
  tipsList: { paddingLeft: "20px" },
  tipItem: { color: "#cbd5e1", marginBottom: "10px", lineHeight: 1.6 },
  actions: { display: "flex", gap: "15px", justifyContent: "center", marginTop: "20px" },
  primaryBtn: { padding: "12px 28px", background: "linear-gradient(to right,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: "25px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" },
  secondaryBtn: { padding: "12px 28px", background: "#334155", color: "white", border: "none", borderRadius: "25px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" },
  btn: { padding: "12px 24px", background: "#6366f1", color: "white", border: "none", borderRadius: "25px", fontWeight: "bold", cursor: "pointer", marginTop: "15px" },
};

export default Results;