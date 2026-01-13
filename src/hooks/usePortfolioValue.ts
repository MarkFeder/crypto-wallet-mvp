import { useMemo } from 'react';
import { Wallet, Price } from '../types';

export const usePortfolioValue = (wallets: Wallet[], prices: Record<string, Price>): number => {
  return useMemo(() => {
    let total = 0;
    wallets.forEach(wallet => {
      wallet.addresses.forEach(addr => {
        const price = parseFloat(prices[addr.currency]?.price || '0');
        total += parseFloat(addr.balance) * price;
      });
    });
    return total;
  }, [wallets, prices]);
};
