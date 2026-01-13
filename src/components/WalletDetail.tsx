import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchTransactions } from '../redux/walletSlice';
import { Wallet, WalletAddress } from '../types';
import { APP_CONFIG } from '../constants/config';
import { formatCurrency, formatCrypto, shortenAddress } from '../utils/format';
import { useClipboard } from '../hooks';
import { calculateAssetValue, safeParseFloat } from '../utils/calculations';
import SendTransaction from './SendTransaction';
import { strings } from '../locales';

interface WalletDetailProps {
  wallet: Wallet;
}

const WalletDetail: React.FC<WalletDetailProps> = ({ wallet }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions } = useSelector((state: RootState) => state.wallet);
  const { prices } = useSelector((state: RootState) => state.price);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const { copyToClipboard } = useClipboard();

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
        <p className="wallet-id">{strings.wallet.walletId(wallet.id)}</p>
      </div>

      <div className="addresses-section">
        <h3>{strings.wallet.addressesAndBalances}</h3>
        <div className="addresses-grid">
          {wallet.addresses.map((addr: WalletAddress) => {
            const price = safeParseFloat(prices[addr.currency]?.price || '0');
            const value = calculateAssetValue(addr.balance, price);

            return (
              <div key={addr.currency} className="address-card">
                <div className="address-header">
                  <span className="currency-badge">{addr.currency}</span>
                  <button className="btn-small" onClick={() => handleSend(addr.currency)}>
                    {strings.transaction.send}
                  </button>
                </div>
                <div className="address-balance">
                  {formatCrypto(addr.balance)} {addr.currency}
                </div>
                <div className="address-value">{formatCurrency(value)}</div>
                <div className="address-text" title={addr.address}>
                  {shortenAddress(
                    addr.address,
                    APP_CONFIG.ADDRESS_DISPLAY.SHORT_START_LENGTH,
                    APP_CONFIG.ADDRESS_DISPLAY.SHORT_END_LENGTH
                  )}
                </div>
                <button className="btn-copy" onClick={() => copyToClipboard(addr.address)}>
                  {strings.wallet.copyAddress}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="transactions-section">
        <h3>{strings.transaction.transactionHistory}</h3>
        {transactions.length === 0 ? (
          <p className="empty-state">{strings.transaction.noTransactionsYet}</p>
        ) : (
          <div className="transactions-list">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-type">
                  {tx.type === 'send' ? '📤' : '📥'}{' '}
                  {tx.type?.toUpperCase() || strings.common.unknown}
                </div>
                <div className="tx-details">
                  <div className="tx-currency">{tx.currency}</div>
                  <div className="tx-amount">
                    {tx.type === 'send' ? '-' : '+'}
                    {formatCrypto(tx.amount)}
                  </div>
                </div>
                <div className="tx-address">
                  {tx.type === 'send' ? strings.transaction.to : strings.transaction.from}
                  {shortenAddress(
                    (tx.type === 'send' ? tx.to_address : tx.from_address) || '',
                    APP_CONFIG.ADDRESS_DISPLAY.TRANSACTION_START_LENGTH,
                    APP_CONFIG.ADDRESS_DISPLAY.TRANSACTION_END_LENGTH
                  )}
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
