import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { APP_CONFIG } from './constants/config';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { usePricePolling } from './hooks';
import './App.css';

const App: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  usePricePolling(APP_CONFIG.PRICE_POLLING_INTERVAL, !!token);

  return (
    <div className="app">
      {token ? <Dashboard /> : <Login />}
    </div>
  );
};

export default App;
