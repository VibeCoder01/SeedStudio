'use client';
import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useLocalStorage<'light' | 'dark' | 'system'>('theme', 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
