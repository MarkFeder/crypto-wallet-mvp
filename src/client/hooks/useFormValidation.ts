import { useState, useCallback } from 'react';

type ValidationRule<T> = (value: unknown, formData: T) => string | null;

interface ValidationRules<T> {
  [field: string]: ValidationRule<T>;
}

interface UseFormValidationReturn<T> {
  errors: Partial<Record<keyof T, string>>;
  validate: (data: T) => boolean;
  validateField: (field: keyof T, value: unknown, formData: T) => string | null;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

export function useFormValidation<T extends Record<string, unknown>>(
  rules: ValidationRules<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = useCallback(
    (data: T): boolean => {
      const newErrors: Partial<Record<keyof T, string>> = {};
      let isValid = true;

      Object.entries(rules).forEach(([field, validator]) => {
        const error = validator(data[field], data);
        if (error) {
          newErrors[field as keyof T] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [rules]
  );

  const validateField = useCallback(
    (field: keyof T, value: unknown, formData: T): string | null => {
      const validator = rules[field as string];
      if (!validator) return null;

      const error = validator(value, formData);
      setErrors(prev => ({
        ...prev,
        [field]: error || undefined,
      }));
      return error;
    },
    [rules]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldError,
  };
}

// Common validation helpers
export const validators = {
  required:
    (message = 'This field is required') =>
    (value: unknown) =>
      !value ? message : null,

  email:
    (message = 'Please enter a valid email') =>
    (value: unknown) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return value && !emailRegex.test(String(value)) ? message : null;
    },

  minLength: (min: number, message?: string) => (value: unknown) => {
    const str = String(value || '');
    return str.length < min ? message || `Must be at least ${min} characters` : null;
  },

  pattern:
    (regex: RegExp, message = 'Invalid format') =>
    (value: unknown) =>
      value && !regex.test(String(value)) ? message : null,

  positive:
    (message = 'Must be a positive number') =>
    (value: unknown) => {
      const num = Number(value);
      return isNaN(num) || num <= 0 ? message : null;
    },
};
