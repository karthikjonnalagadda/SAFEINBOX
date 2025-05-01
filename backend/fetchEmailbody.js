require("dotenv").config();
const Imap = require("imap-simple");

const config = {
  imap: {
    user: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT),
    tls: true,
    authTimeout: 30000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

async function fetchEmails(limit = 5) {  // 👈 added limit parameter (default 8)
  try {
    const connection = await Imap.connect(config);
    console.log("✅ Connected to IMAP server");

    await connection.openBox('INBOX', { readOnly: true });

    const searchCriteria = ['ALL'];  
    const fetchOptions = {
      bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
      struct: true
    };

    const results = await connection.search(searchCriteria, fetchOptions);
    
    // Sort emails by UID in descending order and limit by the parameter
    const recent = results
      .sort((a, b) => b.attributes.uid - a.attributes.uid)
      .slice(0, limit);  // 👈 use the limit value

    const emails = recent.map(item => {
      const header = item.parts.find(part => part.which.startsWith('HEADER')).body;
      const bodyPart = item.parts.find(part => part.which === 'TEXT');

      return {
        id: item.attributes.uid,
        subject: header.subject ? header.subject[0] : "No Subject",
        from: header.from ? header.from[0] : "Unknown Sender",
        date: header.date ? header.date[0] : "Unknown Date",
        body: bodyPart?.body || "No Body",
      };
    });

    console.log(`📥 Fetched ${emails.length} Emails:`, emails);

    connection.end();
    return emails;
  } catch (error) {
    console.error("❌ Error fetching emails:", error.message || error);
    return [];
  }
}

module.exports = fetchEmails;
