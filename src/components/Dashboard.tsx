import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { logout } from '../redux/authSlice';
import { fetchWallets, createWallet, selectWallet } from '../redux/walletSlice';
import { Wallet } from '../types';
import Portfolio from './Portfolio';
import WalletDetail from './WalletDetail';
import CreateWallet from './CreateWallet';
import { Skeleton, Spinner } from './ui';
import { strings } from '../locales';

const STALE_THRESHOLD = 60000; // 1 minute

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { wallets, selectedWallet, loading, lastFetched } = useSelector(
    (state: RootState) => state.wallet
  );
  const [showCreateWallet, setShowCreateWallet] = useState(false);

  useEffect(() => {
    const isStale = !lastFetched || Date.now() - lastFetched > STALE_THRESHOLD;
    if (isStale && !loading) {
      dispatch(fetchWallets());
    }
  }, [dispatch, lastFetched, loading]);

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
          <h1>🔐 {strings.app.name}</h1>
          <div className="header-actions">
            <span className="user-info">{strings.auth.welcomeUser(user?.username || '')}</span>
            <button onClick={handleLogout} className="btn-secondary">
              {strings.common.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>{strings.wallet.myWallets}</h3>
              <button
                onClick={() => setShowCreateWallet(true)}
                className="btn-icon"
                title={strings.wallet.createWallet}
              >
                +
              </button>
            </div>

            <div className="wallet-list">
              {loading && wallets.length === 0 ? (
                <div className="wallet-loading">
                  <Skeleton height={60} count={3} className="wallet-skeleton" />
                </div>
              ) : wallets.length === 0 ? (
                <p className="empty-state">{strings.wallet.noWalletsYet}</p>
              ) : (
                wallets.map(wallet => (
                  <div
                    key={wallet.id}
                    className={`wallet-item ${selectedWallet?.id === wallet.id ? 'active' : ''}`}
                    onClick={() => handleSelectWallet(wallet)}
                  >
                    <div className="wallet-name">{wallet.name}</div>
                    <div className="wallet-assets">
                      {wallet.addresses.length} {strings.common.assets}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="main-content">
          {loading && wallets.length === 0 ? (
            <div className="main-loading">
              <Spinner size="large" />
              <p>{strings.portfolio.loadingPortfolio}</p>
            </div>
          ) : selectedWallet ? (
            <WalletDetail wallet={selectedWallet} />
          ) : (
            <Portfolio wallets={wallets} />
          )}
        </main>
      </div>

      {showCreateWallet && (
        <CreateWallet onClose={() => setShowCreateWallet(false)} onCreate={handleCreateWallet} />
      )}
    </div>
  );
};

export default Dashboard;
