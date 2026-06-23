import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeKeywords, calculateGlobalScore } from '../analysis.js';

describe('analyzeKeywords', () => {
  it('détecte les mots-clés présents dans le CV et l\'offre', () => {
    const cv = 'Développeur Python avec expérience React et SQL';
    const offer = 'Recherche développeur Python React SQL Docker';
    const categories = analyzeKeywords(cv, offer);

    assert.ok(categories.technical);
    assert.ok(categories.technical.found.includes('python'));
    assert.ok(categories.technical.found.includes('react'));
    assert.ok(categories.technical.found.includes('sql'));
    assert.ok(categories.technical.missing.includes('docker'));
  });

  it('retourne un score de 100 quand tous les mots-clés sont trouvés', () => {
    const cv = 'python react';
    const offer = 'python react';
    const categories = analyzeKeywords(cv, offer);
    assert.strictEqual(categories.technical.score, 100);
  });

  it('retourne un score de 0 quand aucun mot-clé n\'est trouvé', () => {
    const cv = 'Java Spring';
    const offer = 'python react docker';
    const categories = analyzeKeywords(cv, offer);
    assert.strictEqual(categories.technical.score, 0);
  });

  it('gère les mots-clés multi-mots', () => {
    const cv = 'Expérience en machine learning et deep learning';
    const offer = 'Recherche expert machine learning';
    const categories = analyzeKeywords(cv, offer);
    assert.ok(categories.technical.found.includes('machine learning'));
  });

  it('gère les textes vides', () => {
    const categories = analyzeKeywords('', '');
    assert.ok(categories.technical);
    assert.strictEqual(categories.technical.score, 0);
  });

  it('détecte les catégories multiple', () => {
    const cv = 'Python, communication, anglais, Excel, stage';
    const offer = 'Python communication anglais Excel stage';
    const categories = analyzeKeywords(cv, offer);
    assert.ok(categories.technical.score > 0);
    assert.ok(categories.soft.score > 0);
    assert.ok(categories.languages.score > 0);
    assert.ok(categories.tools.score > 0);
    assert.ok(categories.experience.score > 0);
  });
});

describe('calculateGlobalScore', () => {
  it('calcule un score pondéré', () => {
    const categories = {
      technical: { score: 100, found: ['a'], missing: [] },
      soft: { score: 100, found: [], missing: [] },
      tools: { score: 100, found: [], missing: [] },
      education: { score: 100, found: [], missing: [] },
      languages: { score: 100, found: [], missing: [] },
      experience: { score: 100, found: [], missing: [] },
    };
    assert.strictEqual(calculateGlobalScore(categories), 100);
  });

  it('applique une pénalité pour les compétences manquantes (> 3)', () => {
    const categories = {
      technical: { score: 100, found: ['a'], missing: ['b', 'c', 'd', 'e'] },
      soft: { score: 100, found: [], missing: [] },
      tools: { score: 100, found: [], missing: [] },
      education: { score: 100, found: [], missing: [] },
      languages: { score: 100, found: [], missing: [] },
      experience: { score: 100, found: [], missing: [] },
    };
    const score = calculateGlobalScore(categories);
    assert.ok(score < 100);
    assert.ok(score >= 90);
  });

  it('retourne 0 pour des catégories vides', () => {
    assert.strictEqual(calculateGlobalScore({}), 0);
  });

  it('clampe le score entre 0 et 100', () => {
    const categories = {
      technical: { score: 0, found: [], missing: ['a', 'b', 'c', 'd', 'e'] },
      soft: { score: 0, found: [], missing: [] },
      tools: { score: 0, found: [], missing: [] },
      education: { score: 0, found: [], missing: [] },
      languages: { score: 0, found: [], missing: [] },
      experience: { score: 0, found: [], missing: [] },
    };
    assert.strictEqual(calculateGlobalScore(categories), 0);
  });

  it('pondère correctement les catégories', () => {
    const categories = {
      technical: { score: 100, found: ['a'], missing: [] },
      soft: { score: 0, found: [], missing: [] },
      tools: { score: 0, found: [], missing: [] },
      education: { score: 0, found: [], missing: [] },
      languages: { score: 0, found: [], missing: [] },
      experience: { score: 0, found: [], missing: [] },
    };
    const score = calculateGlobalScore(categories);
    assert.strictEqual(score, 35);
  });
});
