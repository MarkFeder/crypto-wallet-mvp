import { Response } from 'express';
import { HTTP_STATUS } from '../../common/constants/server';

/**
 * Send a success response
 */
export const sendSuccess = <T extends object>(
  res: Response,
  data: T,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error: Error | null = null
): Response => {
  if (error) {
    console.error(`Error [${statusCode}]:`, message, error);
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

/**
 * Common error responses
 */
export const badRequest = (res: Response, message: string = 'Invalid request'): Response =>
  sendError(res, message, HTTP_STATUS.BAD_REQUEST);

export const unauthorized = (res: Response, message: string = 'Unauthorized'): Response =>
  sendError(res, message, HTTP_STATUS.UNAUTHORIZED);

export const forbidden = (res: Response, message: string = 'Forbidden'): Response =>
  sendError(res, message, HTTP_STATUS.FORBIDDEN);

export const notFound = (res: Response, message: string = 'Resource not found'): Response =>
  sendError(res, message, HTTP_STATUS.NOT_FOUND);

export const serverError = (
  res: Response,
  message: string = 'Internal server error',
  error: Error | null = null
): Response => sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, error);

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 */
export const asyncHandler = <T>(
  fn: (req: T, res: Response, next: () => void) => Promise<Response | void>
) => {
  return (req: T, res: Response, next: () => void): void => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      console.error('Async handler error:', error);
      sendError(res, 'An unexpected error occurred', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
    });
  };
};
