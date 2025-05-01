import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", email); // Save email to localStorage
      toast.success("Login successful!");
      onLogin(); // ← notify App that we’re logged in
    } catch (err) {
      toast.error(err.response?.data?.msg || "Invalid credentials");
    }
  };

  // If you’re also using Google One-tap:
  const handleGoogleLogin = useCallback(
    async (resp) => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/google-login",
          { token: resp.credential }
        );
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("email", resp.credential); // Save email from Google
        toast.success("Google login successful!");
        onLogin(); // ← notify App that we’re logged in
      } catch {
        toast.error("Google login failed");
      }
    },
    [onLogin]
  );

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id:
          "1094471134044-s7t42bjadrsrkrm00k0j59n5ceqlvvai.apps.googleusercontent.com",
        callback: handleGoogleLogin,
      });
      google.accounts.id.renderButton(
        document.getElementById("google-signin"),
        { theme: "outline", size: "medium", width: "250" }
      );
    }
  }, [handleGoogleLogin]);

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: 'auto' }}>
      <form onSubmit={handleLogin} className="login-form">
        <h2 style={{ textAlign: 'center' }}>Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '5px',
            border: 'none',
            width: '100%',
          }}
        >
          Sign In
        </button>
      </form>

      <div id="google-signin" style={{ marginTop: '20px' }} />

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
