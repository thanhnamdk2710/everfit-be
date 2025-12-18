import {
  MetricType,
  DistanceUnit,
  TemperatureUnit,
  UnitConfig,
  UnitConfigMap,
} from "../../types";

const DISTANCE_UNITS: Record<DistanceUnit, UnitConfig> = {
  meter: {
    toBase: (v) => v,
    fromBase: (v) => v,
    symbol: "m",
  },
  centimeter: {
    toBase: (v) => v * 0.01,
    fromBase: (v) => v * 100,
    symbol: "cm",
  },
  inch: {
    toBase: (v) => v * 0.0254,
    fromBase: (v) => v / 0.0254,
    symbol: "in",
  },
  feet: {
    toBase: (v) => v * 0.3048,
    fromBase: (v) => v / 0.3048,
    symbol: "ft",
  },
  yard: {
    toBase: (v) => v * 0.9144,
    fromBase: (v) => v / 0.9144,
    symbol: "yd",
  },
};

const TEMPERATURE_UNITS: Record<TemperatureUnit, UnitConfig> = {
  kelvin: { toBase: (v) => v, fromBase: (v) => v, symbol: "K" },
  celsius: {
    toBase: (v) => v + 273.15,
    fromBase: (v) => v - 273.15,
    symbol: "°C",
  },
  fahrenheit: {
    toBase: (v) => (v - 32) * (5 / 9) + 273.15,
    fromBase: (v) => (v - 273.15) * (9 / 5) + 32,
    symbol: "°F",
  },
};

const UNIT_CONFIGS: Record<MetricType, UnitConfigMap> = {
  distance: DISTANCE_UNITS,
  temperature: TEMPERATURE_UNITS,
};

export class Unit {
  public readonly type: MetricType;
  public readonly unit: string;
  private readonly config: UnitConfig;

  constructor(type: string, unit: string) {
    this.type = type.toLowerCase() as MetricType;
    this.unit = unit.toLowerCase();

    this.validate();
    this.config = UNIT_CONFIGS[this.type][this.unit];
  }

  private validate(): void {
    if (!UNIT_CONFIGS[this.type]) {
      throw new Error(
        `Invalid metric type: ${this.type}. Must be "distance" or "temperature"`
      );
    }
    if (!UNIT_CONFIGS[this.type][this.unit]) {
      const validUnits = Object.keys(UNIT_CONFIGS[this.type]).join(", ");
      throw new Error(
        `Invalid unit "${this.unit}" for type "${this.type}". Valid units: ${validUnits}`
      );
    }
  }

  toBase(value: number): number {
    return this.config.toBase(value);
  }

  fromBase(value: number): number {
    return this.config.fromBase(value);
  }

  getBaseUnit(type: MetricType): string {
    return type === "distance" ? "meter" : "kelvin";
  }

  static getValidUnits(type: string): string[] {
    const config = UNIT_CONFIGS[type?.toLowerCase() as MetricType];
    return config ? Object.keys(config) : [];
  }

  static isValidUnit(type: string, unit: string): boolean {
    const config = UNIT_CONFIGS[type?.toLowerCase() as MetricType];
    return config !== undefined && config[unit?.toLowerCase()] !== undefined;
  }
}

export { DISTANCE_UNITS, TEMPERATURE_UNITS };
