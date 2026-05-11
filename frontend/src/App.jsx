import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/home";
import NewAnalysis from "./pages/NewAnalysis.js";  // ← keep only this one
import Results from "./pages/results";
import Profile from "./pages/profile";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import SingingEvaluation from "./pages/SingingEvaluation";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/upload" element={<ProtectedRoute><NewAnalysis /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/evaluation" element={<ProtectedRoute><SingingEvaluation /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;