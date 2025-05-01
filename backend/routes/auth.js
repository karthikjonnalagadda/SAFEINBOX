const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Store in .env

// Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: "Please enter all fields" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword });

        await user.save();
        res.status(201).json({ msg: "User registered successfully" });
    } catch (error) {
        console.error("❌ Registration Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Please enter all fields" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("❌ Login Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Google Login
router.post("/google-login", async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Hash Google sub to store as password (optional)
            const hashedSub = await bcrypt.hash(sub, 10);
            user = new User({ name, email, password: hashedSub });
            await user.save();
        }

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({
            token: jwtToken,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("❌ Google Login Error:", error.message);
        res.status(401).json({ msg: "Google authentication failed" });
    }
});

module.exports = router;
