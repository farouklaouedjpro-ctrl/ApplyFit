import { keywordDatabase } from './data.js';
import { tokenize } from './utils.js';

export function analyzeKeywords(cvText, offerText) {
  const cvTokens = tokenize(cvText);
  const cvTokensSet = new Set(cvTokens);
  const cvLower = cvText.toLowerCase();
  const offerLower = offerText.toLowerCase();
  const offerTokens = new Set(tokenize(offerText));
  const categories = {};

  for (const [catKey, category] of Object.entries(keywordDatabase)) {
    const cvFound = [];
    const offerFound = [];
    const missingFromCV = [];

    for (const kw of category.keywords) {
      const isMulti = kw.includes(' ') || kw.includes('-');
      const inOffer = isMulti ? offerLower.includes(kw) : offerTokens.has(kw);
      const inCV = isMulti ? cvLower.includes(kw) : cvTokensSet.has(kw);
      if (inOffer) offerFound.push(kw);
      if (inOffer && inCV) cvFound.push(kw);
      if (inOffer && !inCV) missingFromCV.push(kw);
    }

    const totalRelevant = offerFound.length;
    let score = 0;
    if (totalRelevant > 0) score = Math.round((cvFound.length / totalRelevant) * 100);

    categories[catKey] = { label: category.label, score, found: cvFound, missing: missingFromCV, total: totalRelevant };
  }
  return categories;
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
