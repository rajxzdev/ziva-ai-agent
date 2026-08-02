'use client';

import * as React from 'react';
import { useZiva } from '@/lib/store';

export function ThemeSync() {
  const { theme, accent, motion } = useZiva((s) => s.settings);

  React.useEffect(() => {
    const el = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      el.classList.toggle('dark', dark);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  React.useEffect(() => { document.documentElement.setAttribute('data-accent', accent); }, [accent]);
  React.useEffect(() => { document.documentElement.classList.toggle('no-motion', !motion); }, [motion]);

  return null;
}

/** True hanya setelah mount di browser — mencegah mismatch hidrasi. */
export function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => { setM(true); }, []);
  return m;
}
