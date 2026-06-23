import { createChildLogger } from '../utils/logger.js';

const logger = createChildLogger('aiClient');

export const OPENCODE_GO_API_URL =
  process.env.OPENCODE_GO_API_URL || 'https://opencode.ai/zen/go/v1/chat/completions';
export const OPENCODE_GO_API_KEY = process.env.OPENCODE_GO_API_KEY || '';
export const OPENCODE_GO_MODEL = process.env.OPENCODE_GO_MODEL || 'kimi-k2.7-code';
export const OPENCODE_GO_TEMPERATURE = process.env.OPENCODE_GO_TEMPERATURE;
export const OPENCODE_GO_TIMEOUT_MS = Number(process.env.OPENCODE_GO_TIMEOUT_MS) || 120000;
export const OPENCODE_GO_MAX_RETRIES = Number(process.env.OPENCODE_GO_MAX_RETRIES) || 2;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function queryOpenCodeGo(prompt, options = {}) {
  if (!OPENCODE_GO_API_KEY) {
    throw new Error('Clé API OpenCode Go manquante (OPENCODE_GO_API_KEY)');
  }

  const model = options.model || OPENCODE_GO_MODEL;
  const maxTokens = options.maxTokens || 8192;
  const timeoutMs = options.timeoutMs || OPENCODE_GO_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? OPENCODE_GO_MAX_RETRIES;

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
  };

  if (OPENCODE_GO_TEMPERATURE !== undefined && OPENCODE_GO_TEMPERATURE !== '') {
    body.temperature = Number(OPENCODE_GO_TEMPERATURE);
  }

  logger.debug('Appel API OpenCode Go', { model, promptLength: prompt.length });
  const start = Date.now();
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
      logger.warn(`Tentative OpenCode Go ${attempt + 1}/${maxRetries + 1} après erreur`, {
        delayMs: delay,
        lastError: lastError?.message,
      });
      await sleep(delay);
    }

    try {
      const response = await fetchWithTimeout(
        OPENCODE_GO_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENCODE_GO_API_KEY}`,
          },
          body: JSON.stringify(body),
        },
        timeoutMs,
      );

      const duration = Date.now() - start;

      if (!response.ok) {
        const errBody = await response.text();
        logger.error('OpenCode Go API a retourné une erreur', {
          status: response.status,
          durationMs: duration,
          responsePreview: errBody.slice(0, 500),
        });
        throw new Error(`OpenCode Go API error ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      logger.info('Réponse OpenCode Go reçue', {
        durationMs: duration,
        model,
        responseLength: text.length,
      });

      if (!text) throw new Error('OpenCode Go: réponse vide');
      return text;
    } catch (err) {
      lastError = err;
      const isRetryable =
        err.name === 'AbortError' ||
        (err.message && /fetch|network|timeout|econnrefused/i.test(err.message)) ||
        (err.message && /5\d{2}/.test(err.message));

      if (!isRetryable || attempt === maxRetries) {
        logger.error('Erreur réseau/API OpenCode Go', {
          error: err.message,
          durationMs: Date.now() - start,
          attempts: attempt + 1,
        });
        throw err;
      }
    }
  }

  throw lastError;
}
