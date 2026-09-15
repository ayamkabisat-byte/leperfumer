'use client';

import { useEffect, useState } from 'react';

type ThemePreference = 'light' | 'dark' | 'system';

const OPTIONS: Array<{ value: ThemePreference; icon: string; label: string }> = [
  { value: 'light', icon: '☼', label: 'Light' },
  { value: 'dark', icon: '☾', label: 'Dark' },
  { value: 'system', icon: '◐', label: 'System' },
];

function resolvedTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolvedTheme(preference);
  root.style.colorScheme = root.dataset.theme;
}

export default function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const stored = localStorage.getItem('leperfumer_theme');
    const initial: ThemePreference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    setPreference(initial);
    applyTheme(initial);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if ((localStorage.getItem('leperfumer_theme') || 'system') === 'system') applyTheme('system');
    };
    media.addEventListener('change', handleSystemChange);
    return () => media.removeEventListener('change', handleSystemChange);
  }, []);

  const changeTheme = (next: ThemePreference) => {
    setPreference(next);
    localStorage.setItem('leperfumer_theme', next);
    applyTheme(next);
  };

  return (
    <div className="theme-switcher" role="group" aria-label="Color theme">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={preference === option.value ? 'active' : ''}
          onClick={() => changeTheme(option.value)}
          aria-pressed={preference === option.value}
          title={`${option.label} theme`}
        >
          <span aria-hidden="true">{option.icon}</span>
          <em>{option.label}</em>
        </button>
      ))}
    </div>
  );
}
