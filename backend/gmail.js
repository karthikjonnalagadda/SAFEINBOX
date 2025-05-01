const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX'],
    maxResults: 10,
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const messages = res.data.messages;
    if (messages.length) {
      messages.forEach((message) => {
        gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        }, (err, msgRes) => {
          if (err) return console.log('Error fetching message', err);
          const emailBody = msgRes.data.snippet;
          console.log('Email:', emailBody);
          // Pass this to your ML model
        });
      });
    } else {
      console.log('No messages found.');
    }
  });
}

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listMessages);
});
