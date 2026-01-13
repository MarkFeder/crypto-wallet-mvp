const Joi = require('joi');
const { strings } = require('../locales/strings');

const createWalletSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': strings.validation.wallet.nameEmpty,
      'string.max': strings.validation.wallet.nameMaxLength,
      'any.required': strings.validation.wallet.nameRequired
    })
});

const walletIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': strings.validation.wallet.idMustBeNumber,
      'number.positive': strings.validation.wallet.idMustBePositive,
      'any.required': strings.validation.wallet.idRequired
    })
});

module.exports = { createWalletSchema, walletIdParamSchema };
