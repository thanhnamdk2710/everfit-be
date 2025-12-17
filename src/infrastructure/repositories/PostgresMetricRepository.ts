import { Metric, IMetricRepository, FindByUserIdResult } from "../../domain";
import { MetricType, MetricFilters, MetricRow } from "../../types";
import { database } from "../database";

export class PostgresMetricRepository implements IMetricRepository {
  async save(metric: Metric): Promise<Metric> {
    const dbData = metric.toDatabase();

    const query = `
      INSERT INTO metrics (id, user_id, type, value, unit, base_value, date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      dbData.id,
      dbData.user_id,
      dbData.type,
      dbData.value,
      dbData.unit,
      dbData.base_value,
      dbData.date,
      dbData.created_at,
      dbData.updated_at,
    ];

    const result = await database.query<MetricRow>(query, values);
    return Metric.fromDatabase(result.rows[0]);
  }

  async findById(id: string): Promise<Metric | null> {
    const query = "SELECT * FROM metrics WHERE id = $1";
    const result = await database.query<MetricRow>(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return Metric.fromDatabase(result.rows[0]);
  }

  async findByUserId(
    userId: string,
    filters: MetricFilters = {}
  ): Promise<FindByUserIdResult> {
    const conditions: string[] = ["user_id = $1"];
    const values: any[] = [userId];
    let paramIndex = 2;

    if (filters.type) {
      conditions.push(`type = $${paramIndex}`);
      values.push(filters.type);
      paramIndex++;
    }

    if (filters.startDate) {
      conditions.push(`date >= $${paramIndex}`);
      values.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      conditions.push(`date <= $${paramIndex}`);
      values.push(filters.endDate);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM metrics WHERE ${whereClause}`;
    const countResult = await database.query<{ count: string }>(
      countQuery,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated data
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const dataQuery = `
      SELECT * FROM metrics 
      WHERE ${whereClause}
      ORDER BY date DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await database.query<MetricRow>(dataQuery, [
      ...values,
      limit,
      offset,
    ]);
    const data = dataResult.rows.map((row) => Metric.fromDatabase(row));

    return { data, total };
  }

  async getChartData(
    userId: string,
    type: MetricType,
    startDate: Date,
    endDate: Date
  ): Promise<Metric[]> {
    // Get the latest metric for each day using DISTINCT ON
    const query = `
      SELECT DISTINCT ON (date) *
      FROM metrics
      WHERE user_id = $1 
        AND type = $2 
        AND date >= $3 
        AND date <= $4
      ORDER BY date, created_at DESC
    `;

    const result = await database.query<MetricRow>(query, [
      userId,
      type,
      startDate,
      endDate,
    ]);
    return result.rows.map((row) => Metric.fromDatabase(row));
  }

  async update(id: string, data: Partial<Metric>): Promise<Metric | null> {
    const existingMetric = await this.findById(id);
    if (!existingMetric) {
      return null;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMapping: Record<string, string> = {
      value: "value",
      unit: "unit",
      baseValue: "base_value",
      date: "date",
    };

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      const value = (data as any)[key];
      if (value !== undefined) {
        updates.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return existingMetric;
    }

    updates.push("updated_at = NOW()");

    const query = `
      UPDATE metrics 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    const result = await database.query<MetricRow>(query, values);
    return Metric.fromDatabase(result.rows[0]);
  }
}
