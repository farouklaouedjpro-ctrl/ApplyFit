import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLevel, tokenize, deduplicateArray, band } from '../utils.js';

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

  it('ignore les mots d\'un seul caractère', () => {
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
