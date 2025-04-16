const express = require("express");
const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const { PythonShell } = require("python-shell");

const router = express.Router();

const imapConfig = {
    imap: {
        user: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        tls: true,
        authTimeout: 30000
    }
};

// Fetch emails
router.get("/fetch-emails", async (req, res) => {
    try {
        const connection = await imaps.connect(imapConfig);
        await connection.openBox("INBOX");

        const searchCriteria = ["UNSEEN"];
        const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: false };

        const messages = await connection.search(searchCriteria, fetchOptions);
        let emailList = [];

        for (const msg of messages) {
            const email = await simpleParser(msg.parts.find(part => part.which === "TEXT").body);
            emailList.push({
                subject: email.subject,
                from: email.from.text,
                text: email.text
            });
        }

        res.json(emailList);
        connection.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
