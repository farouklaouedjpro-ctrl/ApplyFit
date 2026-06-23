import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';

process.env.OPENCODE_GO_API_KEY = 'test-api-key';
process.env.OPENCODE_GO_MAX_RETRIES = '0';

const { default: app } = await import('../server.js');

const PORT = 0;

function createAnalyzeResponse() {
  return {
    globalScore: 75,
    confidence: 80,
    categories: {
      technical: { score: 80, found: ['python'], missing: ['docker'] },
      soft: { score: 60, found: [], missing: [] },
      tools: { score: 0, found: [], missing: [] },
      education: { score: 100, found: ['master'], missing: [] },
      languages: { score: 100, found: [], missing: [] },
      experience: { score: 50, found: ['stage'], missing: ['cdi'] },
    },
    missingKeywords: [
      { keyword: 'docker', concreteSkill: 'Conteneurisation Docker', category: 'technical' },
    ],
    reformulationAdvice: [
      { cvSays: 'Suivi client', offerRequires: 'Gestion de portefeuille', suggestion: 'Gestion proactive' },
    ],
    alerts: [],
  };
}

function createATSResponse() {
  return {
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
}

function mockFetch(responseContent) {
  return async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ choices: [{ message: { content: responseContent } }] }),
    json: async () => ({ choices: [{ message: { content: responseContent } }] }),
  });
}

function post(baseUrl, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const data = JSON.stringify(body);
    const req = http.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (chunk) => {
          chunks += chunk;
        });
        res.on('end', () => {
          resolve({ status: res.statusCode, text: chunks });
        });
      },
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

describe('Integration - /api/analyze', () => {
  let server;
  let baseUrl;
  let originalFetch;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        const address = server.address();
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('retourne 200 avec une analyse structurée pour une entrée valide', async () => {
    const responseContent = JSON.stringify(createAnalyzeResponse());
    global.fetch = mockFetch(responseContent);

    const res = await post(baseUrl, '/api/analyze', {
      cvText: 'Développeur Python avec 5 ans d expérience.',
      offerText: 'Recherche développeur Python maîtrisant Docker.',
    });

    assert.strictEqual(res.status, 200);
    const body = JSON.parse(res.text);
    assert.strictEqual(body.globalScore, 75);
    assert.ok(body.categories);
    assert.ok(Array.isArray(body.missingKeywords));
    assert.strictEqual(body.missingKeywords.length, 1);
  });

  it('retourne 400 quand le CV est vide', async () => {
    global.fetch = mockFetch('{}');

    const res = await post(baseUrl, '/api/analyze', { cvText: '', offerText: 'Offre intéressante.' });

    assert.strictEqual(res.status, 400);
    const body = JSON.parse(res.text);
    assert.ok(body.error);
  });

  it('retourne 500 quand l\'API IA retourne une erreur', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    const res = await post(baseUrl, '/api/analyze', { cvText: 'CV', offerText: 'Offre' });

    assert.strictEqual(res.status, 500);
    const body = JSON.parse(res.text);
    assert.ok(body.error);
  });
});

describe('Integration - /api/ats-score', () => {
  let server;
  let baseUrl;
  let originalFetch;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        const address = server.address();
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('retourne 200 avec un score ATS structuré pour une entrée valide', async () => {
    const responseContent = JSON.stringify(createATSResponse());
    global.fetch = mockFetch(responseContent);

    const res = await post(baseUrl, '/api/ats-score', {
      cvText: 'Développeur Python.',
      offerText: 'Recherche développeur Python.',
    });

    assert.strictEqual(res.status, 200);
    const body = JSON.parse(res.text);
    assert.strictEqual(body.score, 72);
    assert.strictEqual(body.verdict, 'À améliorer');
    assert.ok(Array.isArray(body.criteria));
    assert.ok(Array.isArray(body.recommendations));
  });
});
