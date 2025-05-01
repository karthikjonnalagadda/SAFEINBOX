import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import "./App.css";

function App() {
  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem("token");
    // Redirect to the Home page
    window.location.href = "/";
  };

  return (
    <div className="app-container">
      {/* Top-right Controls (always rendered) */}
      <div className="top-controls" style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: "10px" }}>
        <Link to="/" className="ctrl-btn" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", borderRadius: "5px" }}>
          Home
        </Link>
        <button
          onClick={handleLogout}
          className="ctrl-btn"
          style={{
            padding: "10px",
            backgroundColor: "#dc3545",
            color: "white",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Route Definitions */}
      <div className="content" style={{ marginTop: "50px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={() => window.location.href = "/dashboard"} />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
