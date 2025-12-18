import { CreateMetricUseCase } from '@application/use-cases/CreateMetricUseCase';
import { CreateMetricDTO } from '@application/dto/MetricDTO';
import type { Metric } from '@domain/entities/Metric';
import type { IMetricRepository } from '@domain/repositories/IMetricRepository';

describe('CreateMetricUseCase', () => {
  test('should create metric, convert to base unit, and return response DTO', async () => {
    const repo: IMetricRepository = {
      save: jest.fn(async (metric: Metric) => metric),
      findByUserId: jest.fn(),
      getChartData: jest.fn(),
    };

    const useCase = new CreateMetricUseCase(repo);

    const dto = new CreateMetricDTO({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'distance',
      value: 100,
      unit: 'centimeter',
      date: '2025-12-01',
    });

    const result = await useCase.execute(dto);

    expect(repo.save).toHaveBeenCalledTimes(1);

    expect(result.userId).toBe(dto.userId);
    expect(result.type).toBe('distance');
    expect(result.value).toBe(100);
    expect(result.unit).toBe('centimeter');
    expect(result.originalUnit).toBe('meter');
    expect(result.originalValue).toBe(1);
    expect(result.date).toBe('2025-12-01');
  });

  test('should throw when unit is invalid for type', async () => {
    const repo: IMetricRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(),
      getChartData: jest.fn(),
    };

    const useCase = new CreateMetricUseCase(repo);

    const dto = new CreateMetricDTO({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'distance',
      value: 123,
      unit: 'kelvin',
      date: '2025-12-01',
    });

    await expect(useCase.execute(dto)).rejects.toThrow('Invalid unit');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
