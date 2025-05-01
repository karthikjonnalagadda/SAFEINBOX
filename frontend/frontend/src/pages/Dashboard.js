import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [allEmails, setAllEmails] = useState([]);
  const [displayedEmails, setDisplayedEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [fetchingEmails, setFetchingEmails] = useState(false);

  // Retrieve logged-in email from localStorage
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setUserEmail(email);
    } else {
      // If no email found, redirect to login
      window.location.href = "/login";
    }
  }, []);

  // Fetch emails from backend
  const fetchEmails = async () => {
    setFetchingEmails(true);
    try {
      const response = await axios.get("http://localhost:5000/api/emails");
      setAllEmails(response.data);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setFetchingEmails(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Filter & sort emails
  useEffect(() => {
    let filtered = [...allEmails];

    if (searchTerm) {
      filtered = filtered.filter((email) => {
        const subj = email.subject || "";
        const from = email.from || "";
        return (
          subj.toLowerCase().includes(searchTerm.toLowerCase()) ||
          from.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (sortOption === "latest") {
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortOption === "oldest") {
      filtered.sort((a, b) => a.id - b.id);
    } else if (sortOption === "sender") {
      filtered.sort((a, b) => (a.from || "").localeCompare(b.from || ""));
    }

    setDisplayedEmails(filtered);
  }, [allEmails, searchTerm, sortOption]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Display logged-in email */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <strong>Logged in as:</strong> {userEmail}
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Inbox</h2>

      {/* Controls */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={fetchEmails}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            margin: "5px",
          }}
        >
          🔄 Refresh
        </button>

        <input
          type="text"
          placeholder="Search by Subject or Sender"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            width: "250px",
            margin: "5px",
          }}
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            margin: "5px",
          }}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="sender">Sender (A-Z)</option>
        </select>
      </div>

      {/* Email List */}
      <div>
        {fetchingEmails ? (
          <p style={{ textAlign: "center" }}>Fetching emails... Please wait</p>
        ) : displayedEmails.length === 0 ? (
          <p style={{ textAlign: "center" }}>No emails to show.</p>
        ) : (
          displayedEmails.map((email) => (
            <div
              key={email.id}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "10px",
                padding: "15px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
            >
              <Link
                to={`/email/${email.id}`}
                style={{
                  textDecoration: "none",
                  color: "#333",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {email.subject || "(No Subject)"} — {email.from || "Unknown Sender"}
              </Link>

              {/* Spam/Ham Tag */}
              {email.isSpam && (
                <span
                  style={{
                    marginLeft: "10px",
                    padding: "5px 10px",
                    borderRadius: "12px",
                    backgroundColor: email.isSpam === "spam" ? "red" : "green",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {email.isSpam.toUpperCase()}
                </span>
              )}

              {/* Confidence Score */}
              {email.confidence !== undefined && (
                <button
                  style={{
                    marginLeft: "20px",
                    padding: "5px 10px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "default",
                    fontSize: "12px",
                  }}
                  disabled
                >
                  Confidence: {Math.round(email.confidence * 100)}%
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
