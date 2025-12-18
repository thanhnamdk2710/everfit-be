import swaggerJsdoc from 'swagger-jsdoc';
import { Unit } from '../../domain';

const distanceUnits = Unit.getValidUnits('distance');
const temperatureUnits = Unit.getValidUnits('temperature');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Metrics API',
      version: '1.0.0',
      description:
        'API for tracking health metrics (distance, temperature) with automatic unit conversion',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Metrics',
        description: 'Metric tracking endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
    components: {
      schemas: {
        MetricType: {
          type: 'string',
          enum: ['distance', 'temperature'],
          description: 'Type of metric',
        },
        DistanceUnit: {
          type: 'string',
          enum: distanceUnits,
          description: 'Distance unit',
        },
        TemperatureUnit: {
          type: 'string',
          enum: temperatureUnits,
          description: 'Temperature unit',
        },
        ChartPeriod: {
          type: 'string',
          enum: ['1month', '2months'],
          description: 'Chart time period',
        },
        CreateMetricRequest: {
          type: 'object',
          required: ['userId', 'type', 'value', 'unit', 'date'],
          properties: {
            userId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
            type: {
              $ref: '#/components/schemas/MetricType',
            },
            value: {
              type: 'number',
              example: 100,
            },
            unit: {
              type: 'string',
              example: 'centimeter',
              description: 'Unit matching the metric type',
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2025-12-01',
            },
          },
        },
        MetricResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            type: {
              $ref: '#/components/schemas/MetricType',
            },
            value: {
              type: 'number',
              description: 'Value in original unit',
            },
            unit: {
              type: 'string',
              description: 'Original unit',
            },
            originalValue: {
              type: 'number',
              description: 'Value converted to requested unit (or base unit)',
            },
            originalUnit: {
              type: 'string',
              description: 'Requested unit (or base unit)',
            },
            date: {
              type: 'string',
              format: 'date',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ChartDataPoint: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
            },
            value: {
              type: 'number',
            },
            unit: {
              type: 'string',
            },
          },
        },
        ChartDataResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            type: {
              $ref: '#/components/schemas/MetricType',
            },
            unit: {
              type: 'string',
            },
            period: {
              $ref: '#/components/schemas/ChartPeriod',
            },
            startDate: {
              type: 'string',
              format: 'date',
            },
            endDate: {
              type: 'string',
              format: 'date',
            },
            dataPoints: {
              type: 'integer',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ChartDataPoint',
              },
            },
          },
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
            },
            limit: {
              type: 'integer',
            },
            total: {
              type: 'integer',
            },
            totalPages: {
              type: 'integer',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                      },
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'Server is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api': {
        get: {
          tags: ['Health'],
          summary: 'API info',
          responses: {
            200: {
              description: 'API information',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      version: { type: 'string' },
                      supportedUnits: {
                        type: 'object',
                        properties: {
                          distance: {
                            type: 'array',
                            items: { type: 'string' },
                          },
                          temperature: {
                            type: 'array',
                            items: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/metrics': {
        post: {
          tags: ['Metrics'],
          summary: 'Create a new metric',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateMetricRequest',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Metric created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/MetricResponse' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        get: {
          tags: ['Metrics'],
          summary: 'List metrics with filtering and pagination',
          parameters: [
            {
              name: 'userId',
              in: 'query',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Filter by user ID',
            },
            {
              name: 'type',
              in: 'query',
              schema: { $ref: '#/components/schemas/MetricType' },
              description: 'Filter by metric type',
            },
            {
              name: 'unit',
              in: 'query',
              schema: { type: 'string' },
              description: 'Convert values to this unit',
            },
            {
              name: 'startDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter from date',
            },
            {
              name: 'endDate',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Filter to date',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20, maximum: 100 },
            },
          ],
          responses: {
            200: {
              description: 'List of metrics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/MetricResponse' },
                      },
                      pagination: {
                        $ref: '#/components/schemas/PaginationInfo',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/metrics/chart': {
        get: {
          tags: ['Metrics'],
          summary: 'Get chart data (latest metric per day)',
          parameters: [
            {
              name: 'userId',
              in: 'query',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
            {
              name: 'type',
              in: 'query',
              required: true,
              schema: { $ref: '#/components/schemas/MetricType' },
            },
            {
              name: 'period',
              in: 'query',
              required: true,
              schema: { $ref: '#/components/schemas/ChartPeriod' },
            },
            {
              name: 'unit',
              in: 'query',
              schema: { type: 'string' },
              description:
                'Convert values to this unit (default: meter for distance, kelvin for temperature)',
            },
          ],
          responses: {
            200: {
              description: 'Chart data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ChartDataResponse' },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
