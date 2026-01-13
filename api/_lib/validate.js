/**
 * Validate request body against Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {Object} body - Request body to validate
 * @returns {Object} - { valid: boolean, value: Object, error: string }
 */
function validateBody(schema, body) {
  const { error, value } = schema.validate(body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map(d => d.message).join(', ');
    return { valid: false, value: null, error: messages };
  }

  return { valid: true, value, error: null };
}

/**
 * Validate URL parameters against Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {Object} params - URL parameters to validate
 * @returns {Object} - { valid: boolean, value: Object, error: string }
 */
function validateParams(schema, params) {
  const { error, value } = schema.validate(params, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map(d => d.message).join(', ');
    return { valid: false, value: null, error: messages };
  }

  return { valid: true, value, error: null };
}

/**
 * Validate query parameters against Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {Object} query - Query parameters to validate
 * @returns {Object} - { valid: boolean, value: Object, error: string }
 */
function validateQuery(schema, query) {
  const { error, value } = schema.validate(query, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map(d => d.message).join(', ');
    return { valid: false, value: null, error: messages };
  }

  return { valid: true, value, error: null };
}

module.exports = { validateBody, validateParams, validateQuery };
