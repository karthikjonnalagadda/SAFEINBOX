import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
    const [emails, setEmails] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("latest");
    const [showSpam, setShowSpam] = useState(false); // toggle for spam filtering

    // Fetch emails from backend
    const fetchEmails = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/emails");
            const data = response.data;

            setEmails(data);
        } catch (error) {
            console.error("Failed to fetch emails:", error);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    // Filter and sort emails whenever dependencies change
    useEffect(() => {
        let filteredEmails = emails;

        // Filter for spam if showSpam is true
        if (showSpam) {
            filteredEmails = emails.filter(email => email.isSpam);
        }

        // Search filter
        if (searchTerm) {
            filteredEmails = filteredEmails.filter(email => {
                const subject = email.subject || "";
                const from = email.from || "";
                return (
                    subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    from.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        // Sort emails
        if (sortOption === "latest") {
            filteredEmails.sort((a, b) => b.id - a.id);
        } else if (sortOption === "oldest") {
            filteredEmails.sort((a, b) => a.id - b.id);
        } else if (sortOption === "sender") {
            filteredEmails.sort((a, b) => (a.from || "").localeCompare(b.from || ""));
        }

        setEmails(filteredEmails);
    }, [emails, searchTerm, sortOption, showSpam]);

    return (
        <div style={{ padding: "20px" }}>
            <h2>{showSpam ? "Spam Folder" : "Inbox"}</h2>

            {/* Controls */}
            <div style={{ marginBottom: "10px" }}>
                <button onClick={fetchEmails}>🔄 Refresh</button>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginLeft: "10px" }}
                />
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{ marginLeft: "10px" }}
                >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="sender">Sender (A-Z)</option>
                </select>
                <button onClick={() => setShowSpam(!showSpam)} style={{ marginLeft: "10px" }}>
                    {showSpam ? "Show Inbox" : "Show Spam"}
                </button>
            </div>

            {/* Email List */}
            <div>
                {emails.length === 0 ? (
                    <p>Loading emails...</p>
                ) : emails.length === 0 ? (
                    <p>No emails to show.</p>
                ) : (
                    <ul>
                        {emails.map((email) => (
                            <li key={email.id}>
                                <Link to={`/email/${email.id}`}>
                                    <strong>{email.subject || "(No Subject)"}</strong> — {email.from || "Unknown Sender"}
                                    {email.isSpam && <span style={{ color: "red" }}> (Spam)</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
