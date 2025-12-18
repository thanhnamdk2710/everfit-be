import Joi from 'joi';

const isTest = process.env.NODE_ENV === 'test';

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(8000),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('info'),

  // Database - optional in test environment
  DB_HOST: isTest ? Joi.string().default('localhost') : Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_NAME: isTest ? Joi.string().default('metrics_db') : Joi.string().required(),
  DB_USER: isTest ? Joi.string().default('postgres') : Joi.string().required(),
  DB_PASSWORD: isTest ? Joi.string().default('postgres') : Joi.string().required(),
  DB_POOL_MIN: Joi.number().integer().min(1).default(2),
  DB_POOL_MAX: Joi.number().integer().min(1).default(10),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().default(60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: Joi.number().integer().default(100),
}).unknown(true);

export interface Config {
  nodeEnv: string;
  port: number;
  logLevel: string;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    poolMin: number;
    poolMax: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

let cachedConfig: Config | null = null;

export const validateEnv = (): Config => {
  if (cachedConfig) return cachedConfig;

  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false,
  });

  if (error) {
    const missingVars = error.details.map((detail) => `  - ${detail.message}`).join('\n');

    throw new Error(
      `Environment validation failed:\n${missingVars}\n\nPlease check your .env file or environment variables.`
    );
  }

  cachedConfig = {
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
    logLevel: value.LOG_LEVEL,
    db: {
      host: value.DB_HOST,
      port: value.DB_PORT,
      name: value.DB_NAME,
      user: value.DB_USER,
      password: value.DB_PASSWORD,
      poolMin: value.DB_POOL_MIN,
      poolMax: value.DB_POOL_MAX,
    },
    rateLimit: {
      windowMs: value.RATE_LIMIT_WINDOW_MS,
      maxRequests: value.RATE_LIMIT_MAX_REQUESTS,
    },
  };

  return cachedConfig;
};

export const getConfig = (): Config => {
  if (!cachedConfig) {
    return validateEnv();
  }
  return cachedConfig;
};
