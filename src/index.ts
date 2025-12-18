import 'dotenv/config';

import { database, validateEnv, logger } from './infrastructure';
import { createContainer } from './container';

async function bootstrap(): Promise<void> {
  try {
    // Validate environment variables first
    const config = validateEnv();
    logger.info({ env: config.nodeEnv }, 'Configuration validated');

    // Connect to database
    await database.connect();

    const { app } = createContainer();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.nodeEnv }, 'Metrics API Server started');
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Shutting down gracefully...');

      server.close(async () => {
        logger.info('HTTP server closed');

        await database.disconnect();
        logger.info('Database connection closed');

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
