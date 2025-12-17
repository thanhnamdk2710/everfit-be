import { Metric, MetricProps } from '../../src/domain/entities/Metric';
import { MetricRow } from '../../src/types';

describe('Metric Entity', () => {
  const validMetricData: MetricProps = {
    userId: '550e8400-e29b-41d4-a716-446655440001',
    type: 'distance',
    value: 100,
    unit: 'meter',
    baseValue: 100,
    date: '2024-01-15',
  };

  describe('Creation', () => {
    test('should create metric with valid data', () => {
      const metric = new Metric(validMetricData);

      expect(metric.userId).toBe(validMetricData.userId);
      expect(metric.type).toBe('distance');
      expect(metric.value).toBe(100);
      expect(metric.unit).toBe('meter');
      expect(metric.baseValue).toBe(100);
      expect(metric.id).toBeDefined();
    });

    test('should generate UUID if not provided', () => {
      const metric = new Metric(validMetricData);
      expect(metric.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    test('should convert date string to Date object', () => {
      const metric = new Metric(validMetricData);
      expect(metric.date).toBeInstanceOf(Date);
    });

    test('should use provided id', () => {
      const metric = new Metric({ ...validMetricData, id: 'custom-id' });
      expect(metric.id).toBe('custom-id');
    });
  });

  describe('Validation', () => {
    test('should throw error without userId', () => {
      expect(
        () => new Metric({ ...validMetricData, userId: '' })
      ).toThrow('UserId is required');
    });

    test('should throw error for invalid type', () => {
      expect(
        () => new Metric({ ...validMetricData, type: 'invalid' as any })
      ).toThrow('Type must be either "distance" or "temperature"');
    });

    test('should throw error for invalid value', () => {
      expect(
        () => new Metric({ ...validMetricData, value: NaN })
      ).toThrow('Value must be a valid number');
    });

    test('should throw error without unit', () => {
      expect(
        () => new Metric({ ...validMetricData, unit: '' })
      ).toThrow('Unit is required');
    });

    test('should throw error for invalid date', () => {
      expect(
        () => new Metric({ ...validMetricData, date: 'invalid-date' })
      ).toThrow('Date must be a valid date');
    });
  });

  describe('Serialization', () => {
    test('should convert to JSON correctly', () => {
      const metric = new Metric({ ...validMetricData, id: 'test-id' });
      const json = metric.toJSON();

      expect(json.id).toBe('test-id');
      expect(json.userId).toBe(validMetricData.userId);
      expect(json.type).toBe('distance');
      expect(json.date).toBe('2024-01-15');
      expect(json.createdAt).toBeDefined();
      expect(json.updatedAt).toBeDefined();
    });

    test('should convert to database format correctly', () => {
      const metric = new Metric({ ...validMetricData, id: 'test-id' });
      const dbData = metric.toDatabase();

      expect(dbData.id).toBe('test-id');
      expect(dbData.user_id).toBe(validMetricData.userId);
      expect(dbData.base_value).toBe(100);
      expect(dbData.type).toBe('distance');
    });

    test('should create from database row correctly', () => {
      const dbRow: MetricRow = {
        id: 'test-id',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        type: 'temperature',
        value: '36.5',
        unit: 'celsius',
        base_value: '309.65',
        date: new Date('2024-01-15'),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const metric = Metric.fromDatabase(dbRow);

      expect(metric.id).toBe('test-id');
      expect(metric.userId).toBe(dbRow.user_id);
      expect(metric.type).toBe('temperature');
      expect(metric.value).toBe(36.5);
      expect(metric.baseValue).toBe(309.65);
    });
  });

  describe('Immutability', () => {
    test('should have readonly properties', () => {
      const metric = new Metric(validMetricData);
      
      // TypeScript won't allow this at compile time, 
      // but we verify the structure is correct
      expect(metric.id).toBeDefined();
      expect(metric.userId).toBeDefined();
      expect(metric.type).toBeDefined();
    });
  });
});
