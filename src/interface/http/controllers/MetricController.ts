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
import { IMetricRepository } from "../../../domain";
import { NotFoundError, BadRequestError } from "../middlewares/errorHandler";

export interface MetricControllerDependencies {
  createMetricUseCase: CreateMetricUseCase;
  listMetricsUseCase: ListMetricsUseCase;
  getChartDataUseCase: GetChartDataUseCase;
  metricRepository: IMetricRepository;
}

export class MetricController {
  private readonly _createMetricUseCase: CreateMetricUseCase;
  private readonly _listMetricsUseCase: ListMetricsUseCase;
  private readonly _getChartDataUseCase: GetChartDataUseCase;
  private readonly _metricRepository: IMetricRepository;

  constructor(deps: MetricControllerDependencies) {
    this._createMetricUseCase = deps.createMetricUseCase;
    this._listMetricsUseCase = deps.listMetricsUseCase;
    this._getChartDataUseCase = deps.getChartDataUseCase;
    this._metricRepository = deps.metricRepository;

    // Bind methods to preserve `this` context
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
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

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const metric = await this._metricRepository.findById(id);

      if (!metric) {
        throw new NotFoundError(`Metric with id ${id} not found`);
      }

      res.status(200).json({
        success: true,
        data: metric.toJSON(),
      });
    } catch (error) {
      next(error);
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
