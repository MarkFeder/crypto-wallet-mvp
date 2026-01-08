import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchTransactions } from '../redux/walletSlice';
import { Wallet, WalletAddress } from '../types';
import { formatCurrency, formatCrypto, shortenAddress } from '../utils/format';
import SendTransaction from './SendTransaction';

interface WalletDetailProps {
  wallet: Wallet;
}

const WalletDetail: React.FC<WalletDetailProps> = ({ wallet }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions } = useSelector((state: RootState) => state.wallet);
  const { prices } = useSelector((state: RootState) => state.price);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');

  useEffect(() => {
    if (wallet) {
      dispatch(fetchTransactions(wallet.id));
    }
  }, [wallet, dispatch]);

  const handleSend = (currency: string) => {
    setSelectedCurrency(currency);
    setShowSendModal(true);
  };

  return (
    <div className="wallet-detail">
      <div className="wallet-detail-header">
        <h2>{wallet.name}</h2>
        <p className="wallet-id">Wallet ID: {wallet.id}</p>
      </div>

      <div className="addresses-section">
        <h3>Addresses & Balances</h3>
        <div className="addresses-grid">
          {wallet.addresses.map((addr: WalletAddress) => {
            const price = parseFloat(prices[addr.currency]?.price || '0');
            const value = parseFloat(addr.balance) * price;

            return (
              <div key={addr.currency} className="address-card">
                <div className="address-header">
                  <span className="currency-badge">{addr.currency}</span>
                  <button
                    className="btn-small"
                    onClick={() => handleSend(addr.currency)}
                  >
                    Send
                  </button>
                </div>
                <div className="address-balance">
                  {formatCrypto(addr.balance)} {addr.currency}
                </div>
                <div className="address-value">{formatCurrency(value)}</div>
                <div className="address-text" title={addr.address}>
                  {shortenAddress(addr.address, 12, 8)}
                </div>
                <button
                  className="btn-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(addr.address);
                    alert('Address copied to clipboard!');
                  }}
                >
                  Copy Address
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="transactions-section">
        <h3>Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="empty-state">No transactions yet</p>
        ) : (
          <div className="transactions-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-type">
                  {tx.type === 'send' ? '📤' : '📥'} {tx.type.toUpperCase()}
                </div>
                <div className="tx-details">
                  <div className="tx-currency">{tx.currency}</div>
                  <div className="tx-amount">
                    {tx.type === 'send' ? '-' : '+'}
                    {formatCrypto(tx.amount)}
                  </div>
                </div>
                <div className="tx-address">
                  {tx.type === 'send' ? 'To: ' : 'From: '}
                  {shortenAddress((tx.type === 'send' ? tx.to_address : tx.from_address) || '', 12, 4)}
                </div>
                <div className="tx-status">
                  <span className={`status-badge ${tx.status}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSendModal && (
        <SendTransaction
          walletId={wallet.id}
          currency={selectedCurrency}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </div>
  );
};

export default WalletDetail;
