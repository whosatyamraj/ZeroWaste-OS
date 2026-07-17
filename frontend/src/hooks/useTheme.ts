import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { setTheme } from '@/store/slices/uiSlice';

export function useTheme() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.ui.theme);

  const applyTheme = useCallback((t: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    if (t === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('light', !systemDark);
      root.classList.toggle('dark', systemDark);
    } else {
      root.classList.toggle('light', t === 'light');
      root.classList.toggle('dark', t === 'dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme, applyTheme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(next));
  };

  const changeTheme = (t: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(t));
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return { theme, isDark, toggleTheme, changeTheme };
}
