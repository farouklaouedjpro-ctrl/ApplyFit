import { BACKEND_URL } from '../data.js';

const FETCH_TIMEOUT_MS = 120000;

export async function fetchAnalysis(cv, offer) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const result = await fetch(`${BACKEND_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvText: cv, offerText: offer }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!result.ok) {
    const errBody = await result.text().catch(() => '');
    throw new Error(`HTTP ${result.status}: ${errBody}`);
  }

  return result.json();
}

export async function fetchATSScoreData(cv, offer) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const result = await fetch(`${BACKEND_URL}/ats-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvText: cv, offerText: offer }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!result.ok) {
    const errBody = await result.text().catch(() => '');
    throw new Error(`HTTP ${result.status}: ${errBody}`);
  }

  return result.json();
}
