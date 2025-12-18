import "dotenv/config";

import { database } from "./infrastructure";
import { createContainer } from "./container";

const PORT = parseInt(process.env.PORT || "8000", 10);

async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await database.connect();

    const { app } = createContainer();

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
