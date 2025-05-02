require("dotenv").config();
const Imap = require("imap-simple");
const { htmlToText } = require("html-to-text");

const config = {
  imap: {
    user: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT),
    tls: true,
    authTimeout: 10000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

async function fetchEmails(limit = 7) {
  let connection;
  try {
    connection = await Imap.connect(config);
    await connection.openBox('INBOX', { readOnly: true });

    const results = await connection.search(['ALL'], {
      bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
      struct: true,
    });

    const recent = results
      .sort((a, b) => b.attributes.uid - a.attributes.uid)
      .slice(0, Math.min(limit, results.length));

    const emails = recent.map(item => {
      const header = item.parts.find(p => p.which.startsWith('HEADER')).body;
      const rawBody = item.parts.find(p => p.which === 'TEXT')?.body || "Body not fetched";

      const body = htmlToText(rawBody, {
        wordwrap: false,
        ignoreImage: true,
        preserveNewlines: true,
      }).trim();

      return {
        id: item.attributes.uid,
        subject: header.subject?.[0] || "No Subject",
        from: header.from?.[0] || "Unknown Sender",
        date: header.date?.[0] || "Unknown Date",
        body,
      };
    });

    return emails;
  } catch (error) {
    console.error("❌ IMAP Error:", error.message);
    return [];
  } finally {
    if (connection) connection.end();
  }
}

module.exports = fetchEmails;
