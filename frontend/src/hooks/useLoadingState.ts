import { useState, useCallback } from 'react';

interface UseLoadingState {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (loading: boolean) => void;
}

export const useLoadingState = (initialState = false): UseLoadingState => {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return {
    loading,
    startLoading,
    stopLoading,
    setLoading,
  };
};

interface UseAsyncLoading<T> extends UseLoadingState {
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
}

export const useAsyncLoading = <T,>(initialState = false): UseAsyncLoading<T> => {
  const { loading, startLoading, stopLoading, setLoading } = useLoadingState(initialState);

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      startLoading();
      const result = await asyncFn();
      return result;
    } catch (error) {
      console.error('Async operation failed:', error);
      return null;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    startLoading,
    stopLoading,
    setLoading,
    execute,
  };
};
