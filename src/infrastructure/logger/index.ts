import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

function getTransport(): pino.TransportSingleOptions | undefined {
  if (!isDevelopment) {
    return undefined;
  }

  try {
    require.resolve('pino-pretty');
    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };
  } catch {
    return undefined;
  }
}

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  enabled: !isTest,
  transport: getTransport(),
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'metrics-api',
    version: process.env.npm_package_version || '1.0.0',
  },
});

export const createChildLogger = (context: Record<string, unknown>): Logger => {
  return logger.child(context);
};

export type Logger = typeof logger;
