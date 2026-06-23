import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeWithAI } from './services/aiService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rate limiting: max 10 analyses per IP per 5 minutes
const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 5 * 60 * 1000;

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return next();
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Trop de requêtes. Réessayez dans quelques minutes.' });
  }
  next();
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.start > RATE_WINDOW) rateLimitMap.delete(ip);
  }
}, RATE_WINDOW);

const MAX_TEXT_LENGTH = 50000;

function validateAnalyzeInput(req, res, next) {
  const { cvText, offerText } = req.body;
  if (typeof cvText !== 'string' || typeof offerText !== 'string') {
    return res.status(400).json({ error: 'CV et offre doivent être du texte.' });
  }
  if (!cvText.trim() || !offerText.trim()) {
    return res.status(400).json({ error: 'CV et offre sont requis.' });
  }
  if (cvText.length > MAX_TEXT_LENGTH || offerText.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: `Texte trop long. Maximum : ${MAX_TEXT_LENGTH} caractères.` });
  }
  req.body.cvText = cvText.trim();
  req.body.offerText = offerText.trim();
  next();
}

const ANALYZE_TIMEOUT_MS = Number(process.env.ANALYZE_TIMEOUT_MS) || 60000;

app.post('/api/analyze', rateLimit, validateAnalyzeInput, async (req, res) => {
  const { cvText, offerText } = req.body;
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: l\'analyse IA a pris trop de temps')), ANALYZE_TIMEOUT_MS)
    );
    const result = await Promise.race([analyzeWithAI(cvText, offerText), timeoutPromise]);
    res.json(result);
  } catch (err) {
    console.error('AI analysis error:', err.message);
    res.status(500).json({ error: 'Erreur analyse IA.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`ApplyFit backend running on http://localhost:${PORT}`);
});
