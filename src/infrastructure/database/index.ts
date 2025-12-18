import type { QueryResult, PoolConfig, QueryResultRow } from 'pg';
import { Pool } from 'pg';
import { getConfig } from '../config';
import { logger } from '../logger';

export class Database {
  private pool: Pool | null = null;

  async connect(): Promise<Pool> {
    if (this.pool) return this.pool;

    const appConfig = getConfig();

    const config: PoolConfig = {
      host: appConfig.db.host,
      port: appConfig.db.port,
      database: appConfig.db.name,
      user: appConfig.db.user,
      password: appConfig.db.password,
      min: appConfig.db.poolMin,
      max: appConfig.db.poolMax,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: true,
    };

    this.pool = new Pool(config);

    // Test connection
    try {
      const client = await this.pool.connect();
      logger.info(
        { host: config.host, database: config.database },
        'Database connected successfully'
      );
      client.release();
    } catch (error) {
      const err = error as Error;
      logger.error({ error: err.message }, 'Database connection failed');
      throw error;
    }

    // Handle pool errors
    this.pool.on('error', (err: Error) => {
      logger.error({ error: err.message }, 'Unexpected database error');
    });

    return this.pool;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('Database disconnected');
    }
  }

  async query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;

      logger.debug(
        {
          query: text.substring(0, 100),
          duration: `${duration}ms`,
          rows: result.rowCount,
        },
        'Query executed'
      );

      return result;
    } catch (error) {
      const err = error as Error;
      logger.error(
        {
          query: text.substring(0, 100),
          error: err.message,
        },
        'Query error'
      );
      throw error;
    }
  }
}

// Singleton instance
export const database = new Database();
