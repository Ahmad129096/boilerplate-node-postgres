import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '@/types';

/**
 * Validation middleware factory
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);
      
      // Replace the request data with validated data
      req[source] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          errors,
        };

        res.status(400).json(response);
        return;
      }

      // If it's not a ZodError, pass it to the error handler
      next(error);
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Validate query parameters
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/**
 * Validate route parameters
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
