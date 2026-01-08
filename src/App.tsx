import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './redux/store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { fetchPrices } from './redux/priceSlice';
import './App.css';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      // Fetch prices every 30 seconds
      dispatch(fetchPrices());
      const interval = setInterval(() => {
        dispatch(fetchPrices());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token, dispatch]);

  return (
    <div className="app">
      {token ? <Dashboard /> : <Login />}
    </div>
  );
};

export default App;
