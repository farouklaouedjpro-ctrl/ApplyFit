import { Router } from 'express';
import { analyzeWithAI } from '../services/aiService.js';
import logger from '../utils/logger.js';

const router = Router();
const ANALYZE_TIMEOUT_MS = Number(process.env.ANALYZE_TIMEOUT_MS) || 120000;

router.post('/', async (req, res) => {
  const { cvText, offerText } = req.body;
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: l'analyse IA a pris trop de temps")), ANALYZE_TIMEOUT_MS)
    );
    const result = await Promise.race([analyzeWithAI(cvText, offerText), timeoutPromise]);
    logger.info('Analyse IA terminée avec succès', {
      context: 'analyze',
      ip: req.ip || req.connection.remoteAddress,
      cvTextLength: cvText.length,
      offerTextLength: offerText.length,
      globalScore: result.globalScore,
    });
    res.json(result);
  } catch (err) {
    logger.error('Erreur lors de l\'analyse IA', {
      context: 'analyze',
      ip: req.ip || req.connection.remoteAddress,
      cvTextLength: cvText.length,
      offerTextLength: offerText.length,
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Erreur analyse IA.' });
  }
});

export default router;
