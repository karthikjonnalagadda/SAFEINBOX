require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

const fetchEmails = require("./fetchEmailbody"); // ✅ Correct: fetch multiple emails
const fetchEmailbody = require("./fetchEmailbody"); // ✅ For fetching single email by id

const authRoutes = require("./routes/auth");
const emailRoutes = require("./routes/email");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection (Updated: No more deprecation warning)
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => {
      console.error("❌ MongoDB Connection Error:", err.message);
      console.log("🔄 Retrying MongoDB connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);

// Fetch and classify emails
app.get("/api/emails", async (req, res) => {
  try {
    const emails = await fetchEmails();

    if (!Array.isArray(emails)) {
      return res.status(500).json({ message: "Expected an array of emails, got something else." });
    }
    if (emails.length === 0) {
      return res.status(404).json({ message: "No new emails found." });
    }

    const classifiedEmails = await Promise.all(
      emails.map(async (email) => {
        const emailText = `${email.subject} ${email.body}`;
        try {
          const { data } = await axios.post("http://127.0.0.1:5000/predict", { message: emailText });

          return {
            ...email,
            isSpam: data.prediction === 1 ? "spam" : "ham",
            confidence: data.confidence || "N/A",
          };
        } catch (error) {
          console.error(`⚠️ Prediction error for [${email.subject}]:`, error.message);
          return {
            ...email,
            isSpam: "unknown",
            confidence: "N/A",
          };
        }
      })
    );

    res.json(classifiedEmails);
  } catch (error) {
    console.error("❌ Error fetching emails:", error);
    res.status(500).json({ message: "Error fetching and classifying emails.", error: error.message });
  }
});

// Fetch full email details by ID
app.get("/api/emailDetail/:id", async (req, res) => {
  try {
    const email = await fetchEmailbody(req.params.id);

    if (!email) {
      return res.status(404).json({ message: "Email not found." });
    }

    res.json(email);
  } catch (error) {
    console.error("❌ Error fetching email body:", error);
    res.status(500).json({ message: "Error fetching email details.", error: error.message });
  }
});

// Classify one email text
app.post("/api/classify-email", async (req, res) => {
  const { emailText } = req.body;

  try {
    const { data } = await axios.post("http://127.0.0.1:5000/predict", { message: emailText });

    res.json({
      prediction: data.prediction === 1 ? "spam" : "ham",
      confidence: data.confidence || "N/A",
    });
  } catch (error) {
    console.error("❌ Error classifying email:", error.message);
    res.status(500).json({ error: "Failed to classify email." });
  }
});

// Health Check
app.get("/", (req, res) => {
  res.send("🚀 SafeInbox API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on http://localhost:${PORT}`));
