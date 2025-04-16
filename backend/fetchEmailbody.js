require("dotenv").config();
const Imap = require("imap-simple");
const { simpleParser } = require("mailparser");

const config = {
    imap: {
        user: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        authTimeout: 30000,
        tlsOptions: { rejectUnauthorized: false } // Fix for self-signed certificate error
    }
};

async function fetchEmailBody(uid) {
    try {
        const connection = await Imap.connect(config);
        console.log("Connected to IMAP server");

        await connection.openBox("INBOX");

        // Search for the email using UID
        const searchCriteria = [uid];  
        const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: false };

        const results = await connection.search(searchCriteria, fetchOptions);

        if (results.length === 0) {
            connection.end();
            return { message: "Email not found" };
        }

        // Extract email details
        const res = results[0];
        const headerPart = res.parts.find((part) => part.which === "HEADER");
        const bodyPart = res.parts.find((part) => part.which === "TEXT");

        const parsedHeader = headerPart ? headerPart.body : {};
        const parsedBody = bodyPart ? await simpleParser(bodyPart.body) : null;

        const emailBody = {
            uid,
            subject: parsedHeader.subject ? parsedHeader.subject[0] : "No Subject",
            from: parsedHeader.from ? parsedHeader.from[0] : "Unknown Sender",
            to: parsedHeader.to ? parsedHeader.to[0] : "Unknown Recipient",
            body: parsedBody ? parsedBody.text : "No Body"
        };

        connection.end();
        return emailBody;

    } catch (error) {
        console.error("Error fetching email body:", error);
        return { message: "Error fetching email" };
    }
}

module.exports = fetchEmailBody;
