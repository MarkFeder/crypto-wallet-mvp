import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Wallet, Price } from '../types';
import { formatCurrency, formatCrypto, formatPercentage } from '../utils/format';
import { usePortfolioValue } from '../hooks';
import {
  calculateCurrencyBalance,
  calculateAssetValue,
  safeParseFloat,
} from '../utils/calculations';
import { strings } from '../locales';

interface PortfolioProps {
  wallets: Wallet[];
}

const Portfolio: React.FC<PortfolioProps> = ({ wallets }) => {
  const { prices } = useSelector((state: RootState) => state.price);
  const totalValue = usePortfolioValue(wallets, prices);

  // Memoize expensive calculations
  const currencyBreakdown = useMemo(() => {
    return Object.entries(prices).map(([currency, data]: [string, Price]) => {
      const totalBalance = calculateCurrencyBalance(wallets, currency);
      const value = calculateAssetValue(totalBalance, data.price);
      return { currency, data, totalBalance, value };
    });
  }, [wallets, prices]);

  const totalAssets = useMemo(() => {
    return wallets.reduce((sum, w) => sum + (w.addresses?.length || 0), 0);
  }, [wallets]);

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h2>{strings.portfolio.overview}</h2>
      </div>

      <div className="portfolio-stats">
        <div className="stat-card">
          <div className="stat-label">{strings.portfolio.totalValue}</div>
          <div className="stat-value">{formatCurrency(totalValue)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">{strings.portfolio.totalWallets}</div>
          <div className="stat-value">{wallets.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">{strings.portfolio.activeAssets}</div>
          <div className="stat-value">{totalAssets}</div>
        </div>
      </div>

      <div className="assets-section">
        <h3>{strings.portfolio.assetsByCurrency}</h3>
        <div className="assets-grid">
          {currencyBreakdown.map(({ currency, data, totalBalance, value }) => (
            <div key={currency} className="asset-card">
              <div className="asset-header">
                <span className="asset-name">{currency}</span>
                <span className={`asset-change ${data.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercentage(data.change24h)}
                </span>
              </div>
              <div className="asset-balance">
                {formatCrypto(totalBalance)} {currency}
              </div>
              <div className="asset-value">{formatCurrency(value)}</div>
              <div className="asset-price">{formatCurrency(safeParseFloat(data.price))}</div>
            </div>
          ))}
        </div>
      </div>

      {wallets.length === 0 && (
        <div className="empty-portfolio">
          <p>🔐 {strings.wallet.createFirstWallet}</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
