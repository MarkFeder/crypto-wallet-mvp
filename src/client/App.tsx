import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { APP_CONFIG } from '../common/constants/config';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/ui/Toast';
import { ToastProvider } from './context/ToastContext';
import { usePricePolling } from './hooks';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  usePricePolling(APP_CONFIG.PRICE_POLLING_INTERVAL, isAuthenticated);

  return isAuthenticated ? <Dashboard /> : <Login />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="app">
          <AppContent />
          <Toast />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
