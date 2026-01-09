import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { createTransaction } from '../redux/walletSlice';
import { Modal } from './ui';

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
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!toAddress || !amount) {
      alert('Please fill in all fields');
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
      alert('Transaction sent successfully!');
      onClose();
    } catch (error) {
      alert('Failed to send transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <h2>Send {currency}</h2>

      <div className="form-group">
        <label>Recipient Address</label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Enter recipient address"
        />
      </div>

      <div className="form-group">
        <label>Amount ({currency})</label>
        <input
          type="number"
          step="0.00000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00000000"
        />
      </div>

      <div className="info-box">
        ℹ️ This is a demo transaction. In production, this would broadcast to the blockchain.
      </div>

      <div className="modal-actions">
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          Cancel
        </button>
        <button onClick={handleSend} className="btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send Transaction'}
        </button>
      </div>
    </Modal>
  );
};

export default SendTransaction;
