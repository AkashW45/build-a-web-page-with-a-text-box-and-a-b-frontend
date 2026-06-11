const express = require('express');
const path = require('path');

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

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: serve index.html for the root URL (optional, since express.static handles it)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server on port 8000, bind to all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
