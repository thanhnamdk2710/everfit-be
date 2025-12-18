import { GetChartDataUseCase } from '@application/use-cases/GetChartDataUseCase';
import { ChartDataDTO } from '@application/dto/MetricDTO';
import { Metric } from '@domain/entities/Metric';
import type { IMetricRepository } from '@domain/repositories/IMetricRepository';

describe('GetChartDataUseCase', () => {
  test('should return sorted chart data and convert to target unit', async () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const secondDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 2);

    const m1 = new Metric({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'temperature',
      value: 0,
      unit: 'celsius',
      baseValue: 273.15,
      date: firstDayOfMonth,
    });

    const m2 = new Metric({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'temperature',
      value: 10,
      unit: 'celsius',
      baseValue: 283.15,
      date: secondDayOfMonth,
    });

    const repo: IMetricRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(),
      getChartData: jest.fn(async () => [m1, m2]),
    };

    const useCase = new GetChartDataUseCase(repo);

    const dto = new ChartDataDTO({
      userId: m1.userId,
      type: 'temperature',
      period: '1month',
      unit: 'fahrenheit',
    });

    const result = await useCase.execute(dto);

    expect(repo.getChartData).toHaveBeenCalledTimes(1);
    expect(result.type).toBe('temperature');
    expect(result.unit).toBe('fahrenheit');
    expect(result.data).toHaveLength(2);

    expect(result.data[0].value).toBeCloseTo(32, 1);
    expect(result.data[1].value).toBeCloseTo(50, 1);
  });

  test('should throw for invalid type', async () => {
    const repo: IMetricRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(),
      getChartData: jest.fn(),
    };

    const useCase = new GetChartDataUseCase(repo);

    const dto = new ChartDataDTO({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      type: 'invalid',
      period: '1month',
    });

    await expect(useCase.execute(dto)).rejects.toThrow('Type is required');
  });
});
