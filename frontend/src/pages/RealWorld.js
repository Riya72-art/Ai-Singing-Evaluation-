function RealWorld() {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>
        Real-World <span style={styles.highlight}>Applications</span>
      </h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🎓 Music Learning Apps</h3>
          <p style={styles.cardText}>Real-time feedback for students.</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🏆 Talent Shows</h3>
          <p style={styles.cardText}>AI-powered judging system.</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🎧 Music Production</h3>
          <p style={styles.cardText}>Find best vocal takes instantly.</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🎤 Karaoke Systems</h3>
          <p style={styles.cardText}>Professional-level scoring.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "60px",
    background: "#f5f3ff",
    textAlign: "center",
  },
  heading: {
    fontSize: "36px",
    color: "#2e1065", // 🔥 darker purple
    marginBottom: "30px",
  },
  highlight: {
    color: "#5b21b6", // deeper purple
  },
  grid: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "220px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },

  // ✅ NEW STYLES
  cardTitle: {
    color: "#1f2937", // dark blackish
    marginBottom: "10px",
  },
  cardText: {
    color: "#374151", // dark grey
  },
};

export default RealWorld;