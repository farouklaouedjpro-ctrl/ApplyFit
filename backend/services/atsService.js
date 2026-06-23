import { buildATSPrompt } from '../prompts/atsPrompt.js';
import { queryOpenCodeGo } from './aiClient.js';
import { parseJSONResponse, clampScore } from '../utils/aiHelpers.js';
import { createChildLogger } from '../utils/logger.js';

const logger = createChildLogger('atsService');

const VALID_VERDICTS = ['Passe', 'À améliorer', 'Refusé'];

export function validateATSResponse(parsed) {
  const errors = [];

  if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
    errors.push(`score invalide: ${parsed.score} (doit être entre 0 et 100)`);
  }

  if (!VALID_VERDICTS.includes(parsed.verdict)) {
    errors.push(`verdict invalide: ${parsed.verdict} (doit être l'un de ${VALID_VERDICTS.join(', ')})`);
  }

  if (typeof parsed.summary !== 'string' || !parsed.summary.trim()) {
    errors.push('summary manquant ou invalide');
  }

  if (!Array.isArray(parsed.criteria)) {
    errors.push('criteria doit être un tableau');
  } else {
    for (let i = 0; i < parsed.criteria.length; i++) {
      const c = parsed.criteria[i];
      if (typeof c.name !== 'string' || !c.name.trim()) {
        errors.push(`criteria[${i}].name manquant`);
      }
      if (typeof c.passed !== 'boolean') {
        errors.push(`criteria[${i}].passed doit être un booléen`);
      }
      if (typeof c.score !== 'number' || c.score < 0 || c.score > 100) {
        errors.push(`criteria[${i}].score invalide: ${c.score}`);
      }
      if (typeof c.comment !== 'string') {
        errors.push(`criteria[${i}].comment manquant`);
      }
    }
  }

  if (!Array.isArray(parsed.recommendations)) {
    errors.push('recommendations doit être un tableau');
  } else {
    for (let i = 0; i < parsed.recommendations.length; i++) {
      if (typeof parsed.recommendations[i] !== 'string' || !parsed.recommendations[i].trim()) {
        errors.push(`recommendations[${i}] manquant ou invalide`);
      }
    }
  }

  if (errors.length > 0) {
    logger.warn('Validation de la réponse ATS échouée', { errors });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function analyzeATS(cvText, offerText) {
  logger.info('Démarrage analyse ATS', {
    cvTextLength: cvText.length,
    offerTextLength: offerText.length,
  });

  const prompt = buildATSPrompt(cvText, offerText);
  const rawResponse = await queryOpenCodeGo(prompt);
  const parsed = parseJSONResponse(rawResponse);

  const validation = validateATSResponse(parsed);
  if (!validation.valid) {
    throw new Error('Validation de la réponse ATS échouée: ' + validation.errors.join('; '));
  }

  const result = {
    score: clampScore(typeof parsed.score === 'number' ? parsed.score : 0),
    verdict: parsed.verdict,
    summary: String(parsed.summary || '').trim(),
    criteria: (Array.isArray(parsed.criteria) ? parsed.criteria : []).map((c) => ({
      name: String(c.name || '').trim(),
      passed: Boolean(c.passed),
      score: clampScore(typeof c.score === 'number' ? c.score : 0),
      comment: String(c.comment || '').trim(),
    })),
    recommendations: (Array.isArray(parsed.recommendations) ? parsed.recommendations : [])
      .filter((r) => typeof r === 'string' && r.trim())
      .slice(0, 6),
  };

  logger.info('Analyse ATS finalisée', {
    score: result.score,
    verdict: result.verdict,
    criteriaCount: result.criteria.length,
    recommendationsCount: result.recommendations.length,
  });

  return result;
}
