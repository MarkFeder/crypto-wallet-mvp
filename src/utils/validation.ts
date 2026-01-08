export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAddress = (address: string, type: 'BTC' | 'ETH'): boolean => {
  if (type === 'ETH') {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  if (type === 'BTC') {
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || /^bc1[a-z0-9]{39,59}$/.test(address);
  }
  return false;
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};
