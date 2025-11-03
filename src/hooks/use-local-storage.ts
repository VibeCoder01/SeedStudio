"use client";

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let item;
    try {
      if (typeof window !== 'undefined') {
        item = window.localStorage.getItem(key);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
    }

    if (item) {
      setValue(JSON.parse(item));
    }
    setIsInitialized(true);
  }, [key]);

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    if (!isInitialized) {
        // Prevent setting value before initialization
        return;
    }
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [value, setStoredValue];
}
