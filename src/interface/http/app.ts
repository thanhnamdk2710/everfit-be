import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";

import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { createMetricRoutes } from "./routes/metricRoutes";
import { MetricController } from "./controllers/MetricController";

export interface AppDependencies {
  metricController: MetricController;
}

export const createApp = (dependencies: AppDependencies): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Compression
  app.use(compression());

  // Request logging
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
  }

  // Body parsing
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API info endpoint
  app.get("/api", (_req: Request, res: Response) => {
    res.status(200).json({
      name: "Metrics API",
      version: "1.0.0",
      description: "Metrics tracking with unit conversion",
      endpoints: {
        metrics: "/api/metrics",
        chart: "/api/metrics/chart",
        health: "/health",
      },
      supportedUnits: {
        distance: ["meter", "centimeter", "inch", "feet", "yard"],
        temperature: ["kelvin", "celsius", "fahrenheit"],
      },
    });
  });

  // API routes
  app.use("/api/metrics", createMetricRoutes(dependencies.metricController));

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};
