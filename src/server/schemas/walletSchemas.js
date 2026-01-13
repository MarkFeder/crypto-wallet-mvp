const Joi = require('joi');

const createWalletSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Wallet name cannot be empty',
      'string.max': 'Wallet name must be at most 50 characters',
      'any.required': 'Wallet name is required'
    })
});

const walletIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Wallet ID must be a number',
      'number.positive': 'Wallet ID must be positive',
      'any.required': 'Wallet ID is required'
    })
});

module.exports = { createWalletSchema, walletIdParamSchema };
