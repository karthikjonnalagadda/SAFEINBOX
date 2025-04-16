require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fetchEmails = require("./fetchEmails.js");
const fetchEmailbody = require("./fetchEmailbody.js");
const axios = require("axios");
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with Auto Reconnect
const connectWithRetry = () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
        console.log("🔄 Retrying MongoDB connection in 5 seconds...");
        setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

// Import Routes
const authRoutes = require("./routes/auth");
const emailRoutes = require("./routes/email");

app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);

// Fetch Emails Route
app.get("/api/emails", async (req, res) => {
    try {
        const emails = await fetchEmails();
        res.json(emails);
    } catch (error) {
        console.error("❌ Error fetching emails:", error);
        res.status(500).json({ message: "Error fetching emails", error: error.message });
    }
});

// API Endpoint to Fetch Email Body
app.get("/api/emailDetail/:id", async (req, res) => {
    try {
        const email = await fetchEmailbody(req.params.id);
        if (!email) {
            return res.status(404).json({ message: "Email not found" });
        }

        res.json(email);
    } catch (error) {
        console.error("❌ Error fetching email body:", error);
        res.status(500).json({ message: "Error fetching email details", error: error.message });
    }
});

// Default Route
app.get("/", (req, res) => {
    res.send("🚀 SafeInbox API is Running...");
});

// Route to get spam prediction
app.post("/api/classify-email", async (req, res) => {
    const { emailText } = req.body; // email text from frontend

    try {
        // Call the Flask API
        const response = await axios.post("http://127.0.0.1:5000/predict", {
            message: emailText,
        });

        const prediction = response.data.prediction; // spam/ham

        // Return prediction result
        res.json({ prediction });
    } catch (error) {
        console.error("Error while calling the Python API:", error);
        res.status(500).json({ error: "Failed to classify email." });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
