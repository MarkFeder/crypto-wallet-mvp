import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { createTransaction } from '../redux/walletSlice';
import { Modal } from './ui';
import { useToast } from '../hooks';
import { strings } from '../locales';

interface SendTransactionProps {
  walletId: number;
  currency: string;
  onClose: () => void;
}

const SendTransaction: React.FC<SendTransactionProps> = ({
  walletId,
  currency,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!toAddress || !amount) {
      toast.warning(strings.validation.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        createTransaction({
          walletId,
          currency,
          type: 'send',
          amount: parseFloat(amount),
          toAddress,
        })
      );
      toast.success(strings.toast.transactionSuccess);
      onClose();
    } catch (error) {
      toast.error(strings.toast.transactionFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h2>{strings.transaction.sendCurrency(currency)}</h2>

      <div className="form-group">
        <label>{strings.transaction.recipientAddress}</label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder={strings.transaction.recipientAddressPlaceholder}
        />
      </div>

      <div className="form-group">
        <label>{strings.transaction.amountWithCurrency(currency)}</label>
        <input
          type="number"
          step="0.00000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={strings.transaction.amountPlaceholder}
        />
      </div>

      <div className="info-box">
        ℹ️ {strings.transaction.demoNotice}
      </div>

      <div className="modal-actions">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          {strings.common.cancel}
        </button>
        <button onClick={handleSend} className="btn-primary" disabled={loading}>
          {loading ? strings.transaction.sending : strings.transaction.sendTransaction}
        </button>
      </div>
    </Modal>
  );
};

export default SendTransaction;
