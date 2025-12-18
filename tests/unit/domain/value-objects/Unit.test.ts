import { Unit } from '@domain/value-objects/Unit';

describe('Unit Value Object', () => {
  describe('Distance Conversions', () => {
    test('should convert meters to base (meters)', () => {
      const unit = new Unit('distance', 'meter');
      expect(unit.toBase(100)).toBe(100);
    });

    test('should convert centimeters to meters', () => {
      const unit = new Unit('distance', 'centimeter');
      expect(unit.toBase(100)).toBe(1);
    });

    test('should convert inches to meters', () => {
      const unit = new Unit('distance', 'inch');
      expect(unit.toBase(10)).toBeCloseTo(0.254, 6);
    });

    test('should convert feet to meters', () => {
      const unit = new Unit('distance', 'feet');
      expect(unit.toBase(1)).toBeCloseTo(0.3048, 4);
    });

    test('should convert yards to meters', () => {
      const unit = new Unit('distance', 'yard');
      expect(unit.toBase(1)).toBeCloseTo(0.9144, 4);
    });

    test('should convert meters to feet', () => {
      const unit = new Unit('distance', 'feet');
      expect(unit.fromBase(0.3048)).toBeCloseTo(1, 4);
    });

    test('should convert meters to inches', () => {
      const unit = new Unit('distance', 'inch');
      expect(unit.fromBase(0.0254)).toBeCloseTo(1, 6);
    });
  });

  describe('Temperature Conversions', () => {
    test('should convert celsius to kelvin', () => {
      const unit = new Unit('temperature', 'celsius');
      expect(unit.toBase(0)).toBeCloseTo(273.15, 2);
      expect(unit.toBase(100)).toBeCloseTo(373.15, 2);
    });

    test('should convert fahrenheit to kelvin', () => {
      const unit = new Unit('temperature', 'fahrenheit');
      expect(unit.toBase(32)).toBeCloseTo(273.15, 2);
      expect(unit.toBase(212)).toBeCloseTo(373.15, 2);
    });

    test('should convert kelvin to celsius', () => {
      const unit = new Unit('temperature', 'celsius');
      expect(unit.fromBase(273.15)).toBeCloseTo(0, 2);
      expect(unit.fromBase(373.15)).toBeCloseTo(100, 2);
    });

    test('should convert kelvin to fahrenheit', () => {
      const unit = new Unit('temperature', 'fahrenheit');
      expect(unit.fromBase(273.15)).toBeCloseTo(32, 2);
      expect(unit.fromBase(373.15)).toBeCloseTo(212, 2);
    });
  });

  describe('Static Methods', () => {
    test('should return valid distance units', () => {
      const units = Unit.getValidUnits('distance');
      expect(units).toContain('meter');
      expect(units).toContain('feet');
      expect(units).toContain('centimeter');
      expect(units).toContain('inch');
      expect(units).toContain('yard');
    });

    test('should return valid temperature units', () => {
      const units = Unit.getValidUnits('temperature');
      expect(units).toContain('celsius');
      expect(units).toContain('fahrenheit');
      expect(units).toContain('kelvin');
    });

    test('should validate unit correctly', () => {
      expect(Unit.isValidUnit('distance', 'meter')).toBe(true);
      expect(Unit.isValidUnit('distance', 'invalid')).toBe(false);
      expect(Unit.isValidUnit('temperature', 'celsius')).toBe(true);
    });
  });

  describe('Validation', () => {
    test('should throw error for invalid type', () => {
      expect(() => new Unit('invalid', 'meter')).toThrow('Invalid metric type');
    });

    test('should throw error for invalid unit', () => {
      expect(() => new Unit('distance', 'invalid')).toThrow('Invalid unit');
    });
  });
});
