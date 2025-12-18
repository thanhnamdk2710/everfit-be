import { Request, Response, NextFunction } from "express";

import {
  CreateMetricUseCase,
  ListMetricsUseCase,
  GetChartDataUseCase,
} from "../../../application";
import {
  CreateMetricDTO,
  ListMetricsDTO,
  ChartDataDTO,
} from "../../../application/dto/MetricDTO";
import { BadRequestError } from "../middlewares/errorHandler";

export interface MetricControllerDependencies {
  createMetricUseCase: CreateMetricUseCase;
  listMetricsUseCase: ListMetricsUseCase;
  getChartDataUseCase: GetChartDataUseCase;
}

export class MetricController {
  private readonly _createMetricUseCase: CreateMetricUseCase;
  private readonly _listMetricsUseCase: ListMetricsUseCase;
  private readonly _getChartDataUseCase: GetChartDataUseCase;

  constructor(deps: MetricControllerDependencies) {
    this._createMetricUseCase = deps.createMetricUseCase;
    this._listMetricsUseCase = deps.listMetricsUseCase;
    this._getChartDataUseCase = deps.getChartDataUseCase;

    // Bind methods to preserve `this` context
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.getChartData = this.getChartData.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new CreateMetricDTO(req.body);
      const result = await this._createMetricUseCase.execute(dto);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(new BadRequestError((error as Error).message));
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new ListMetricsDTO(req.query as any);
      const result = await this._listMetricsUseCase.execute(dto);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(new BadRequestError((error as Error).message));
    }
  }

  async getChartData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = new ChartDataDTO(req.query as any);
      const result = await this._getChartDataUseCase.execute(dto);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(new BadRequestError((error as Error).message));
    }
  }
}
