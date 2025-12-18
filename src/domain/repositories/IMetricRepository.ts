import { Metric } from "../entities/Metric";
import { MetricType, MetricFilters } from "../../types";

export interface FindByUserIdResult {
  data: Metric[];
  total: number;
}

export interface IMetricRepository {
  save(metric: Metric): Promise<Metric>;
  findByUserId(
    userId: string,
    filters?: MetricFilters
  ): Promise<FindByUserIdResult>;
  getChartData(
    userId: string,
    type: MetricType,
    startDate: Date,
    endDate: Date
  ): Promise<Metric[]>;
}
