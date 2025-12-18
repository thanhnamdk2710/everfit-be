import { v4 as uuidv4 } from 'uuid';
import type { MetricType, MetricRow } from '../../types';

export interface MetricProps {
  id?: string;
  userId: string;
  type: MetricType;
  value: number;
  unit: string;
  baseValue: number;
  date: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MetricJSON {
  id: string;
  userId: string;
  type: MetricType;
  value: number;
  unit: string;
  baseValue: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricDatabase {
  id: string;
  user_id: string;
  type: MetricType;
  value: number;
  unit: string;
  base_value: number;
  date: Date;
  created_at: Date;
  updated_at: Date;
}

export class Metric {
  public readonly id: string;
  public readonly userId: string;
  public readonly type: MetricType;
  public readonly value: number;
  public readonly unit: string;
  public readonly baseValue: number;
  public readonly date: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: MetricProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.type = props.type;
    this.value = props.value;
    this.unit = props.unit;
    this.baseValue = props.baseValue;
    this.date = props.date instanceof Date ? props.date : new Date(props.date);
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this.userId) {
      throw new Error('UserId is required');
    }
    if (!['distance', 'temperature'].includes(this.type)) {
      throw new Error('Type must be either "distance" or "temperature"');
    }
    if (typeof this.value !== 'number' || isNaN(this.value)) {
      throw new Error('Value must be a valid number');
    }
    if (!this.unit) {
      throw new Error('Unit is required');
    }
    if (!(this.date instanceof Date) || isNaN(this.date.getTime())) {
      throw new Error('Date must be a valid date');
    }
  }

  toJSON(): MetricJSON {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      value: this.value,
      unit: this.unit,
      baseValue: this.baseValue,
      date: this.date.toISOString().split('T')[0],
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromDatabase(row: MetricRow): Metric {
    return new Metric({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      value: parseFloat(String(row.value)),
      unit: row.unit,
      baseValue: parseFloat(String(row.base_value)),
      date: row.date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  toDatabase(): MetricDatabase {
    return {
      id: this.id,
      user_id: this.userId,
      type: this.type,
      value: this.value,
      unit: this.unit,
      base_value: this.baseValue,
      date: this.date,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
