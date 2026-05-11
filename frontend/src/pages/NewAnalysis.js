import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./newanalysis.css";

function NewAnalysis() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    singerName: "",
    songTitle: "",
    genre: "Pop",
    duration: 60
  });
  const [audioFile, setAudioFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/flac'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!file.type.startsWith("audio/")) {
      setError("Please upload a valid audio file (WAV, MP3, OGG, M4A, FLAC)");
      return;
    }

    if (file.size > maxSize) {
      setError("File size must be less than 50MB");
      return;
    }

    setAudioFile(file);
    setError("");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      setError("Please select an audio file");
      return;
    }

    if (!formData.singerName.trim() || !formData.songTitle.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("file", audioFile);
      formDataToSend.append("singer_name", formData.singerName);  // ← added
      formDataToSend.append("song_title", formData.songTitle);    // ← added
      formDataToSend.append("genre", formData.genre);             // ← added
      formDataToSend.append("duration", formData.duration);       // ← added

      const response = await axios.post(
        "http://localhost:8000/api/analysis/upload",
        formDataToSend,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // ✅ Navigate to results with full data
      navigate("/results", { state: { result: response.data } });

    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.detail ||
        "Upload failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="form-card">
        <h2>New Analysis</h2>
        <p className="subtitle">
          Upload your singing audio and enter metadata to generate AI insights.
        </p>

        {error && (
          <div className="error-message" style={{
            color: "#ef4444",
            background: "#fef2f2",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        {/* File Upload Section */}
        <label>Audio File *</label>
        <div
          className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? '#06b6d4' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center',
            marginTop: '5px',
            marginBottom: '15px',
            background: dragActive ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="audio-file"
          />
          <label htmlFor="audio-file" style={{ cursor: 'pointer' }}>
            {audioFile ? (
              <div>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎵</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {audioFile.name}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB • Click to change
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📁</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  Drop your audio file here
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  or click to browse • WAV, MP3, OGG, M4A, FLAC (max 50MB)
                </div>
              </div>
            )}
          </label>
        </div>

        <label>Singer Name *</label>
        <input
          type="text"
          name="singerName"
          placeholder="e.g. Adele, John Legend"
          value={formData.singerName}
          onChange={handleInputChange}
          required
        />

        <label>Song Title *</label>
        <input
          type="text"
          name="songTitle"
          placeholder="e.g. Rolling in the Deep"
          value={formData.songTitle}
          onChange={handleInputChange}
          required
        />

        <div className="row">
          <div>
            <label>Genre</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>Duration (sec)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              max="600"
            />
          </div>
        </div>

        <button
          className="analyze-btn"
          onClick={handleSubmit}
          disabled={isLoading || !audioFile}
          style={{
            opacity: (isLoading || !audioFile) ? 0.6 : 1,
            cursor: (isLoading || !audioFile) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? "Analyzing..." : "Analyze Performance"}
        </button>
      </div>
    </div>
  );
}

export default NewAnalysis;