import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import logger, { sanitize, sanitizeObject, createChildLogger } from '../utils/logger.js';

describe('sanitize', () => {
  it('masque une clé API présente dans une chaîne', () => {
    const input = 'Authorization: Bearer sk-1234567890abcdef';
    const result = sanitize(input);
    assert.ok(!result.includes('sk-1234567890abcdef'));
    assert.ok(result.includes('[REDACTED]'));
  });

  it('ne modifie pas une chaîne sans secret', () => {
    const input = 'Hello world';
    assert.strictEqual(sanitize(input), input);
  });

  it('retourne la valeur inchangée si ce n\'est pas une chaîne', () => {
    assert.strictEqual(sanitize(42), 42);
    assert.strictEqual(sanitize(null), null);
  });
});

describe('sanitizeObject', () => {
  it('masque les champs sensibles', () => {
    const input = {
      username: 'alice',
      apiKey: 'super-secret',
      token: 'jwt-token',
      password: 'hunter2',
      nested: { authorization: 'Bearer xyz' },
      data: { publicField: 'visible' },
    };
    const result = sanitizeObject(input);
    assert.strictEqual(result.apiKey, '[REDACTED]');
    assert.strictEqual(result.token, '[REDACTED]');
    assert.strictEqual(result.password, '[REDACTED]');
    assert.strictEqual(result.nested.authorization, '[REDACTED]');
    assert.strictEqual(result.username, 'alice');
    assert.strictEqual(result.data.publicField, 'visible');
  });

  it('gère les tableaux', () => {
    const input = [
      { apiKey: 'secret1' },
      { apiKey: 'secret2' },
    ];
    const result = sanitizeObject(input);
    assert.deepStrictEqual(result, [{ apiKey: '[REDACTED]' }, { apiKey: '[REDACTED]' }]);
  });
});

describe('createChildLogger', () => {
  it('crée un logger enfant avec le contexte fourni', () => {
    const child = createChildLogger('test-context', { requestId: 'abc' });
    assert.ok(child);
    assert.strictEqual(typeof child.info, 'function');
    assert.strictEqual(typeof child.error, 'function');
  });
});

describe('logger', () => {
  it('existe et possède les méthodes attendues', () => {
    assert.ok(logger);
    assert.strictEqual(typeof logger.info, 'function');
    assert.strictEqual(typeof logger.error, 'function');
    assert.strictEqual(typeof logger.debug, 'function');
    assert.strictEqual(typeof logger.warn, 'function');
  });
});
