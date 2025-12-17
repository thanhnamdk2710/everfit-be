import { Unit, IMetricRepository } from '../../domain';
import { ChartDataDTO, ChartPointDTO, ChartDataResponseDTO } from '../dto/MetricDTO';

export class GetChartDataUseCase {
  constructor(private readonly metricRepository: IMetricRepository) {}

  async execute(dto: ChartDataDTO): Promise<ChartDataResponseDTO> {
    // Validate type
    if (!dto.type || !['distance', 'temperature'].includes(dto.type)) {
      throw new Error('Type is required and must be "distance" or "temperature"');
    }

    // Validate and set default unit
    const defaultUnit = dto.type === 'distance' ? 'meter' : 'celsius';
    const targetUnit = dto.unit || defaultUnit;

    if (!Unit.isValidUnit(dto.type, targetUnit)) {
      const validUnits = Unit.getValidUnits(dto.type);
      throw new Error(
        `Invalid unit "${targetUnit}" for type "${dto.type}". Valid units: ${validUnits.join(', ')}`
      );
    }

    // Fetch chart data (latest metric per day)
    const metrics = await this.metricRepository.getChartData(
      dto.userId,
      dto.type,
      dto.startDate,
      dto.endDate
    );

    // Convert to target unit and format response
    const unitConverter = new Unit(dto.type, targetUnit);

    const chartData: ChartPointDTO[] = metrics.map((metric) => {
      const convertedValue = unitConverter.fromBase(metric.baseValue);
      const dateStr =
        metric.date instanceof Date
          ? metric.date.toISOString().split('T')[0]
          : metric.date;

      return {
        date: dateStr as string,
        value: parseFloat(convertedValue.toFixed(4)),
        unit: targetUnit,
      };
    });

    // Sort by date ascending
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      type: dto.type,
      unit: targetUnit,
      period: dto.period,
      startDate: dto.startDate.toISOString().split('T')[0],
      endDate: dto.endDate.toISOString().split('T')[0],
      dataPoints: chartData.length,
      data: chartData,
    };
  }
}
