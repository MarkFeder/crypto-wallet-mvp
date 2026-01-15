import Joi from 'joi';
import { strings } from '../locales/strings';

export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.min': strings.validation.auth.usernameMinLength,
    'string.max': strings.validation.auth.usernameMaxLength,
    'string.alphanum': strings.validation.auth.usernameAlphanumeric,
    'any.required': strings.validation.auth.usernameRequired,
  }),
  email: Joi.string().email().required().messages({
    'string.email': strings.validation.auth.emailInvalid,
    'any.required': strings.validation.auth.emailRequired,
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': strings.validation.auth.passwordMinLength,
      'string.pattern.base': strings.validation.auth.passwordRequirements,
      'any.required': strings.validation.auth.passwordRequired,
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': strings.validation.auth.emailInvalid,
    'any.required': strings.validation.auth.emailRequired,
  }),
  password: Joi.string().required().messages({
    'any.required': strings.validation.auth.passwordRequired,
  }),
});
