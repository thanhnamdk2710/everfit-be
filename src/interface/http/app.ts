import type { Application, Request, Response } from 'express';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { requestIdMiddleware } from './middlewares/requestId';
import { createRateLimiter } from './middlewares/rateLimiter';
import { createMetricRoutes } from './routes/metricRoutes';
import type { MetricController } from './controllers/MetricController';
import { swaggerSpec } from './swagger';
import { logger } from '../../infrastructure/logger';

export interface AppDependencies {
  metricController: MetricController;
}

export const createApp = (dependencies: AppDependencies): Application => {
  const app = express();

  // CORS
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // Security middleware
  app.use(helmet());

  // Compression
  app.use(compression());

  // Request ID middleware
  app.use(requestIdMiddleware);

  // Request logging with pino
  if (process.env.NODE_ENV !== 'test') {
    app.use(pinoHttp({ logger }));
  }

  // Rate limiting
  app.use(createRateLimiter());

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API info endpoint
  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'Metrics API',
      version: '1.0.0',
      description: 'Metrics tracking with unit conversion',
      endpoints: {
        metrics: '/v1/api/metrics',
        chart: '/v1/api/metrics/chart',
        health: '/health',
      },
      supportedUnits: {
        distance: ['meter', 'centimeter', 'inch', 'feet', 'yard'],
        temperature: ['kelvin', 'celsius', 'fahrenheit'],
      },
    });
  });

  // API routes
  app.use('/v1/api/metrics', createMetricRoutes(dependencies.metricController));

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};
