import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import analyzeRouter from './routes/analyze.js';
import atsRouter from './routes/ats.js';
import logger from './utils/logger.js';
import requestLogger from './middleware/requestLogger.js';
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '5mb' }));
app.use(requestLogger());
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

app.use('/api/analyze', rateLimit, validateAnalyzeInput, analyzeRouter);
app.use('/api/ats-score', rateLimit, validateAnalyzeInput, atsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`ApplyFit backend running on http://localhost:${PORT}`, {
    context: 'startup',
    port: PORT,
    env: process.env.NODE_ENV || 'development',
  });
});
