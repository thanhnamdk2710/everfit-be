import Joi from 'joi';
import { Unit } from '../../../domain';

const distanceUnits = Unit.getValidUnits('distance');
const temperatureUnits = Unit.getValidUnits('temperature');
const allUnits = [...distanceUnits, ...temperatureUnits];

export const createMetricSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.guid': 'userId must be a valid UUID',
    'any.required': 'userId is required',
  }),
  type: Joi.string().valid('distance', 'temperature').required().messages({
    'any.only': 'type must be either "distance" or "temperature"',
    'any.required': 'type is required',
  }),
  value: Joi.number().required().messages({
    'number.base': 'value must be a number',
    'any.required': 'value is required',
  }),
  unit: Joi.string()
    .required()
    .custom((value: string, helpers: Joi.CustomHelpers) => {
      const type = (helpers.state.ancestors as any[])[0]?.type;
      const validUnits = Unit.getValidUnits(type);

      if (!validUnits.includes(value.toLowerCase())) {
        return helpers.error('any.invalid', {
          message: `Invalid unit "${value}" for type "${type}". Valid units: ${validUnits.join(', ')}`,
        });
      }
      return value.toLowerCase();
    })
    .messages({
      'any.required': 'unit is required',
      'any.invalid': '{{#message}}',
    }),
  date: Joi.date().iso().required().messages({
    'date.format': 'date must be in ISO format (YYYY-MM-DD)',
    'any.required': 'date is required',
  }),
});

export const listMetricsSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  type: Joi.string().valid('distance', 'temperature'),
  unit: Joi.string()
    .lowercase()
    .when('type', {
      is: 'distance',
      then: Joi.valid(...distanceUnits),
      otherwise: Joi.when('type', {
        is: 'temperature',
        then: Joi.valid(...temperatureUnits),
        otherwise: Joi.valid(...allUnits),
      }),
    }),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const chartDataSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  type: Joi.string().valid('distance', 'temperature').required(),
  period: Joi.string().valid('1month', '2month').default('1month'),
  unit: Joi.string()
    .lowercase()
    .when('type', {
      is: 'distance',
      then: Joi.valid(...distanceUnits),
      otherwise: Joi.valid(...temperatureUnits),
    }),
});

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
