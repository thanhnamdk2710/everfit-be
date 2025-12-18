# Metrics API

A metrics tracking API with unit conversion support, built with **TypeScript**, **Express.js**, **PostgreSQL** following **Clean Architecture** principles.

## Features

- Track distance and temperature metrics
- Unit conversion (metric/imperial systems)
- Chart data aggregation (latest per day)
- Pagination and filtering

## Architecture

```
src/
├── domain/                    # Domain Layer (Core Business Logic)
│   ├── entities/
│   │   └── Metric.ts          # Business entity with validation
│   ├── value-objects/
│   │   └── Unit.ts            # Unit conversion logic (immutable)
│   └── repositories/
│       └── IMetricRepository.ts  # Repository interface (port)
│
├── application/               # Application Layer (Use Cases)
│   ├── use-cases/
│   │   ├── CreateMetricUseCase.ts
│   │   ├── ListMetricsUseCase.ts
│   │   └── GetChartDataUseCase.ts
│   └── dto/
│       └── MetricDTO.ts       # Typed DTOs for input/output
│
├── infrastructure/            # Infrastructure Layer (Adapters)
│   ├── database/
│   │   └── index.ts           # PostgreSQL connection pool
│   └── repositories/
│       └── PostgresMetricRepository.ts  # Implements IMetricRepository
│
├── interface/                 # Interface Layer (Controllers/Routes)
│   └── http/
│       ├── controllers/
│       │   └── MetricController.ts
│       ├── routes/
│       │   └── metricRoutes.ts
│       ├── middlewares/
│       │   └── errorHandler.ts
│       └── validators/
│           └── metricValidator.ts
│
└── types/                     # Shared TypeScript types
    └── index.ts
```

## Quick Start

### Using Docker (Recommended)

```bash
# Production mode
docker-compose up -d

# Development mode with hot reload
docker-compose --profile dev up -d app-dev postgres

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start PostgreSQL
docker-compose up -d postgres

# Build TypeScript
npm run build

# Start development server (with hot reload)
npm run dev

# OR start production server
npm start
```

## API Documentation (Swagger)

Interactive API documentation is available via Swagger UI:

- **Local:** http://localhost:8000/api-docs
- **Production:** https://domain.app/api-docs

You can also access the OpenAPI JSON spec at:
- `/api-docs.json`

![Swagger UI](https://img.shields.io/badge/Swagger-API%20Docs-85EA2D?logo=swagger&logoColor=white)

## API Endpoints

### Create Metric

```bash
POST /api/metrics
Content-Type: application/json

{
  "userId": "userId-uuid",
  "type": "distance",
  "value": 5.5,
  "unit": "kilometer",
  "date": "2024-01-15"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "userId": "550e8400-...",
    "type": "distance",
    "originalValue": 5.5,
    "originalUnit": "kilometer",
    "value": 5.5,
    "unit": "kilometer",
    "date": "2024-01-15",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### List Metrics

```bash
GET /api/metrics?userId=550e8400-...&type=distance&unit=mile&page=1&limit=10
```

| Param     | Required | Description                            |
| --------- | -------- | -------------------------------------- |
| userId    | Yes      | User UUID                              |
| type      | No       | `distance` or `temperature`            |
| unit      | No       | Target unit for conversion             |
| startDate | No       | Filter start date (ISO format)         |
| endDate   | No       | Filter end date (ISO format)           |
| page      | No       | Page number (default: 1)               |
| limit     | No       | Items per page (default: 20, max: 100) |

### Get Chart Data

```bash
GET /api/metrics/chart?userId=550e8400-...&type=distance&period=1month&unit=kilometer
```

| Param  | Required | Description                            |
| ------ | -------- | -------------------------------------- |
| userId | Yes      | User UUID                              |
| type   | Yes      | `distance` or `temperature`            |
| period | No       | `1month` or `2month` (default: 1month) |
| unit   | No       | Target unit for conversion             |

**Response:**

```json
{
  "success": true,
  "type": "distance",
  "unit": "kilometer",
  "period": "1month",
  "startDate": "2023-12-15",
  "endDate": "2024-01-15",
  "dataPoints": 15,
  "data": [
    { "date": "2024-01-01", "value": 5.5, "unit": "kilometer" },
    { "date": "2024-01-02", "value": 8.2, "unit": "kilometer" }
  ]
}
```

## Supported Units

### Distance

| Unit       | Symbol | Base (meter) |
| ---------- | ------ | ------------ |
| meter      | m      | 1            |
| centimeter | cm     | 0.01         |
| inch       | in     | 0.0254       |
| feet       | ft     | 0.3048       |
| yard       | yd     | 0.9144       |

### Temperature

| Unit       | Symbol | Formula to Kelvin        |
| ---------- | ------ | ------------------------ |
| kelvin     | °K     | °K                       |
| celsius    | °C     | °C + 273.15              |
| fahrenheit | °F     | (°F - 32) × 5/9 + 273.15 |

## TypeScript Types

Key types are exported from `src/types/index.ts`:

```typescript
type MetricType = "distance" | "temperature";
type DistanceUnit = "meter" | "centimeter" | "inch" | "feet" | "yard";
type TemperatureUnit = "celsius" | "fahrenheit" | "kelvin";
type ChartPeriod = "1month" | "2month";
```

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Type checking
npm run typecheck

# With coverage
npm test -- --coverage
```

## Scripts

| Script              | Description                            |
| ------------------- | -------------------------------------- |
| `npm run build`     | Compile TypeScript to JavaScript       |
| `npm start`         | Run production server                  |
| `npm run dev`       | Run development server with hot reload |
| `npm test`          | Run all tests                          |
| `npm run typecheck` | Type checking without emit             |
| `npm run lint`      | Run ESLint                             |
