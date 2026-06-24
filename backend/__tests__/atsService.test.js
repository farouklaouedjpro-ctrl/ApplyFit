import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateATSResponse } from '../services/atsService.js';

describe('validateATSResponse', () => {
  const validResponse = {
    score: 72,
    verdict: 'À améliorer',
    summary: 'Le CV est bien structuré mais manque de mots-clés.',
    criteria: [
      { name: 'Sections clés', passed: true, score: 90, comment: 'Toutes les sections sont présentes.' },
      { name: 'Informations de contact', passed: true, score: 85, comment: 'Contact complet.' },
      { name: 'Format et lisibilité', passed: false, score: 50, comment: 'Blocs de texte denses.' },
      { name: 'Longueur du CV', passed: true, score: 95, comment: '2 pages.' },
      { name: 'Mots-clés de l\'offre', passed: false, score: 45, comment: 'Mots-clés manquants.' },
      { name: 'Dates et chronologie', passed: true, score: 80, comment: 'Ordre antichronologique.' },
    ],
    recommendations: [
      'Ajouter plus de puces dans le profil.',
      'Inclure les mots-clés de l\'offre dans les compétences.',
    ],
  };

  it('valide une réponse ATS correcte', () => {
    const result = validateATSResponse(validResponse);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });

  it('détecte un score manquant', () => {
    const resp = { ...validResponse, score: undefined };
    const result = validateATSResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('score')));
  });

  it('détecte un score hors limites', () => {
    const resp = { ...validResponse, score: 150 };
    const result = validateATSResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('score')));
  });

  it('détecte un verdict invalide', () => {
    const resp = { ...validResponse, verdict: 'Moyen' };
    const result = validateATSResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('verdict')));
  });

  it('détecte un summary manquant', () => {
    const resp = { ...validResponse, summary: '' };
    const result = validateATSResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('summary')));
  });

  it('détecte des criteria invalides', () => {
    const resp = {
      ...validResponse,
      criteria: [{ name: '', passed: 'oui', score: -5, comment: 123 }],
    };
    const result = validateATSResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length >= 3);
  });

  it('détecte des recommendations invalides', () => {
    const resp = { ...validResponse, recommendations: ['', 123] };
    const result = validateATSResponse(resp);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('recommendations')));
  });

  it('accepte le verdict Passe', () => {
    const resp = { ...validResponse, score: 80, verdict: 'Passe' };
    const result = validateATSResponse(resp);
    assert.strictEqual(result.valid, true);
  });

  it('accepte le verdict Refusé', () => {
    const resp = { ...validResponse, score: 40, verdict: 'Refusé' };
    const result = validateATSResponse(resp);
    assert.strictEqual(result.valid, true);
  });
});
