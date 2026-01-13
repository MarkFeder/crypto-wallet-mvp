const { badRequest } = require('../utils/apiResponse');

/**
 * Validation middleware factory using Joi
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return badRequest(res, messages);
    }

    req.body = value; // Use sanitized values
    next();
  };
};

/**
 * Validation middleware for URL parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return badRequest(res, messages);
    }

    req.params = value;
    next();
  };
};

/**
 * Validation middleware for query parameters
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return badRequest(res, messages);
    }

    req.query = value;
    next();
  };
};

module.exports = { validate, validateParams, validateQuery };
