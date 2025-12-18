// Metric Types
export type MetricType = 'distance' | 'temperature';

// Distance Units
export type DistanceUnit = 'meter' | 'centimeter' | 'inch' | 'feet' | 'yard';

// Temperature Units
export type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin';

// Database Row Types
export interface MetricRow {
  id: string;
  user_id: string;
  type: MetricType;
  value: string | number;
  unit: string;
  base_value: string | number;
  date: Date;
  created_at: Date;
  updated_at: Date;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Filter Options
export interface MetricFilters {
  type?: MetricType;
  startDate?: Date | null;
  endDate?: Date | null;
  limit?: number;
  offset?: number;
}

// Chart Period
export type ChartPeriod = '1month' | '2month';

// Unit Conversion Config
export interface UnitConfig {
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
  symbol: string;
}

export type UnitConfigMap = Record<string, UnitConfig>;
