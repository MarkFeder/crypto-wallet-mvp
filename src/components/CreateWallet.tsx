import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Button, Input, Modal } from './ui';
import { useClipboard } from '../hooks';

interface CreateWalletProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreateWallet: React.FC<CreateWalletProps> = ({ onClose, onCreate }) => {
  const [walletName, setWalletName] = useState('');
  const [step, setStep] = useState<'name' | 'mnemonic'>('name');
  const { mnemonic } = useSelector((state: RootState) => state.wallet);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (walletName.trim()) {
      await onCreate(walletName);
      setStep('mnemonic');
    }
  };

  const handleCopy = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      {step === 'name' ? (
        <>
          <h2>Create New Wallet</h2>
          <p className="modal-description">
            Give your wallet a name to help you identify it.
          </p>

          <div className="form-group">
            <label>Wallet Name</label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="e.g., My Main Wallet"
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreate} className="btn-primary">
              Create Wallet
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>🔑 Save Your Recovery Phrase</h2>
          <div className="warning-box">
            ⚠️ Write down these 12 words in order and keep them safe. You'll need
            them to recover your wallet if you lose access.
          </div>

          <div className="mnemonic-box">
            {mnemonic?.split(' ').map((word, index) => (
              <div key={index} className="mnemonic-word">
                <span className="word-number">{index + 1}.</span>
                <span className="word-text">{word}</span>
              </div>
            ))}
          </div>

          <button onClick={handleCopy} className="btn-copy-mnemonic">
            {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
          </button>

          <div className="modal-actions">
            <button onClick={onClose} className="btn-primary full-width">
              I've Saved My Recovery Phrase
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CreateWallet;
