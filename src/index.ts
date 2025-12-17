import "dotenv/config";

import { createApp } from "./interface/http/app";
import { database, PostgresMetricRepository } from "./infrastructure";
import {
  CreateMetricUseCase,
  ListMetricsUseCase,
  GetChartDataUseCase,
} from "./application";
import { MetricController } from "./interface/http/controllers/MetricController";

const PORT = parseInt(process.env.PORT || "8000", 10);

async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await database.connect();

    // Initialize repositories
    const metricRepository = new PostgresMetricRepository();

    // Initialize use cases
    const createMetricUseCase = new CreateMetricUseCase(metricRepository);
    const listMetricsUseCase = new ListMetricsUseCase(metricRepository);
    const getChartDataUseCase = new GetChartDataUseCase(metricRepository);

    // Initialize controllers
    const metricController = new MetricController({
      createMetricUseCase,
      listMetricsUseCase,
      getChartDataUseCase,
      metricRepository,
    });

    // Create Express app with dependencies
    const app = createApp({
      metricController,
    });

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Metrics API Server is running on: http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("HTTP server closed");

        await database.disconnect();
        console.log("Database connection closed");

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("Forcing shutdown...");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
