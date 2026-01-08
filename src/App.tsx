import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { usePricePolling } from './hooks';
import './App.css';

const App: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  usePricePolling(30000, !!token);

  return (
    <div className="app">
      {token ? <Dashboard /> : <Login />}
    </div>
  );
};

export default App;
