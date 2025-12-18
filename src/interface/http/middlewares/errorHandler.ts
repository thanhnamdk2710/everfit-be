import type { Request, Response, NextFunction } from 'express';
import type Joi from 'joi';

import { logger } from '../../../infrastructure/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  public override readonly details: Array<{ field: string; message: string }>;

  constructor(message: string, details: Array<{ field: string; message: string }> = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

// Type for request property
type RequestProperty = 'body' | 'query' | 'params';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema, property: RequestProperty = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const dataToValidate = property === 'query' ? { ...req.query, ...req.params } : req[property];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      next(new ValidationError('Validation failed', details));
      return;
    }

    // Replace with validated/sanitized values
    if (property === 'query') {
      req.query = value;
    } else {
      Object.assign(req, { [property]: value });
    }

    next();
  };
};

// Global error handler
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error with request context
  const logContext = {
    requestId: req.id,
    method: req.method,
    path: req.path,
    error: err.message,
    code: (err as AppError).code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  if ((err as AppError).isOperational) {
    logger.warn(logContext, 'Operational error');
  } else {
    logger.error(logContext, 'Unexpected error');
  }

  // Handle Joi validation errors
  if ('isJoi' in err && err.isJoi) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: (err as Joi.ValidationError).details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      },
    });
    return;
  }

  // Handle operational errors
  if ((err as AppError).isOperational) {
    const appError = err as AppError;
    res.status(appError.statusCode).json({
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details || undefined,
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
