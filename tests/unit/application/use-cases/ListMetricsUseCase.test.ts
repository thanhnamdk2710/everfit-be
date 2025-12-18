import { ListMetricsUseCase } from "@application/use-cases/ListMetricsUseCase";
import { ListMetricsDTO } from "@application/dto/MetricDTO";
import { Metric } from "@domain/entities/Metric";
import { IMetricRepository } from "@domain/repositories/IMetricRepository";

describe("ListMetricsUseCase", () => {
  test("should list metrics and convert to target unit when requested", async () => {
    const metric = new Metric({
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "distance",
      value: 1,
      unit: "meter",
      baseValue: 1,
      date: "2025-12-01",
    });

    const repo: IMetricRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(async () => ({ data: [metric], total: 1 })),
      getChartData: jest.fn(),
    };

    const useCase = new ListMetricsUseCase(repo);

    const dto = new ListMetricsDTO({
      userId: metric.userId,
      type: "distance",
      unit: "feet",
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute(dto);

    expect(repo.findByUserId).toHaveBeenCalledTimes(1);
    expect(result.data).toHaveLength(1);

    expect(result.data[0].originalUnit).toBe("feet");
    expect(result.data[0].originalValue).toBeCloseTo(3.2808, 3);
    expect(result.data[0].unit).toBe("meter");
    expect(result.data[0].value).toBe(1);

    expect(result.pagination.total).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  test("should throw when target unit is invalid for given type", async () => {
    const repo: IMetricRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(async () => ({ data: [], total: 0 })),
      getChartData: jest.fn(),
    };

    const useCase = new ListMetricsUseCase(repo);

    const dto = new ListMetricsDTO({
      userId: "550e8400-e29b-41d4-a716-446655440001",
      type: "distance",
      unit: "kelvin",
      page: 1,
      limit: 20,
    });

    await expect(useCase.execute(dto)).rejects.toThrow("Invalid unit");
  });
});
