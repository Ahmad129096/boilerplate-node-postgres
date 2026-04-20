import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Create a child logger with additional context
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

// Export convenience methods
export const logInfo = (message: string, meta?: Record<string, any>) => {
  logger.info(meta, message);
};

export const logError = (message: string, error?: Error | Record<string, any>) => {
  if (error instanceof Error) {
    logger.error({ err: error }, message);
  } else {
    logger.error(error, message);
  }
};

export const logWarn = (message: string, meta?: Record<string, any>) => {
  logger.warn(meta, message);
};

export const logDebug = (message: string, meta?: Record<string, any>) => {
  logger.debug(meta, message);
};
