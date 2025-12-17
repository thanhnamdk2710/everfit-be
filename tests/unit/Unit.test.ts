import { Unit } from '../../src/domain/value-objects/Unit';

describe('Unit Value Object', () => {
  describe('Distance Conversions', () => {
    test('should convert meters to base (meters)', () => {
      const unit = new Unit('distance', 'meter');
      expect(unit.toBase(100)).toBe(100);
    });

    test('should convert kilometers to meters', () => {
      const unit = new Unit('distance', 'kilometer');
      expect(unit.toBase(1)).toBe(1000);
    });

    test('should convert centimeters to meters', () => {
      const unit = new Unit('distance', 'centimeter');
      expect(unit.toBase(100)).toBe(1);
    });

    test('should convert feet to meters', () => {
      const unit = new Unit('distance', 'feet');
      expect(unit.toBase(1)).toBeCloseTo(0.3048, 4);
    });

    test('should convert miles to meters', () => {
      const unit = new Unit('distance', 'mile');
      expect(unit.toBase(1)).toBeCloseTo(1609.344, 3);
    });

    test('should convert meters to kilometers', () => {
      const unit = new Unit('distance', 'kilometer');
      expect(unit.fromBase(1000)).toBe(1);
    });

    test('should convert meters to feet', () => {
      const unit = new Unit('distance', 'feet');
      expect(unit.fromBase(0.3048)).toBeCloseTo(1, 4);
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
      expect(units).toContain('kilometer');
      expect(units).toContain('feet');
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

    test('should convert between units directly', () => {
      const result = Unit.convert(1, 'kilometer', 'mile', 'distance');
      expect(result).toBeCloseTo(0.621371, 4);
    });

    test('should convert celsius to fahrenheit directly', () => {
      const result = Unit.convert(0, 'celsius', 'fahrenheit', 'temperature');
      expect(result).toBeCloseTo(32, 2);

      const result2 = Unit.convert(100, 'celsius', 'fahrenheit', 'temperature');
      expect(result2).toBeCloseTo(212, 2);
    });

    test('should get distance units list', () => {
      const units = Unit.getDistanceUnits();
      expect(units).toHaveLength(7);
      expect(units).toContain('meter');
      expect(units).toContain('mile');
    });

    test('should get temperature units list', () => {
      const units = Unit.getTemperatureUnits();
      expect(units).toHaveLength(3);
      expect(units).toContain('celsius');
      expect(units).toContain('kelvin');
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
