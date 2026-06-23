import { describe, it, expect } from 'vitest';
import { getLevel, tokenize, deduplicateArray, band, calculateGlobalScore, getAtsVerdict } from '../utils.js';

describe('getLevel', () => {
  it('retourne "excellent" pour un score >= 80', () => {
    expect(getLevel(80)).toBe('excellent');
    expect(getLevel(100)).toBe('excellent');
  });

  it('retourne "good" pour un score >= 60', () => {
    expect(getLevel(60)).toBe('good');
    expect(getLevel(79)).toBe('good');
  });

  it('retourne "average" pour un score >= 40', () => {
    expect(getLevel(40)).toBe('average');
    expect(getLevel(59)).toBe('average');
  });

  it('retourne "low" pour un score < 40', () => {
    expect(getLevel(0)).toBe('low');
    expect(getLevel(39)).toBe('low');
  });
});

describe('tokenize', () => {
  it('tokenise un texte simple', () => {
    expect(tokenize('Hello World')).toEqual(['hello', 'world']);
  });

  it("ignore les mots d'un seul caractère", () => {
    expect(tokenize('a b c hello')).toEqual(['hello']);
  });

  it('gère les caractères accentués', () => {
    const tokens = tokenize('développeur python');
    expect(tokens).toContain('développeur');
    expect(tokens).toContain('python');
  });

  it('supprime la ponctuation', () => {
    expect(tokenize('hello, world!')).toEqual(['hello', 'world']);
  });
});

describe('deduplicateArray', () => {
  it('supprime les doublons', () => {
    expect(deduplicateArray(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });

  it('supprime les doublons case-insensitive', () => {
    expect(deduplicateArray(['Docker', 'docker'])).toEqual(['Docker']);
  });

  it('supprime les chaînes vides', () => {
    expect(deduplicateArray(['a', '', 'b'])).toEqual(['a', 'b']);
  });

  it('gère les tableaux vides', () => {
    expect(deduplicateArray([])).toEqual([]);
  });

  it('gère les non-tableaux', () => {
    expect(deduplicateArray(null)).toEqual([]);
    expect(deduplicateArray(undefined)).toEqual([]);
  });
});

describe('band', () => {
  it('retourne vert pour un score >= 75', () => {
    const b = band(80);
    expect(b.color).toBe('#16A34A');
  });

  it('retourne orange pour un score >= 55', () => {
    const b = band(60);
    expect(b.color).toBe('#D98A00');
  });

  it('retourne rouge pour un score < 55', () => {
    const b = band(30);
    expect(b.color).toBe('#E5484D');
  });

  it('retourne toujours color, bg et tint', () => {
    const b = band(50);
    expect(b.color).toBeTruthy();
    expect(b.bg).toBeTruthy();
    expect(b.tint).toBeTruthy();
  });
});

describe('getAtsVerdict', () => {
  it('retourne "Passe" pour un score >= 75', () => {
    expect(getAtsVerdict(75)).toBe('Passe');
    expect(getAtsVerdict(100)).toBe('Passe');
  });

  it('retourne "À améliorer" pour un score >= 55 et < 75', () => {
    expect(getAtsVerdict(55)).toBe('À améliorer');
    expect(getAtsVerdict(74)).toBe('À améliorer');
  });

  it('retourne "Refusé" pour un score < 55', () => {
    expect(getAtsVerdict(0)).toBe('Refusé');
    expect(getAtsVerdict(54)).toBe('Refusé');
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
    expect(calculateGlobalScore(categories)).toBe(100);
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
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it('retourne 0 pour des catégories vides', () => {
    expect(calculateGlobalScore({})).toBe(0);
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
    expect(calculateGlobalScore(categories)).toBe(0);
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
    expect(calculateGlobalScore(categories)).toBe(35);
  });
});
