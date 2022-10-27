import { useEffect, useMemo, useState } from 'react';

import { LocalStorageKey } from './local-storage-keys';

export function getDarkModeSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// If localStorage.theme is not 'dark' or 'light', set it to the system preference
export function getDarkModeSetting() {
  const theme = localStorage.getItem(LocalStorageKey.DarkModeTheme);
  if (theme === 'dark' || theme === 'light') {
    return theme;
  } else {
    return 'auto';
  }
}

export function getDarkOrLightMode() {
  const theme = getDarkModeSetting();
  if (theme === 'auto') {
    return getDarkModeSystemPreference();
  } else {
    return theme;
  }
}

export function useDarkOrLightMode() {
  // Use mutation observer on document element to detect when the theme changes

  const [darkMode, setDarkMode] = useState<'dark' | 'light'>(
    getDarkOrLightMode()
  );
  const observer = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new MutationObserver((event) => {
        setDarkMode(getDarkOrLightMode());
      });
    }
  }, [setDarkMode]);

  useEffect(() => {
    observer?.observe(document.documentElement, {
      attributes: true,
    });
    return () => {
      observer?.disconnect();
    };
  }, [observer]);

  return darkMode;
}

export function setDarkMode(mode: 'dark' | 'light' | 'auto') {
  if (mode === 'auto') {
    localStorage.removeItem(LocalStorageKey.DarkModeTheme);
  } else {
    localStorage.setItem(LocalStorageKey.DarkModeTheme, mode);
  }

  refreshDarkMode();
}

export function refreshDarkMode() {
  const isAuto = !(LocalStorageKey.DarkModeTheme in localStorage);
  const systemPreferenceIsDark =
    isAuto && getDarkModeSystemPreference() === 'dark';

  if (
    localStorage.getItem(LocalStorageKey.DarkModeTheme) === 'dark' ||
    systemPreferenceIsDark
  ) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
