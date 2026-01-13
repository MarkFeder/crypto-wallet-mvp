const Joi = require('joi');

const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/;
const supportedTokens = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

const sendTransactionSchema = Joi.object({
  fromAddress: Joi.string()
    .pattern(ethAddressPattern)
    .required()
    .messages({
      'string.pattern.base': 'From address must be a valid Ethereum address',
      'any.required': 'From address is required'
    }),
  toAddress: Joi.string()
    .pattern(ethAddressPattern)
    .required()
    .messages({
      'string.pattern.base': 'To address must be a valid Ethereum address',
      'any.required': 'To address is required'
    }),
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
  tokenSymbol: Joi.string()
    .valid(...supportedTokens)
    .required()
    .messages({
      'any.only': `Token must be one of: ${supportedTokens.join(', ')}`,
      'any.required': 'Token symbol is required'
    })
});

const swapTokensSchema = Joi.object({
  walletAddress: Joi.string()
    .pattern(ethAddressPattern)
    .required()
    .messages({
      'string.pattern.base': 'Wallet address must be a valid Ethereum address',
      'any.required': 'Wallet address is required'
    }),
  fromToken: Joi.string()
    .valid(...supportedTokens)
    .required()
    .messages({
      'any.only': `From token must be one of: ${supportedTokens.join(', ')}`,
      'any.required': 'From token is required'
    }),
  toToken: Joi.string()
    .valid(...supportedTokens)
    .required()
    .messages({
      'any.only': `To token must be one of: ${supportedTokens.join(', ')}`,
      'any.required': 'To token is required'
    }),
  fromAmount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'Amount must be greater than 0',
      'any.required': 'From amount is required'
    })
}).custom((value, helpers) => {
  if (value.fromToken === value.toToken) {
    return helpers.error('any.invalid', { message: 'Cannot swap to the same token' });
  }
  return value;
});

const addressParamSchema = Joi.object({
  address: Joi.string()
    .pattern(ethAddressPattern)
    .required()
    .messages({
      'string.pattern.base': 'Address must be a valid Ethereum address',
      'any.required': 'Address is required'
    })
});

const txHashParamSchema = Joi.object({
  txHash: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required()
    .messages({
      'string.pattern.base': 'Transaction hash must be a valid hex string',
      'any.required': 'Transaction hash is required'
    })
});

const paginationQuerySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50),
  offset: Joi.number()
    .integer()
    .min(0)
    .default(0)
});

module.exports = {
  sendTransactionSchema,
  swapTokensSchema,
  addressParamSchema,
  txHashParamSchema,
  paginationQuerySchema
};
