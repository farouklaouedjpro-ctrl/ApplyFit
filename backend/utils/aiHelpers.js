import { createChildLogger } from './logger.js';

const logger = createChildLogger('aiHelpers');

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
