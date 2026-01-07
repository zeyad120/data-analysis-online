// Simple Express backend for quiz submissions
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = './submissions.json';

app.use(cors());
app.use(express.json());

// Helper: load and save submissions
function loadSubmissions() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function saveSubmissions(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API: Get all submissions
app.get('/api/submissions', (req, res) => {
  res.json(loadSubmissions());
});

// API: Add a submission
app.post('/api/submissions', (req, res) => {
  const { name, date } = req.body;
  if (!name || !date) return res.status(400).json({ error: 'Missing name or date' });
  const submissions = loadSubmissions();
  submissions.push({ name, date });
  saveSubmissions(submissions);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Quiz backend running on port ${PORT}`);
});
