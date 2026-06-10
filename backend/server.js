import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeWithAI } from './services/aiService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/analyze', async (req, res) => {
  const { cvText, offerText } = req.body;
  if (!cvText || !offerText) {
    return res.status(400).json({ error: 'CV et offre sont requis.' });
  }
  try {
    const result = await analyzeWithAI(cvText, offerText);
    res.json(result);
  } catch (err) {
    console.error('AI analysis error:', err.message);
    res.status(500).json({ error: 'Erreur analyse IA.', detail: err.message });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', provider: 'gemini' });
});

app.listen(PORT, () => {
  console.log(`ApplyFit backend running on http://localhost:${PORT}`);
});
