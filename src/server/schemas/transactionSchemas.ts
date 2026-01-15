import Joi, { CustomHelpers } from 'joi';
import { strings } from '../locales/strings';

const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/;
const supportedTokens = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT'];

export const sendTransactionSchema = Joi.object({
  fromAddress: Joi.string().pattern(ethAddressPattern).required().messages({
    'string.pattern.base': strings.validation.transaction.fromAddressInvalid,
    'any.required': strings.validation.transaction.fromAddressRequired,
  }),
  toAddress: Joi.string().pattern(ethAddressPattern).required().messages({
    'string.pattern.base': strings.validation.transaction.toAddressInvalid,
    'any.required': strings.validation.transaction.toAddressRequired,
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': strings.validation.transaction.amountPositive,
    'any.required': strings.validation.transaction.amountRequired,
  }),
  tokenSymbol: Joi.string()
    .valid(...supportedTokens)
    .required()
    .messages({
      'any.only': strings.validation.transaction.tokenInvalid(supportedTokens.join(', ')),
      'any.required': strings.validation.transaction.tokenRequired,
    }),
});

interface SwapValue {
  fromToken: string;
  toToken: string;
  walletAddress: string;
  fromAmount: number;
}

export const swapTokensSchema = Joi.object({
  walletAddress: Joi.string().pattern(ethAddressPattern).required().messages({
    'string.pattern.base': strings.validation.transaction.walletAddressInvalid,
    'any.required': strings.validation.transaction.walletAddressRequired,
  }),
  fromToken: Joi.string()
    .valid(...supportedTokens)
    .required()
    .messages({
      'any.only': strings.validation.transaction.fromTokenInvalid(supportedTokens.join(', ')),
      'any.required': strings.validation.transaction.fromTokenRequired,
    }),
  toToken: Joi.string()
    .valid(...supportedTokens)
    .required()
    .messages({
      'any.only': strings.validation.transaction.toTokenInvalid(supportedTokens.join(', ')),
      'any.required': strings.validation.transaction.toTokenRequired,
    }),
  fromAmount: Joi.number().positive().required().messages({
    'number.positive': strings.validation.transaction.amountPositive,
    'any.required': strings.validation.transaction.fromAmountRequired,
  }),
}).custom((value: SwapValue, helpers: CustomHelpers) => {
  if (value.fromToken === value.toToken) {
    return helpers.error('any.invalid', {
      message: strings.validation.transaction.cannotSwapSameToken,
    });
  }
  return value;
});

export const addressParamSchema = Joi.object({
  address: Joi.string().pattern(ethAddressPattern).required().messages({
    'string.pattern.base': strings.validation.transaction.addressInvalid,
    'any.required': strings.validation.transaction.addressRequired,
  }),
});

export const txHashParamSchema = Joi.object({
  txHash: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{64}$/)
    .required()
    .messages({
      'string.pattern.base': strings.validation.transaction.txHashInvalid,
      'any.required': strings.validation.transaction.txHashRequired,
    }),
});

export const paginationQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});
