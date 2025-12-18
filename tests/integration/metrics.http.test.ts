import request from "supertest";

import { createApp } from "../../src/interface/http/app";
import { MetricController } from "../../src/interface/http/controllers/MetricController";
import {
  CreateMetricUseCase,
  GetChartDataUseCase,
  ListMetricsUseCase,
} from "../../src/application";
import { IMetricRepository, Metric } from "../../src/domain";
import { MetricFilters, MetricType } from "../../src/types";

class InMemoryMetricRepository implements IMetricRepository {
  private metrics: Metric[] = [];

  async save(metric: Metric): Promise<Metric> {
    this.metrics.push(metric);
    return metric;
  }

  async findByUserId(
    userId: string,
    filters: MetricFilters = {}
  ): Promise<{ data: Metric[]; total: number }> {
    let data = this.metrics.filter((m) => m.userId === userId);

    if (filters.type) {
      data = data.filter((m) => m.type === filters.type);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      data = data.filter((m) => m.date.getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      data = data.filter((m) => m.date.getTime() <= end);
    }

    const total = data.length;

    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    data = data.slice(offset, offset + limit);

    return { data, total };
  }

  async getChartData(
    userId: string,
    type: MetricType,
    startDate: Date,
    endDate: Date
  ): Promise<Metric[]> {
    const start = startDate.getTime();
    const end = endDate.getTime();

    const filtered = this.metrics
      .filter((m) => m.userId === userId)
      .filter((m) => m.type === type)
      .filter((m) => {
        const t = m.date.getTime();
        return t >= start && t <= end;
      });

    const map = new Map<string, Metric>();
    for (const metric of filtered) {
      const key = metric.date.toISOString().split("T")[0];
      const existing = map.get(key);
      if (!existing) {
        map.set(key, metric);
        continue;
      }
      if (metric.createdAt.getTime() > existing.createdAt.getTime()) {
        map.set(key, metric);
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }
}

describe("HTTP integration: metrics routes", () => {
  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  test("GET /health", async () => {
    const repo = new InMemoryMetricRepository();
    const metricController = new MetricController({
      createMetricUseCase: new CreateMetricUseCase(repo),
      listMetricsUseCase: new ListMetricsUseCase(repo),
      getChartDataUseCase: new GetChartDataUseCase(repo),
      metricRepository: repo,
    });

    const app = createApp({ metricController });

    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  test("GET /api", async () => {
    const repo = new InMemoryMetricRepository();
    const metricController = new MetricController({
      createMetricUseCase: new CreateMetricUseCase(repo),
      listMetricsUseCase: new ListMetricsUseCase(repo),
      getChartDataUseCase: new GetChartDataUseCase(repo),
      metricRepository: repo,
    });

    const app = createApp({ metricController });

    const res = await request(app).get("/api");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Metrics API");
    expect(res.body.supportedUnits.distance).toContain("meter");
    expect(res.body.supportedUnits.temperature).toContain("celsius");
  });

  test("POST /api/metrics - validation error", async () => {
    const repo = new InMemoryMetricRepository();
    const metricController = new MetricController({
      createMetricUseCase: new CreateMetricUseCase(repo),
      listMetricsUseCase: new ListMetricsUseCase(repo),
      getChartDataUseCase: new GetChartDataUseCase(repo),
      metricRepository: repo,
    });

    const app = createApp({ metricController });

    const res = await request(app).post("/api/metrics").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  test("POST /api/metrics", async () => {
    const repo = new InMemoryMetricRepository();
    const metricController = new MetricController({
      createMetricUseCase: new CreateMetricUseCase(repo),
      listMetricsUseCase: new ListMetricsUseCase(repo),
      getChartDataUseCase: new GetChartDataUseCase(repo),
      metricRepository: repo,
    });

    const app = createApp({ metricController });

    const createRes = await request(app).post("/api/metrics").send({
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "distance",
      value: 100,
      unit: "centimeter",
      date: "2025-12-01",
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.unit).toBe("centimeter");
    expect(createRes.body.data.originalUnit).toBe("meter");
  });

  test("GET /api/metrics (list) converts unit", async () => {
    const repo = new InMemoryMetricRepository();
    const metricController = new MetricController({
      createMetricUseCase: new CreateMetricUseCase(repo),
      listMetricsUseCase: new ListMetricsUseCase(repo),
      getChartDataUseCase: new GetChartDataUseCase(repo),
      metricRepository: repo,
    });

    const app = createApp({ metricController });

    await request(app).post("/api/metrics").send({
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "distance",
      value: 1,
      unit: "meter",
      date: "2025-12-01",
    });

    const res = await request(app).get("/api/metrics").query({
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "distance",
      unit: "feet",
      page: 1,
      limit: 20,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].originalUnit).toBe("feet");
    expect(res.body.data[0].originalValue).toBeCloseTo(3.2808, 3);
    expect(res.body.data[0].unit).toBe("meter");
    expect(res.body.data[0].value).toBe(1);
  });

  test("GET /api/metrics/chart", async () => {
    const repo = new InMemoryMetricRepository();
    const metricController = new MetricController({
      createMetricUseCase: new CreateMetricUseCase(repo),
      listMetricsUseCase: new ListMetricsUseCase(repo),
      getChartDataUseCase: new GetChartDataUseCase(repo),
      metricRepository: repo,
    });

    const app = createApp({ metricController });

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    await request(app).post("/api/metrics").send({
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "temperature",
      value: 0,
      unit: "celsius",
      date: firstDayOfMonth,
    });

    const res = await request(app).get("/api/metrics/chart").query({
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "temperature",
      period: "1month",
      unit: "fahrenheit",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.type).toBe("temperature");
    expect(res.body.unit).toBe("fahrenheit");
  });
});
