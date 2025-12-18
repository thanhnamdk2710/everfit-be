import type { Metric, IMetricRepository } from '../../domain';
import { Unit } from '../../domain';
import type { ListMetricsDTO, MetricResponseDTO, ListMetricsResponseDTO } from '../dto/MetricDTO';

export class ListMetricsUseCase {
  constructor(private readonly metricRepository: IMetricRepository) {}

  async execute(dto: ListMetricsDTO): Promise<ListMetricsResponseDTO> {
    // Validate target unit if provided
    if (dto.unit && dto.type && !Unit.isValidUnit(dto.type, dto.unit)) {
      const validUnits = Unit.getValidUnits(dto.type);
      throw new Error(
        `Invalid unit "${dto.unit}" for type "${dto.type}". Valid units: ${validUnits.join(', ')}`
      );
    }

    // Build filters
    const filters = {
      type: dto.type,
      startDate: dto.startDate,
      endDate: dto.endDate,
      limit: dto.limit,
      offset: dto.offset,
    };

    // Fetch from repository
    const { data: metrics, total } = await this.metricRepository.findByUserId(dto.userId, filters);

    // Convert units if requested
    const responseData = metrics.map((metric) => this.toResponseDTO(metric, dto.unit));

    return {
      data: responseData,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total: total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  private toResponseDTO(metric: Metric, targetUnit?: string): MetricResponseDTO {
    let convertedValue = metric.value;
    let unit = metric.unit;

    if (targetUnit && targetUnit !== metric.unit) {
      const targetUnitConverter = new Unit(metric.type, targetUnit);
      convertedValue = parseFloat(targetUnitConverter.fromBase(metric.baseValue).toFixed(4));
      unit = targetUnit;
    }

    return {
      id: metric.id,
      userId: metric.userId,
      type: metric.type,
      originalValue: convertedValue,
      originalUnit: unit,
      value: metric.value,
      unit: metric.unit,
      date: metric.date instanceof Date ? metric.date.toISOString().split('T')[0] : metric.date,
      createdAt: metric.createdAt,
    };
  }
}
