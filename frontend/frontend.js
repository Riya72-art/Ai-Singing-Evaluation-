import React, { useState } from "react";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  // ✅ REGISTER (CONNECTED TO BACKEND)
  const handleRegister = async (e) => {
    e.preventDefault();

    console.log("Calling API...");
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: registerData.fullName,
          username: registerData.email,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      alert("Registration Successful!");

      setUser({
        email: registerData.email,
        name: registerData.fullName,
      });

      setIsLoggedIn(true);
      setCurrentPage("evaluation");

      setRegisterData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // ✅ LOGIN (CONNECTED TO BACKEND)
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      setUser({
        email: loginData.email,
        name: loginData.email.split("@")[0],
      });

      setIsLoggedIn(true);
      setCurrentPage("evaluation");

    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage("home");
    setFile(null);
    setResult(null);
  };

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleEvaluate = () => {
    if (!file) {
      alert("Upload file first");
      return;
    }

    setResult({
      score: "85%",
      pitch: "Good",
      rhythm: "Average",
      tone: "Excellent",
    });
  };

  // LOGIN PAGE
  if (currentPage === "login") {
    return (
      <div style={styles.container}>
        <div style={styles.authCard}>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              style={styles.input} required />

            <input type="password" placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              style={styles.input} required />

            <button style={styles.button}>Login</button>
          </form>

          <p onClick={() => setCurrentPage("register")} style={styles.linkText}>
            Sign Up
          </p>
        </div>
      </div>
    );
  }

  // REGISTER PAGE
  if (currentPage === "register") {
    return (
      <div style={styles.container}>
        <div style={styles.authCard}>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Full Name"
              value={registerData.fullName}
              onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
              style={styles.input} required />

            <input type="email" placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              style={styles.input} required />

            <input type="password" placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              style={styles.input} required />

            <input type="password" placeholder="Confirm Password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
              style={styles.input} required />

            <button style={styles.button}>Register</button>
          </form>
        </div>
      </div>
    );
  }

  // HOME PAGE
  if (currentPage === "home") {
    return (
      <div style={styles.container}>
        <h1>AI Singing Evaluation</h1>

        {!isLoggedIn ? (
          <>
            <button onClick={() => setCurrentPage("login")} style={styles.button}>Login</button>
            <button onClick={() => setCurrentPage("register")} style={styles.button}>Register</button>
          </>
        ) : (
          <>
            <h3>Welcome {user.name}</h3>
            <button onClick={() => setCurrentPage("evaluation")} style={styles.button}>Start</button>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </>
        )}
      </div>
    );
  }

  // EVALUATION PAGE
  return (
    <div style={styles.container}>
      <h2>Upload Audio</h2>

      <input type="file" accept="audio/*" onChange={handleUpload} />
      <br /><br />

      <button onClick={handleEvaluate} style={styles.button}>Evaluate</button>

      {result && (
        <div>
          <h3>Result</h3>
          <p>Score: {result.score}</p>
          <p>Pitch: {result.pitch}</p>
          <p>Rhythm: {result.rhythm}</p>
          <p>Tone: {result.tone}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", padding: 40 },
  authCard: { background: "#fff", padding: 20, width: 300, margin: "auto" },
  input: { width: "100%", padding: 10, margin: 5 },
  button: { padding: 10, margin: 10 },
  linkText: { color: "blue", cursor: "pointer" }
};

export default App;