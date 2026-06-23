import { SCORE_THRESHOLDS } from './data.js';

export const $ = (id) => document.getElementById(id);

export function getLevel(score) {
  if (score >= SCORE_THRESHOLDS.excellent) return 'excellent';
  if (score >= SCORE_THRESHOLDS.good) return 'good';
  if (score >= SCORE_THRESHOLDS.average) return 'average';
  return 'low';
}

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zàâçéèêëîïôûùüÿœæ0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((t) => t.length > 1);
}

export function deduplicateArray(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  return arr.filter((item) => {
    const key = String(item).toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function band(s) {
  if (s >= 75) return { color: '#16A34A', bg: '#E7F6EC', tint: '#B6E6C7' };
  if (s >= 55) return { color: '#D98A00', bg: '#FFF6E6', tint: '#F5D79A' };
  return { color: '#E5484D', bg: '#FDECEC', tint: '#F4B8B6' };
}

export function getAtsVerdict(score) {
  if (score >= 75) return 'Passe';
  if (score >= 55) return 'À améliorer';
  return 'Refusé';
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

export function calculateGlobalScore(categories) {
  let totalScore = 0,
    totalWeight = 0;
  const weights = { technical: 35, experience: 25, soft: 15, education: 15, languages: 5, tools: 5 };
  for (const [key, cat] of Object.entries(categories)) {
    const weight = weights[key] || 10;
    totalScore += cat.score * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 0;
  const base = Math.round(totalScore / totalWeight);
  const allMissing = Object.values(categories).reduce((acc, cat) => acc + cat.missing.length, 0);
  const penalty = Math.max(0, allMissing - 3) * 2;
  return Math.max(0, Math.min(100, base - penalty));
}

let toastTimeout = null;
export function showToast(message, type) {
  const el = $('toast');
  clearTimeout(toastTimeout);
  if (type === 'error') {
    el.style.background = '#FDECEC';
    el.style.color = '#9F1B1E';
    el.style.border = '1px solid #F6D4D3';
  } else if (type === 'warning') {
    el.style.background = '#FFFBEB';
    el.style.color = '#7A5E08';
    el.style.border = '1px solid #F2E2B5';
  } else {
    el.style.background = '#F4FBF6';
    el.style.color = '#15803D';
    el.style.border = '1px solid #C9EAD4';
  }
  el.textContent = message;
  el.style.display = 'block';
  el.style.opacity = '1';
  el.style.transform = 'translateX(-50%) translateY(0)';
  toastTimeout = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => {
      el.style.display = 'none';
    }, 300);
  }, 5000);
}
