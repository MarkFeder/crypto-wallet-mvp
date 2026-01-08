import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Wallet, WalletAddress, Price } from '../types';

interface PortfolioProps {
  wallets: Wallet[];
}

const Portfolio: React.FC<PortfolioProps> = ({ wallets }) => {
  const { prices } = useSelector((state: RootState) => state.price);

  const calculateTotalValue = () => {
    let total = 0;
    wallets.forEach((wallet) => {
      wallet.addresses.forEach((addr: WalletAddress) => {
        const price = parseFloat(prices[addr.currency]?.price || '0');
        total += parseFloat(addr.balance) * price;
      });
    });
    return total;
  };

  const totalValue = calculateTotalValue();

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h2>Portfolio Overview</h2>
      </div>

      <div className="portfolio-stats">
        <div className="stat-card">
          <div className="stat-label">Total Value</div>
          <div className="stat-value">${totalValue.toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Wallets</div>
          <div className="stat-value">{wallets.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Assets</div>
          <div className="stat-value">
            {wallets.reduce((sum, w) => sum + w.addresses.length, 0)}
          </div>
        </div>
      </div>

      <div className="assets-section">
        <h3>Assets by Currency</h3>
        <div className="assets-grid">
          {Object.entries(prices).map(([currency, data]: [string, Price]) => {
            const totalBalance = wallets.reduce((sum, wallet) => {
              const addr = wallet.addresses.find((a: WalletAddress) => a.currency === currency);
              return sum + (addr ? parseFloat(addr.balance) : 0);
            }, 0);

            const value = totalBalance * parseFloat(data.price);

            return (
              <div key={currency} className="asset-card">
                <div className="asset-header">
                  <span className="asset-name">{currency}</span>
                  <span className={`asset-change ${data.change24h >= 0 ? 'positive' : 'negative'}`}>
                    {data.change24h >= 0 ? '↑' : '↓'} {Math.abs(data.change24h).toFixed(2)}%
                  </span>
                </div>
                <div className="asset-balance">{totalBalance.toFixed(8)} {currency}</div>
                <div className="asset-value">${value.toFixed(2)}</div>
                <div className="asset-price">${parseFloat(data.price).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {wallets.length === 0 && (
        <div className="empty-portfolio">
          <p>🔐 Create your first wallet to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
