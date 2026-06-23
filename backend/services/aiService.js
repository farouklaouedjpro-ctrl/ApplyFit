import { buildAnalysisPrompt } from '../prompts/analyzePrompt.js';
import { createChildLogger } from '../utils/logger.js';
import { queryOpenCodeGo } from './aiClient.js';

const logger = createChildLogger('aiService');

export function parseJSONResponse(text) {
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const extracted = cleaned.match(/\{[\s\S]*\}/);
  if (extracted) cleaned = extracted[0];
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    logger.warn('Échec du parsing de la réponse JSON', {
      error: err.message,
      preview: cleaned.slice(0, 500),
    });
    throw err;
  }
}

export function validateAnalysisResponse(parsed) {
  const errors = [];

  if (typeof parsed.globalScore !== 'number' || parsed.globalScore < 0 || parsed.globalScore > 100) {
    errors.push(`globalScore invalide: ${parsed.globalScore} (doit être entre 0 et 100)`);
  }

  if (!parsed.categories || typeof parsed.categories !== 'object') {
    errors.push('categories manquant ou invalide');
  } else {
    const requiredCats = ['technical', 'soft', 'tools', 'education', 'languages', 'experience'];
    for (const key of requiredCats) {
      const cat = parsed.categories[key];
      if (!cat) {
        errors.push(`catégorie "${key}" manquante`);
        continue;
      }
      if (typeof cat.score !== 'number' || cat.score < 0 || cat.score > 100) {
        errors.push(`score de "${key}" invalide: ${cat.score}`);
      }
      if (!Array.isArray(cat.found)) {
        errors.push(`"${key}.found" doit être un tableau`);
      }
      if (!Array.isArray(cat.missing)) {
        errors.push(`"${key}.missing" doit être un tableau`);
      }
      if (Array.isArray(cat.found) && hasDuplicates(cat.found)) {
        errors.push(`doublons dans "${key}.found"`);
      }
      if (Array.isArray(cat.missing) && hasDuplicates(cat.missing)) {
        errors.push(`doublons dans "${key}.missing"`);
      }
    }
  }

  if (!Array.isArray(parsed.missingKeywords)) {
    errors.push('missingKeywords doit être un tableau');
  } else {
    for (let i = 0; i < parsed.missingKeywords.length; i++) {
      const mk = parsed.missingKeywords[i];
      if (!mk.keyword) {
        errors.push(`missingKeywords[${i}].keyword manquant`);
      }
      if (!mk.concreteSkill) {
        errors.push(`missingKeywords[${i}].concreteSkill manquant`);
      }
    }
    if (hasDuplicates(parsed.missingKeywords.map(mk => mk.keyword?.toLowerCase()))) {
      errors.push('doublons dans missingKeywords (même keyword détecté plusieurs fois)');
    }
  }

  if (!Array.isArray(parsed.reformulationAdvice)) {
    errors.push('reformulationAdvice doit être un tableau');
  } else {
    for (let i = 0; i < parsed.reformulationAdvice.length; i++) {
      const ra = parsed.reformulationAdvice[i];
      if (!ra.cvSays) errors.push(`reformulationAdvice[${i}].cvSays manquant`);
      if (!ra.offerRequires) errors.push(`reformulationAdvice[${i}].offerRequires manquant`);
      if (!ra.suggestion) errors.push(`reformulationAdvice[${i}].suggestion manquant`);
    }
  }

  if (!Array.isArray(parsed.alerts)) {
    errors.push('alerts doit être un tableau');
  }

  if (errors.length > 0) {
    logger.warn('Validation de la réponse IA échouée', { errors });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function hasDuplicates(arr) {
  if (!Array.isArray(arr)) return false;
  const seen = new Set();
  for (const item of arr) {
    const key = typeof item === 'string' ? item.toLowerCase().trim() : item;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

export function deduplicate(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  return arr.filter(item => {
    const key = typeof item === 'string' ? item.toLowerCase().trim() : item;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function analyzeWithAI(cvText, offerText) {
  logger.info('Démarrage analyse IA', {
    cvTextLength: cvText.length,
    offerTextLength: offerText.length,
  });

  const prompt = buildAnalysisPrompt(cvText, offerText);
  const rawResponse = await queryOpenCodeGo(prompt);
  const parsed = parseJSONResponse(rawResponse);

  const validation = validateAnalysisResponse(parsed);
  if (!validation.valid) {
    throw new Error('Validation de la réponse OpenCode Go échouée: ' + validation.errors.join('; '));
  }

  const defaultCategories = {
    technical: { label: 'Compétences techniques' },
    soft: { label: 'Soft skills' },
    tools: { label: 'Outils & logiciels' },
    education: { label: 'Formation & diplômes' },
    languages: { label: 'Langues' },
    experience: { label: 'Expérience & secteurs' },
  };

  const categories = {};
  for (const [key, meta] of Object.entries(defaultCategories)) {
    const cat = parsed.categories?.[key] || {};
    const found = deduplicate(Array.isArray(cat.found) ? cat.found : []);
    const missing = deduplicate(Array.isArray(cat.missing) ? cat.missing : []);
    categories[key] = {
      label: meta.label,
      score: clampScore(typeof cat.score === 'number' ? cat.score : 0),
      found,
      missing,
      total: found.length + missing.length,
    };
  }

  const seenMissingKeywords = new Set();
  const missingKeywords = (Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [])
    .filter(mk => {
      const kw = (mk.keyword || '').toLowerCase().trim();
      if (!kw || seenMissingKeywords.has(kw)) return false;
      seenMissingKeywords.add(kw);
      return true;
    })
    .slice(0, 10)
    .map(mk => ({
      category: mk.category || 'technical',
      keyword: mk.keyword || '',
      concreteSkill: mk.concreteSkill || mk.keyword || '',
    }));

  const result = {
    globalScore: clampScore(typeof parsed.globalScore === 'number' ? parsed.globalScore : 0),
    confidence: typeof parsed.confidence === 'number' ? clampScore(parsed.confidence) : null,
    categories,
    missingKeywords,
    reformulationAdvice: (Array.isArray(parsed.reformulationAdvice) ? parsed.reformulationAdvice : []).slice(0, 5).map(ra => ({
      cvSays: ra.cvSays || '',
      offerRequires: ra.offerRequires || '',
      suggestion: ra.suggestion || '',
    })),
    alerts: (Array.isArray(parsed.alerts) ? parsed.alerts : []).slice(0, 3).map(a => ({
      type: a.type || 'education_level',
      offerRequires: a.offerRequires || '',
      cvShows: a.cvShows || '',
      suggestion: a.suggestion || '',
    })),
  };

  logger.info('Analyse IA finalisée', {
    globalScore: result.globalScore,
    confidence: result.confidence,
    categoriesCount: Object.keys(result.categories).length,
    missingKeywordsCount: result.missingKeywords.length,
  });

  return result;
}
