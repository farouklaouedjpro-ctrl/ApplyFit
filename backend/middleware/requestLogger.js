import logger, { sanitizeObject } from '../utils/logger.js';

const requestLogger = logger.child({ context: 'http' });

/**
 * Renvoie une version allégée du body pour le logging.
 * On évite de logger les contenus bruts du CV/de l'offre (données personnelles).
 */
function summarizeBody(route, body) {
  if (!body || typeof body !== 'object') return body;

  if (route === '/api/analyze') {
    return {
      cvTextLength: typeof body.cvText === 'string' ? body.cvText.length : 0,
      offerTextLength: typeof body.offerText === 'string' ? body.offerText.length : 0,
    };
  }

  return sanitizeObject(body);
}

/**
 * Middleware Express pour logger les requêtes entrantes et leurs réponses.
 */
export default function requestLoggerMiddleware() {
  return (req, res, next) => {
    const start = Date.now();
    const route = req.originalUrl || req.url;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

      requestLogger.log(level, `${req.method} ${route} ${res.statusCode} ${duration}ms`, {
        method: req.method,
        route,
        statusCode: res.statusCode,
        durationMs: duration,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        contentLength: req.get('content-length'),
        body: summarizeBody(route, req.body),
      });
    });

    next();
  };
}
