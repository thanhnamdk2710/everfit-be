import { Metric, Unit, IMetricRepository } from "../../domain";
import { CreateMetricDTO, MetricResponseDTO } from "../dto/MetricDTO";

export class CreateMetricUseCase {
  constructor(private readonly _metricRepo: IMetricRepository) {}

  async execute(dto: CreateMetricDTO): Promise<MetricResponseDTO> {
    // Validate unit for the given type
    if (!Unit.isValidUnit(dto.type, dto.unit)) {
      const validUnits = Unit.getValidUnits(dto.type);
      throw new Error(
        `Invalid unit "${dto.unit}" for type "${
          dto.type
        }". Valid units: ${validUnits.join(", ")}`
      );
    }

    // Convert to base unit
    const unitConverter = new Unit(dto.type, dto.unit);
    const baseValue = unitConverter.toBase(dto.value);
    const baseUnit = unitConverter.getBaseUnit(dto.type);

    const metric = new Metric({
      userId: dto.userId,
      type: dto.type,
      value: dto.value,
      unit: dto.unit,
      baseValue: baseValue,
      date: new Date(dto.date),
    });

    const savedMetric = await this._metricRepo.save(metric);

    return this.toResponseDTO(savedMetric, baseUnit);
  }

  private toResponseDTO(metric: Metric, baseUnit: string): MetricResponseDTO {
    return {
      id: metric.id,
      userId: metric.userId,
      type: metric.type,
      originalValue: metric.baseValue,
      originalUnit: baseUnit,
      value: metric.value,
      unit: metric.unit,
      date: metric.date.toISOString().split("T")[0],
      createdAt: metric.createdAt,
    };
  }
}
