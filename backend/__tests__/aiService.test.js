import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseJSONResponse,
  hasDuplicates,
  deduplicate,
  clampScore,
} from '../utils/aiHelpers.js';
import { validateAnalysisResponse } from '../services/aiService.js';

describe('parseJSONResponse', () => {
  it('parse un JSON simple', () => {
    const result = parseJSONResponse('{"a":1}');
    assert.deepStrictEqual(result, { a: 1 });
  });

  it('parse un JSON entouré de markdown', () => {
    const input = '```json\n{"a":1}\n```';
    assert.deepStrictEqual(parseJSONResponse(input), { a: 1 });
  });

  it('extrait le JSON quand il y a du texte avant/après', () => {
    const input = 'Voici le résultat : {"a":1} fin du texte';
    assert.deepStrictEqual(parseJSONResponse(input), { a: 1 });
  });

  it('lance une erreur sur du JSON invalide', () => {
    assert.throws(() => parseJSONResponse('pas du json'));
  });
});

describe('hasDuplicates', () => {
  it('retourne false pour un tableau sans doublons', () => {
    assert.strictEqual(hasDuplicates(['a', 'b', 'c']), false);
  });

  it('retourne true pour un tableau avec doublons', () => {
    assert.strictEqual(hasDuplicates(['a', 'b', 'a']), true);
  });

  it('détecte les doublons case-insensitive', () => {
    assert.strictEqual(hasDuplicates(['Docker', 'docker']), true);
  });

  it('retourne false pour un tableau vide', () => {
    assert.strictEqual(hasDuplicates([]), false);
  });

  it('retourne false pour un non-tableau', () => {
    assert.strictEqual(hasDuplicates(null), false);
    assert.strictEqual(hasDuplicates(undefined), false);
  });
});

describe('deduplicate', () => {
  it('supprime les doublons', () => {
    assert.deepStrictEqual(deduplicate(['a', 'b', 'a']), ['a', 'b']);
  });

  it('supprime les doublons case-insensitive', () => {
    assert.deepStrictEqual(deduplicate(['Docker', 'docker', 'K8s']), ['Docker', 'K8s']);
  });

  it('supprime les chaînes vides', () => {
    assert.deepStrictEqual(deduplicate(['a', '', 'b']), ['a', 'b']);
  });

  it('retourne un tableau vide pour un non-tableau', () => {
    assert.deepStrictEqual(deduplicate(null), []);
    assert.deepStrictEqual(deduplicate(undefined), []);
  });
});

describe('clampScore', () => {
  it('arrondit et clamp entre 0 et 100', () => {
    assert.strictEqual(clampScore(50), 50);
    assert.strictEqual(clampScore(50.4), 50);
    assert.strictEqual(clampScore(50.5), 51);
    assert.strictEqual(clampScore(-10), 0);
    assert.strictEqual(clampScore(150), 100);
  });
});

describe('validateAnalysisResponse', () => {
  const validResponse = {
    globalScore: 75,
    categories: {
      technical: { score: 80, found: ['python'], missing: ['docker'] },
      soft: { score: 60, found: [], missing: [] },
      tools: { score: 0, found: [], missing: [] },
      education: { score: 100, found: ['master'], missing: [] },
      languages: { score: 100, found: [], missing: [] },
      experience: { score: 50, found: ['stage'], missing: ['cdi'] },
    },
    missingKeywords: [
      { keyword: 'docker', concreteSkill: 'Conteneurisation Docker' },
    ],
    reformulationAdvice: [
      { cvSays: 'Suivi client', offerRequires: 'Gestion de portefeuille', suggestion: 'Gestion proactive' },
    ],
    alerts: [],
  };

  it('valide une réponse correcte', () => {
    const result = validateAnalysisResponse(validResponse);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });

  it('détecte un globalScore manquant', () => {
    const resp = { ...validResponse, globalScore: undefined };
    const result = validateAnalysisResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('globalScore')));
  });

  it('détecte un globalScore hors limites', () => {
    const resp = { ...validResponse, globalScore: 150 };
    const result = validateAnalysisResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('globalScore')));
  });

  it('détecte une catégorie manquante', () => {
    const resp = { ...validResponse };
    delete resp.categories.technical;
    const result = validateAnalysisResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('technical')));
  });

  it('détecte les doublons dans found', () => {
    const resp = {
      ...validResponse,
      categories: {
        ...validResponse.categories,
        technical: { score: 80, found: ['python', 'Python'], missing: [] },
      },
    };
    const result = validateAnalysisResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('doublons')));
  });

  it('détecte missingKeywords avec keyword manquant', () => {
    const resp = {
      ...validResponse,
      missingKeywords: [{ concreteSkill: 'test' }],
    };
    const result = validateAnalysisResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('keyword')));
  });

  it('détecte les doublons dans missingKeywords', () => {
    const resp = {
      ...validResponse,
      missingKeywords: [
        { keyword: 'docker', concreteSkill: 'A' },
        { keyword: 'docker', concreteSkill: 'B' },
      ],
    };
    const result = validateAnalysisResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('doublons dans missingKeywords')));
  });

  it('détecte reformulationAdvice avec champ manquant', () => {
    const resp = {
      ...validResponse,
      reformulationAdvice: [{ cvSays: 'test' }],
    };
    const result = validateAnalysisResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('offerRequires')));
  });
});
