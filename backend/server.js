require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

const fetchEmails = require("./fetchEmailbody");
const authRoutes = require("./routes/auth");
const emailRoutes = require("./routes/email");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);

// === Fetch and classify emails ===
app.get("/api/emails", async (req, res) => {
  try {
    const limit = 7;
    const emails = await fetchEmails(limit);

    if (!emails.length) {
      return res.status(404).json({ message: "No emails found." });
    }

    const classifiedEmails = await Promise.all(
      emails.map(async (email) => {
        const message = `${email.subject} ${email.body}`;
        try {
          const { data } = await axios.post(
            process.env.ML_API_URL,
            { message },
            { timeout: 5000 }
          );

          const confidenceScore = data.confidence ?? 0;
          const prediction = confidenceScore >= 0.6 ? "spam" : "ham";

          return {
            ...email,
            isSpam: prediction,
            confidence: `${(confidenceScore * 100).toFixed(2)}%`,
          };
        } catch (err) {
          console.error("❌ ML API Error:", err.message);
          return {
            ...email,
            isSpam: "unknown",
            confidence: "N/A",
          };
        }
      })
    );

    res.json({
      totalEmails: emails.length,
      emails: classifiedEmails,
    });
  } catch (err) {
    console.error("❌ Error in /api/emails:", err.message);
    res.status(500).json({ message: "Server error during email processing." });
  }
});

// === Fetch full email detail by ID ===
app.get("/api/emailDetail/:id", async (req, res) => {
  try {
    const emailId = req.params.id;
    const emails = await fetchEmails(7);
    const email = emails.find(e => String(e.id) === emailId);

    if (!email) return res.status(404).json({ message: "Email not found." });
    res.json(email);
  } catch (err) {
    console.error("❌ Error in /api/emailDetail/:id:", err.message);
    res.status(500).json({ message: "Failed to fetch email by ID." });
  }
});

// === Health check ===
app.get("/", (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1
    ? "MongoDB is connected"
    : "MongoDB is not connected";
  res.json({ message: "🚀 SafeInbox API is running...", mongoStatus });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});
