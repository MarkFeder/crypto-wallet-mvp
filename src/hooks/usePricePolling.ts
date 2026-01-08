import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { fetchPrices } from '../redux/priceSlice';

export const usePricePolling = (interval: number = 30000, enabled: boolean = true) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!enabled) return;

    dispatch(fetchPrices());

    const pollInterval = setInterval(() => {
      dispatch(fetchPrices());
    }, interval);

    return () => clearInterval(pollInterval);
  }, [dispatch, interval, enabled]);
};
