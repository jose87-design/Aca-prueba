import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', date: new Date() });
});

// --- Example endpoint ---
app.get('/api/candidates', async (_req, res, next) => {
  try {
    const data = await fetchMockCandidates();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Mock data function – replace with real API calls later
async function fetchMockCandidates() {
  return [
    { id: 1, name: 'Jane Doe', skills: ['React', 'Node'] },
    { id: 2, name: 'John Doe', skills: ['Python', 'Django'] }
  ];
}

// --- Error handler ---
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
