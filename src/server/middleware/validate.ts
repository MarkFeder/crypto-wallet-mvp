import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { badRequest } from '../utils/apiResponse';

/**
 * Validation middleware factory using Joi
 * @param schema - Joi validation schema
 * @returns Express middleware function
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      badRequest(res, messages);
      return;
    }

    req.body = value; // Use sanitized values
    next();
  };
};

/**
 * Validation middleware for URL parameters
 * @param schema - Joi validation schema
 * @returns Express middleware function
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      badRequest(res, messages);
      return;
    }

    req.params = value;
    next();
  };
};

/**
 * Validation middleware for query parameters
 * @param schema - Joi validation schema
 * @returns Express middleware function
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      badRequest(res, messages);
      return;
    }

    req.query = value;
    next();
  };
};
