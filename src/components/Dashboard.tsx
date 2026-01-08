import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { logout } from '../redux/authSlice';
import { fetchWallets, createWallet, selectWallet } from '../redux/walletSlice';
import { Wallet } from '../types';
import Portfolio from './Portfolio';
import WalletDetail from './WalletDetail';
import CreateWallet from './CreateWallet';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { wallets, selectedWallet } = useSelector((state: RootState) => state.wallet);
  const [showCreateWallet, setShowCreateWallet] = useState(false);

  useEffect(() => {
    dispatch(fetchWallets());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleCreateWallet = async (name: string) => {
    await dispatch(createWallet(name));
    setShowCreateWallet(false);
    dispatch(fetchWallets());
  };

  const handleSelectWallet = (wallet: Wallet) => {
    dispatch(selectWallet(wallet));
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🔐 CryptoVault</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user?.username}!</span>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>My Wallets</h3>
              <button
                onClick={() => setShowCreateWallet(true)}
                className="btn-icon"
                title="Create Wallet"
              >
                +
              </button>
            </div>

            <div className="wallet-list">
              {wallets.length === 0 ? (
                <p className="empty-state">No wallets yet. Create one!</p>
              ) : (
                wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className={`wallet-item ${
                      selectedWallet?.id === wallet.id ? 'active' : ''
                    }`}
                    onClick={() => handleSelectWallet(wallet)}
                  >
                    <div className="wallet-name">{wallet.name}</div>
                    <div className="wallet-assets">
                      {wallet.addresses.length} assets
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="main-content">
          {selectedWallet ? (
            <WalletDetail wallet={selectedWallet} />
          ) : (
            <Portfolio wallets={wallets} />
          )}
        </main>
      </div>

      {showCreateWallet && (
        <CreateWallet
          onClose={() => setShowCreateWallet(false)}
          onCreate={handleCreateWallet}
        />
      )}
    </div>
  );
};

export default Dashboard;
