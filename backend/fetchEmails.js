require("dotenv").config();
const Imap = require("imap-simple");

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

async function fetchEmails() {
    try {
        const connection = await Imap.connect(config);
        console.log("Connected to IMAP server");

        await connection.openBox("INBOX");

        // Fetch all email UIDs and headers
        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER'],
            markSeen: false
        };
        
        const results = await connection.search(searchCriteria, fetchOptions);
        
        // Sort by UID in descending order (latest first), then slice the latest 10
        const sortedResults = results
            .sort((a, b) => b.attributes.uid - a.attributes.uid)
            .slice(0, 5);
        
        const emails = sortedResults.map((res) => {
            const headerPart = res.parts.find((part) => part.which === "HEADER");
            return {
                id: res.attributes.uid,
                subject: headerPart?.body?.subject?.[0] || "No Subject",
                from: headerPart?.body?.from?.[0] || "Unknown Sender",
            };
        });
        

        console.log(emails);
        connection.end();
        return emails;

    } catch (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
}

module.exports = fetchEmails;
