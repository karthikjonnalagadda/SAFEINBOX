import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EmailDetails.css"; // Import CSS for styling

function EmailDetails() {
    const { id } = useParams();
    const [email, setEmail] = useState(null);
    const [isSpam, setIsSpam] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmailDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/emailDetail/${id}`);
                setEmail(response.data);
                setLoading(false);
                
                // Check if email is spam
                const spamResponse = await axios.post("http://localhost:5000/api/email/spam-detect", {
                    emailText: response.data.body
                });
                setIsSpam(spamResponse.data.spam);
            } catch (error) {
                console.error("Error fetching email details:", error);
                setLoading(false);
            }
        };

        fetchEmailDetails();
    }, [id]);

    return (
        <div className="email-details-container">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            {loading ? (
                <p>Loading email...</p>
            ) : email ? (
                <div className="email-content">
                    <h2>{email.subject}</h2>
                    <p><strong>From:</strong> {email.from}</p>
                    <p><strong>To:</strong> {email.to}</p>
                    <p><strong>Status:</strong> {isSpam ? <span style={{ color: "red" }}>Spam</span> : <span style={{ color: "green" }}>Inbox</span>}</p>
                    <hr />
                    <p className="email-body">{email.body}</p>
                </div>
            ) : (
                <p>Error loading email.</p>
            )}
        </div>
    );
}

export default EmailDetails;
