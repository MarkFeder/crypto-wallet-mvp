import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Button, Input, Modal } from './ui';
import { useClipboard } from '../hooks';
import { strings } from '../locales';

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
          <h2>{strings.wallet.createNewWallet}</h2>
          <p className="modal-description">
            {strings.wallet.walletNameDescription}
          </p>

          <div className="form-group">
            <label>{strings.wallet.walletName}</label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder={strings.wallet.walletNamePlaceholder}
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button onClick={onClose} className="btn-secondary">
              {strings.common.cancel}
            </button>
            <button onClick={handleCreate} className="btn-primary">
              {strings.wallet.createWallet}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>🔑 {strings.wallet.recoveryPhrase.title}</h2>
          <div className="warning-box">
            ⚠️ {strings.wallet.recoveryPhrase.warning}
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
            {copied ? `✓ ${strings.common.copied}` : `📋 ${strings.common.copyToClipboard}`}
          </button>

          <div className="modal-actions">
            <button onClick={onClose} className="btn-primary full-width">
              {strings.wallet.recoveryPhrase.saved}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CreateWallet;
