'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown, operation: 'read' | 'write') => {
      console.warn(`Error during localStorage ${operation} for key “${key}”:`, error);
      toast({
        variant: 'destructive',
        title: 'Storage Error',
        description: `Could not ${operation} data. Your changes might not be saved. Please ensure you are not in private browsing mode and have enough storage space.`,
      });
    },
    [key, toast]
  );

  useEffect(() => {
    let item;
    try {
      if (typeof window !== 'undefined') {
        item = window.localStorage.getItem(key);
      }
    } catch (error) {
      handleError(error, 'read');
    }

    if (item) {
      try {
        const parsedValue = JSON.parse(item);
        setValue(parsedValue);
      } catch (error) {
        handleError(error, 'read');
        // If parsing fails, we can stick with the initial value
      }
    }
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, handleError]);

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    if (!isInitialized) {
      return;
    }
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      handleError(error, 'write');
    }
  };

  return [value, setStoredValue];
}
