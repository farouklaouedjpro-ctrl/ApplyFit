import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLevel, tokenize, deduplicateArray, band, calculateGlobalScore } from '../utils.js';

describe('getLevel', () => {
  it('retourne "excellent" pour un score >= 80', () => {
    assert.strictEqual(getLevel(80), 'excellent');
    assert.strictEqual(getLevel(100), 'excellent');
  });

  it('retourne "good" pour un score >= 60', () => {
    assert.strictEqual(getLevel(60), 'good');
    assert.strictEqual(getLevel(79), 'good');
  });

  it('retourne "average" pour un score >= 40', () => {
    assert.strictEqual(getLevel(40), 'average');
    assert.strictEqual(getLevel(59), 'average');
  });

  it('retourne "low" pour un score < 40', () => {
    assert.strictEqual(getLevel(0), 'low');
    assert.strictEqual(getLevel(39), 'low');
  });
});

describe('tokenize', () => {
  it('tokenise un texte simple', () => {
    assert.deepStrictEqual(tokenize('Hello World'), ['hello', 'world']);
  });

  it("ignore les mots d'un seul caractère", () => {
    assert.deepStrictEqual(tokenize('a b c hello'), ['hello']);
  });

  it('gère les caractères accentués', () => {
    const tokens = tokenize('développeur python');
    assert.ok(tokens.includes('développeur'));
    assert.ok(tokens.includes('python'));
  });

  it('supprime la ponctuation', () => {
    assert.deepStrictEqual(tokenize('hello, world!'), ['hello', 'world']);
  });
});

describe('deduplicateArray', () => {
  it('supprime les doublons', () => {
    assert.deepStrictEqual(deduplicateArray(['a', 'b', 'a']), ['a', 'b']);
  });

  it('supprime les doublons case-insensitive', () => {
    assert.deepStrictEqual(deduplicateArray(['Docker', 'docker']), ['Docker']);
  });

  it('supprime les chaînes vides', () => {
    assert.deepStrictEqual(deduplicateArray(['a', '', 'b']), ['a', 'b']);
  });

  it('gère les tableaux vides', () => {
    assert.deepStrictEqual(deduplicateArray([]), []);
  });

  it('gère les non-tableaux', () => {
    assert.deepStrictEqual(deduplicateArray(null), []);
    assert.deepStrictEqual(deduplicateArray(undefined), []);
  });
});

describe('band', () => {
  it('retourne vert pour un score >= 75', () => {
    const b = band(80);
    assert.strictEqual(b.color, '#16A34A');
  });

  it('retourne orange pour un score >= 55', () => {
    const b = band(60);
    assert.strictEqual(b.color, '#D98A00');
  });

  it('retourne rouge pour un score < 55', () => {
    const b = band(30);
    assert.strictEqual(b.color, '#E5484D');
  });

  it('retourne toujours color, bg et tint', () => {
    const b = band(50);
    assert.ok(b.color);
    assert.ok(b.bg);
    assert.ok(b.tint);
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
