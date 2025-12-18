import { Router } from "express";

import { MetricController } from "../controllers/MetricController";
import { validate } from "../middlewares/errorHandler";
import {
  createMetricSchema,
  listMetricsSchema,
  chartDataSchema,
} from "../validators/metricValidator";

export const createMetricRoutes = (
  metricController: MetricController
): Router => {
  const router = Router();

  /**
   * @route   POST /api/metrics
   * @desc    Create a new metric
   */
  router.post(
    "/",
    validate(createMetricSchema, "body"),
    metricController.create
  );

  /**
   * @route   GET /api/metrics
   * @desc    List metrics with filters and pagination
   * @query   userId (required), type, unit, startDate, endDate, page, limit
   */
  router.get("/", validate(listMetricsSchema, "query"), metricController.list);

  /**
   * @route   GET /api/metrics/chart
   * @desc    Get chart data (latest metric per day)
   * @query   userId (required), type (required), period, unit
   */
  router.get(
    "/chart",
    validate(chartDataSchema, "query"),
    metricController.getChartData
  );

  return router;
};
