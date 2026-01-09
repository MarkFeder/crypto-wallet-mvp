const { HTTP_STATUS } = require('../../constants/serverConfig');

/**
 * Send a success response
 */
const sendSuccess = (res, data, statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Send an error response
 */
const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, error = null) => {
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
const errorResponses = {
  badRequest: (res, message = 'Invalid request') =>
    sendError(res, message, HTTP_STATUS.BAD_REQUEST),

  unauthorized: (res, message = 'Unauthorized') =>
    sendError(res, message, HTTP_STATUS.UNAUTHORIZED),

  forbidden: (res, message = 'Forbidden') =>
    sendError(res, message, HTTP_STATUS.FORBIDDEN),

  notFound: (res, message = 'Resource not found') =>
    sendError(res, message, HTTP_STATUS.NOT_FOUND),

  serverError: (res, message = 'Internal server error', error = null) =>
    sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, error),
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Async handler error:', error);
      sendError(res, 'An unexpected error occurred', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
    });
  };
};

module.exports = {
  sendSuccess,
  sendError,
  ...errorResponses,
  asyncHandler,
};
