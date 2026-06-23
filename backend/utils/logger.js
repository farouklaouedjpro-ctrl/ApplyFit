import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '..', 'logs');

const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'development' ? 'debug' : 'info');
const LOG_TO_CONSOLE = process.env.LOG_TO_CONSOLE !== 'false';
const LOG_TO_FILE = process.env.LOG_TO_FILE !== 'false';
const LOG_MAX_FILES = process.env.LOG_MAX_FILES || '14d';

// Patterns de secrets à masquer dans les logs (clés API, tokens, mots de passe...)
const SENSITIVE_PATTERN =
  /(api[_-]?key|apikey|auth[_-]?token|bearer|password|secret|private[_-]?key)(?:\s*[:=]\s*|\s+)(?:["']?)([\w\-./+=]{8,})(?:["']?)/gi;

/**
 * Masque les valeurs sensibles dans une chaîne de caractères.
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(SENSITIVE_PATTERN, '$1: [REDACTED]');
}

/**
 * Parcourt récursivement un objet pour en retirer les champs sensibles.
 * @param {*} value
 * @returns {*}
 */
export function sanitizeObject(value) {
  if (typeof value === 'string') return sanitize(value);
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      const isSensitive =
        lowerKey === 'key' ||
        lowerKey === 'apikey' ||
        lowerKey === 'api_key' ||
        lowerKey.endsWith('_key') ||
        lowerKey.endsWith('_token') ||
        lowerKey.endsWith('_secret') ||
        lowerKey.endsWith('_password') ||
        lowerKey === 'token' ||
        lowerKey === 'secret' ||
        lowerKey === 'password' ||
        lowerKey === 'authorization' ||
        lowerKey === 'cookie';

      if (isSensitive) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = sanitizeObject(val);
      }
    }
    return result;
  }
  return value;
}

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    const msg = typeof message === 'string' ? sanitize(message) : message;
    const meta = Object.keys(metadata).length ? sanitizeObject(metadata) : undefined;
    return JSON.stringify({ timestamp, level, message: msg, ...meta });
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ level: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    const msg = typeof message === 'string' ? sanitize(message) : JSON.stringify(sanitizeObject(message));
    const meta = Object.keys(metadata).length
      ? ` ${JSON.stringify(sanitizeObject(metadata), null, NODE_ENV === 'development' ? 2 : 0)}`
      : '';
    return `${timestamp} [${level}]: ${msg}${meta}`;
  })
);

const transports = [];

if (LOG_TO_CONSOLE) {
  transports.push(
    new winston.transports.Console({
      level: LOG_LEVEL,
      format: NODE_ENV === 'production' ? jsonFormat : consoleFormat,
    })
  );
}

if (LOG_TO_FILE) {
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOGS_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: LOG_MAX_FILES,
      maxSize: '20m',
      format: jsonFormat,
    }),
    new DailyRotateFile({
      filename: path.join(LOGS_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: LOG_MAX_FILES,
      maxSize: '20m',
      format: jsonFormat,
    })
  );
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: 'applyfit-backend', env: NODE_ENV },
  transports,
  exitOnError: false,
});

// Capture des exceptions et rejections non gérées
logger.exceptions.handle(
  new winston.transports.Console({ format: consoleFormat }),
  new DailyRotateFile({
    filename: path.join(LOGS_DIR, 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: LOG_MAX_FILES,
    maxSize: '20m',
    format: jsonFormat,
  })
);

logger.rejections.handle(
  new winston.transports.Console({ format: consoleFormat }),
  new DailyRotateFile({
    filename: path.join(LOGS_DIR, 'rejections-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: LOG_MAX_FILES,
    maxSize: '20m',
    format: jsonFormat,
  })
);

/**
 * Crée un logger enfant avec un contexte métier (ex: service name).
 * @param {string} context
 * @param {object} defaultMeta
 * @returns {winston.Logger}
 */
export function createChildLogger(context, defaultMeta = {}) {
  return logger.child({ context, ...defaultMeta });
}

export default logger;
