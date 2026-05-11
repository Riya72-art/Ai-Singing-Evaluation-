import "./howitworks.css";

function HowItWorks() {
  return (
    <div className="how-container">
      <h1 className="title">
        How It <span>Works</span>
      </h1>

      <p className="subtitle">
        A seamless pipeline transforming raw audio into actionable vocal insights in seconds.
      </p>

      <div className="cards">
        {/* Card 1 */}
        <div className="card">
          <div className="icon blue">🎤</div>
          <div className="step">1</div>
          <h3>Vocal Input</h3>
          <p>
            Submit a high-quality audio recording of the singing performance.
          </p>
        </div>

        {/* Card 2 */}
        <div className="card">
          <div className="icon purple">⚙️</div>
          <div className="step">2</div>
          <h3>Audio Processing</h3>
          <p>
            System isolates vocals and extracts core acoustic features.
          </p>
        </div>

        {/* Card 3 */}
        <div className="card">
          <div className="icon indigo">🧠</div>
          <div className="step">3</div>
          <h3>AI Analysis</h3>
          <p>
            Deep learning models evaluate pitch, tone, rhythm, and more.
          </p>
        </div>

        {/* Card 4 */}
        <div className="card">
          <div className="icon green">💬</div>
          <div className="step">4</div>
          <h3>Feedback Generation</h3>
          <p>
            Receive detailed scores and actionable constructive feedback.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;