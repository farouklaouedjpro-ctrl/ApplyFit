import { analyzeRequestSchema } from '../schemas/analyzeRequest.js';

export function validateAnalyzeRequest(req, res, next) {
  const result = analyzeRequestSchema.safeParse(req.body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || 'Données invalides.';
    return res.status(400).json({ error: firstError });
  }

  req.body.cvText = result.data.cvText;
  req.body.offerText = result.data.offerText;
  next();
}
