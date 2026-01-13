import { VALIDATION } from '../../common/constants/config';

export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

export const isValidAddress = (address: string, type: 'BTC' | 'ETH'): boolean => {
  if (type === 'ETH') {
    return VALIDATION.ETH_ADDRESS_REGEX.test(address);
  }
  if (type === 'BTC') {
    return VALIDATION.BTC_ADDRESS_REGEX.test(address);
  }
  return false;
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};
