import "./coreparameters.css";

function CoreParameters() {
  return (
    <div className="core-container">
      
      {/* LEFT SIDE */}
      <div className="core-left">
        <h1>
          Core <br />
          <span>Parameters</span>
        </h1>

        <p>
          Our holistic scoring system breaks down every performance into five
          critical pillars of vocal mastery.
        </p>

        <div className="circle"></div>
      </div>

      {/* RIGHT SIDE */}
      <div className="core-right">
        
        <div className="card">
          <div className="icon blue">📈</div>
          <div>
            <h3>Pitch Accuracy</h3>
            <p>
              Measures how accurately the singer hits the intended notes and
              maintains key.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="icon purple">🔊</div>
          <div>
            <h3>Tone Quality</h3>
            <p>
              Evaluates the richness, warmth, and consistency of the vocal
              timbre.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="icon green">⏱</div>
          <div>
            <h3>Rhythm & Timing</h3>
            <p>
              Checks precision in following the beat and musical phrasing.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="icon yellow">🎵</div>
          <div>
            <h3>Clarity & Diction</h3>
            <p>
              Assesses how clear and understandable the lyrics are articulated.
            </p>
          </div>
        </div>

        <div className="card wide">
          <div className="icon red">⚡</div>
          <div>
            <h3>Vocal Power</h3>
            <p>
              Measures the dynamic range, projection, and control of volume.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CoreParameters;