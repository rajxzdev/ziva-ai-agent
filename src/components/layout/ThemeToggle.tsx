'use client';

import { useZiva } from '@/lib/store';
import { Icon } from '@/components/icons';
import { cx } from '@/lib/utils';
import type { ThemeMode } from '@/types';

const MODES: { id: ThemeMode; icon: string; label: string }[] = [
  { id: 'light', icon: 'sun', label: 'Terang' },
  { id: 'dark', icon: 'moon', label: 'Gelap' },
  { id: 'system', icon: 'monitor', label: 'Sistem' },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useZiva((s) => s.settings.theme);
  const set = useZiva((s) => s.setSettings);

  return (
    <div className={cx('inline-flex items-center gap-0.5 rounded-full border border-line bg-surface2 p-1', compact && 'scale-95')}>
      {MODES.map((m) => {
        const on = theme === m.id;
        return (
          <button
            key={m.id}
            onClick={() => set({ theme: m.id })}
            aria-label={`Tema ${m.label}`}
            title={`Tema ${m.label}`}
            className={cx(
              'grid h-8 w-8 place-items-center rounded-full transition-all duration-300',
              on ? 'text-white' : 'text-dim hover:text-ink',
            )}
            style={on ? { background: 'linear-gradient(120deg, var(--brand-1), var(--brand-2))', boxShadow: '0 6px 16px -8px var(--brand-1)' } : undefined}
          >
            <Icon name={m.icon} size={15} />
          </button>
        );
      })}
    </div>
  );
}
