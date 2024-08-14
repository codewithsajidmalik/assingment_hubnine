const express = require('express');
const { google } = require('googleapis');
const credentials = require('./credentials.json'); // Your Google credentials

const app = express();
const port = 5000;

const oauth2Client = new google.auth.OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

// Generate the URL for authorization
app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/documents'],
  });
  res.redirect(authUrl);
});

// Handle the OAuth2 callback
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.redirect('/create-doc');
});

// Create a new Google Doc
app.get('/create-doc', async (req, res) => {
  const docs = google.docs({ version: 'v1', auth: oauth2Client });

  const doc = await docs.documents.create({
    requestBody: {
      title: 'Drag-and-Drop Feature Design',
    },
  });

  const documentId = doc.data.documentId;

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: 'Flow Diagram for Drag-and-Drop Feature\n\n',
          },
        },
        {
          insertText: {
            location: { index: 2 },
            text: 'Your Thought Process for Designing a Drag-and-Drop Feature\n\n',
          },
        },
      ],
    },
  });

  res.send(`Document created! Document ID: ${documentId}`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
