require("dotenv").config();
const Imap = require("imap");
const { htmlToText } = require("html-to-text");

function fetchEmails(limit = 10) {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const emails = [];

    function cleanupAndReject(err) {
      try { imap.end(); } catch {}
      reject(err);
    }

    imap.once("ready", () => {
      imap.openBox("INBOX", true, (err, box) => {
        if (err) return cleanupAndReject(err);

        imap.search(["ALL"], (err, results) => {
          if (err) return cleanupAndReject(err);
          if (!results?.length) return resolve([]);

          const latest = results.slice(-limit);

          const fetch = imap.fetch(latest, {
            bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
            struct: true,
          });

          fetch.on("message", msg => {
            let headerBuffer = "", bodyBuffer = "";

            msg.on("body", (stream, info) => {
              stream.on("data", chunk => {
                if (info.which === "TEXT") bodyBuffer += chunk.toString("utf8");
                else headerBuffer += chunk.toString("utf8");
              });
            });

            msg.once("end", () => {
              const headers = parseHeaders(headerBuffer);
              const bodyText = htmlToText(bodyBuffer || "", { wordwrap: false });

              emails.push({
                subject: headers.subject || "No Subject",
                from: headers.from || "Unknown Sender",
                date: headers.date || "Unknown Date",
                body: bodyText,
              });
            });
          });

          fetch.once("end", () => {
            imap.end();
            resolve(emails);
          });

          fetch.once("error", cleanupAndReject);
        });
      });
    });

    imap.once("error", cleanupAndReject);
    imap.connect();
  });
}

// Safe header parser
function parseHeaders(headerStr) {
  const headers = {};
  const lines = headerStr.split(/\r?\n/);

  for (const line of lines) {
    if (line.startsWith("From:")) headers.from = line.replace("From:", "").trim();
    else if (line.startsWith("Subject:")) headers.subject = line.replace("Subject:", "").trim();
    else if (line.startsWith("Date:")) headers.date = line.replace("Date:", "").trim();
  }
  return headers;
}

module.exports = fetchEmails;
