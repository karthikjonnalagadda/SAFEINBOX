const Imap = require("imap");
const { simpleParser } = require("mailparser");

function fetchEmails() {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    imap.once("ready", function () {
      imap.openBox("INBOX", true, function (err, box) {
        if (err) {
          reject(err);
          return;
        }

        imap.search(['ALL'], function (err, results) {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            return resolve([]); // No emails
          }

          const fetch = imap.fetch(results, { bodies: "" });
          const emails = [];

          fetch.on("message", function (msg) {
            msg.on("body", function (stream) {
              let bodyBuffer = "";

              stream.on("data", function (chunk) {
                bodyBuffer += chunk.toString("utf8");
              });

              stream.once("end", async function () {
                try {
                  const parsed = await simpleParser(bodyBuffer);

                  emails.push({
                    subject: parsed.subject || "No Subject",
                    from: parsed.from?.text || "Unknown Sender",
                    date: parsed.date || "Unknown Date",
                    body: parsed.text || "No Body",
                  });
                } catch (parseErr) {
                  console.error("❌ Error parsing email:", parseErr.message);
                }
              });
            });
          });

          fetch.once("end", function () {
            imap.end();
            resolve(emails);
          });
        });
      });
    });

    imap.once("error", function (err) {
      reject(err);
    });

    imap.connect();
  });
}

module.exports = fetchEmails;
