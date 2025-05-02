import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailDetail from "./pages/EmailDetail";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="content" style={{ marginTop: "70px", padding: "20px" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={() => window.location.href = "/dashboard"} />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/email/:id"
            element={
              <PrivateRoute>
                <EmailDetail />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
