import { Pool, QueryResult, PoolConfig, QueryResultRow } from "pg";

export class Database {
  private pool: Pool | null = null;

  async connect(): Promise<Pool> {
    if (this.pool) return this.pool;

    const config: PoolConfig = {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_NAME || "metrics_db",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres123",
      min: parseInt(process.env.DB_POOL_MIN || "2", 10),
      max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    this.pool = new Pool(config);

    // Test connection
    try {
      const client = await this.pool.connect();
      console.log("Database connected successfully");
      client.release();
    } catch (error) {
      const err = error as Error;
      console.error("Database connection failed:", err.message);
      throw error;
    }

    // Handle pool errors
    this.pool.on("error", (err: Error) => {
      console.error("Unexpected database error:", err);
    });

    return this.pool;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log("Database disconnected");
    }
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error("Database not connected");
    }

    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;

      if (process.env.LOG_LEVEL === "debug") {
        console.log("Query executed:", {
          text: text.substring(0, 100),
          duration: `${duration}ms`,
          rows: result.rowCount,
        });
      }

      return result;
    } catch (error) {
      const err = error as Error;
      console.error("Query error:", {
        text: text.substring(0, 100),
        error: err.message,
      });
      throw error;
    }
  }
}

// Singleton instance
export const database = new Database();
