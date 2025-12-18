import type { Application } from "express";

import { createApp } from "./interface/http/app";
import { MetricController } from "./interface/http/controllers/MetricController";
import {
  CreateMetricUseCase,
  GetChartDataUseCase,
  ListMetricsUseCase,
} from "./application";
import { IMetricRepository } from "./domain";
import { PostgresMetricRepository } from "./infrastructure";

export interface AppContainer {
  metricRepository: IMetricRepository;
  createMetricUseCase: CreateMetricUseCase;
  listMetricsUseCase: ListMetricsUseCase;
  getChartDataUseCase: GetChartDataUseCase;
  metricController: MetricController;
  app: Application;
}

export const createContainer = (): AppContainer => {
  const metricRepository = new PostgresMetricRepository();

  const createMetricUseCase = new CreateMetricUseCase(metricRepository);
  const listMetricsUseCase = new ListMetricsUseCase(metricRepository);
  const getChartDataUseCase = new GetChartDataUseCase(metricRepository);

  const metricController = new MetricController({
    createMetricUseCase,
    listMetricsUseCase,
    getChartDataUseCase,
  });

  const app = createApp({ metricController });

  return {
    metricRepository,
    createMetricUseCase,
    listMetricsUseCase,
    getChartDataUseCase,
    metricController,
    app,
  };
};
