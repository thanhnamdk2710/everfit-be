import type { MetricType, ChartPeriod } from '../../types';

// Input DTOs
export interface CreateMetricInput {
  userId: string;
  type: string;
  value: number | string;
  unit: string;
  date: string;
}

export class CreateMetricDTO {
  public readonly userId: string;
  public readonly type: MetricType;
  public readonly value: number;
  public readonly unit: string;
  public readonly date: string;

  constructor(input: CreateMetricInput) {
    this.userId = input.userId;
    this.type = input.type?.toLowerCase() as MetricType;
    this.value = parseFloat(String(input.value));
    this.unit = input.unit?.toLowerCase();
    this.date = input.date;
  }
}

export interface ListMetricsInput {
  userId: string;
  type?: string;
  unit?: string;
  startDate?: string;
  endDate?: string;
  page?: number | string;
  limit?: number | string;
}

export class ListMetricsDTO {
  public readonly userId: string;
  public readonly type?: MetricType;
  public readonly unit?: string;
  public readonly startDate: Date | null;
  public readonly endDate: Date | null;
  public readonly page: number;
  public readonly limit: number;
  public readonly offset: number;

  constructor(input: ListMetricsInput) {
    this.userId = input.userId;
    this.type = input.type?.toLowerCase() as MetricType | undefined;
    this.unit = input.unit?.toLowerCase();
    this.startDate = input.startDate ? new Date(input.startDate) : null;
    this.endDate = input.endDate ? new Date(input.endDate) : null;
    this.page = parseInt(String(input.page), 10) || 1;
    this.limit = Math.min(parseInt(String(input.limit), 10) || 20, 100);
    this.offset = (this.page - 1) * this.limit;
  }
}

export interface ChartDataInput {
  userId: string;
  type: string;
  period?: string;
  unit?: string;
}

export class ChartDataDTO {
  public readonly userId: string;
  public readonly type: MetricType;
  public readonly period: ChartPeriod;
  public readonly unit?: string;
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(input: ChartDataInput) {
    this.userId = input.userId;
    this.type = input.type?.toLowerCase() as MetricType;
    this.period = (input.period as ChartPeriod) || '1month';
    this.unit = input.unit?.toLowerCase();

    const now = new Date();
    this.endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (this.period === '2month') {
      this.startDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    } else {
      this.startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
  }
}

// Output DTOs
export interface MetricResponseDTO {
  id: string;
  userId: string;
  type: MetricType;
  originalValue: number;
  originalUnit: string;
  value: number;
  unit: string;
  date: string;
  createdAt: Date;
}

export interface ChartPointDTO {
  date: string;
  value: number;
  unit: string;
}

export interface ListMetricsResponseDTO {
  data: MetricResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChartDataResponseDTO {
  type: MetricType;
  unit: string;
  period: ChartPeriod;
  startDate: string;
  endDate: string;
  dataPoints: number;
  data: ChartPointDTO[];
}
