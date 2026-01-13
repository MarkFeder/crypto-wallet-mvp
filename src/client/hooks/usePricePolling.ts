import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchPrices } from '../redux/priceSlice';

export const usePricePolling = (interval: number = 60000, enabled: boolean = true) => {
  const dispatch = useDispatch<AppDispatch>();
  const { prices } = useSelector((state: RootState) => state.price);
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    // Only fetch if no prices or data is stale (older than interval)
    const now = Date.now();
    const isStale = Object.keys(prices).length === 0 || now - lastFetchRef.current > interval;

    if (isStale) {
      dispatch(fetchPrices());
      lastFetchRef.current = now;
    }

    const pollInterval = setInterval(() => {
      dispatch(fetchPrices());
      lastFetchRef.current = Date.now();
    }, interval);

    return () => clearInterval(pollInterval);
  }, [dispatch, interval, enabled, prices]);
};
