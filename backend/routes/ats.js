import { Router } from 'express';
import { analyzeATS } from '../services/atsService.js';
import logger from '../utils/logger.js';

const router = Router();
const ATS_TIMEOUT_MS = Number(process.env.ATS_TIMEOUT_MS) || 120000;

router.post('/', async (req, res) => {
  const { cvText, offerText } = req.body;
  let timeoutId;
  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Timeout: l'analyse ATS a pris trop de temps")), ATS_TIMEOUT_MS);
    });
    const result = await Promise.race([analyzeATS(cvText, offerText), timeoutPromise]);
    clearTimeout(timeoutId);
    logger.info('Analyse ATS terminée avec succès', {
      context: 'ats-score',
      ip: req.ip || req.connection.remoteAddress,
      cvTextLength: cvText.length,
      offerTextLength: offerText.length,
      score: result.score,
      verdict: result.verdict,
    });
    res.json(result);
  } catch (err) {
    clearTimeout(timeoutId);
    logger.error('Erreur lors de l analyse ATS', {
      context: 'ats-score',
      ip: req.ip || req.connection.remoteAddress,
      cvTextLength: cvText.length,
      offerTextLength: offerText.length,
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Erreur analyse ATS.' });
  }
});

export default router;
