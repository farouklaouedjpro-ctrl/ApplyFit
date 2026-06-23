import logger from '../utils/logger.js';

const errorLogger = logger.child({ context: 'error-handler' });

/**
 * Middleware Express de gestion des erreurs.
 * Doit être enregistré APRÈS toutes les routes et middlewares.
 */
export default function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;
  const level = isClientError ? 'warn' : 'error';

  errorLogger.log(level, err.message, {
    statusCode,
    method: req.method,
    route: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    stack: err.stack,
    requestId: req.id,
  });

  const response = {
    error: statusCode === 500 ? 'Erreur interne du serveur.' : err.message || 'Une erreur est survenue.',
  };

  // En développement, on expose plus de détails pour faciliter le debug
  if (process.env.NODE_ENV !== 'production') {
    response.details = err.message;
    response.stack = err.stack?.split('\n');
  }

  res.status(statusCode).json(response);
}

/**
 * Middleware Express pour capturer les routes non trouvées (404).
 */
export function notFoundHandler(req, res) {
  logger.warn('Route non trouvée', {
    context: 'error-handler',
    method: req.method,
    route: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
  });

  res.status(404).json({ error: 'Route non trouvée.' });
}
