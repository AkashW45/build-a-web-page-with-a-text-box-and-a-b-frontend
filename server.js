const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;

// Middleware to parse JSON bodies
app.use(express.json());

// Health endpoint (liveness probe, no dependencies)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Reverse text endpoint
app.post('/reverse', (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'text field must be a string' });
  }
  const reversed = text.split('').reverse().join('');
  res.json({ reversed });
});

// Serve enhanced index.html at root with Pico.css injected
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Internal Server Error');
      return;
    }
    // Inject Pico.css link before closing head tag
    const picoLink = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">';
    const modifiedHtml = data.replace('</head>', `${picoLink}\n</head>`);
    res.setHeader('Content-Type', 'text/html');
    res.send(modifiedHtml);
  });
});

// Serve other static files (excluding index.html to avoid double serving)
app.use(express.static(path.join(__dirname, 'public')));

// Start server on port 8000, bind to all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
