import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't expose stack trace in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  const response: ApiResponse = {
    success: false,
    message: error.message || 'Internal server error',
  };

  // Include stack trace in development
  if (isDevelopment && error.stack) {
    response.error = error.stack;
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    res.status(400).json({
      ...response,
      message: 'Validation failed',
    });
    return;
  }

  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      ...response,
      message: 'Unauthorized',
    });
    return;
  }

  if (error.name === 'ForbiddenError') {
    res.status(403).json({
      ...response,
      message: 'Forbidden',
    });
    return;
  }

  if (error.name === 'NotFoundError') {
    res.status(404).json({
      ...response,
      message: 'Resource not found',
    });
    return;
  }

  if (error.name === 'ConflictError') {
    res.status(409).json({
      ...response,
      message: error.message,
    });
    return;
  }

  // Default to 500 internal server error
  res.status(500).json(response);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error classes
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
