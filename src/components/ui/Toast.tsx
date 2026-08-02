'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { Icon } from '@/components/icons';
import { uid, cx } from '@/lib/utils';

type Tone = 'ok' | 'err' | 'info' | 'warn';
interface ToastItem { id: string; title: string; desc?: string; tone: Tone }

interface ToastState {
  items: ToastItem[];
  push: (t: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (t) => {
    const id = uid();
    set((s) => ({ items: [...s.items, { ...t, id }].slice(-4) }));
    setTimeout(() => set((s) => ({ items: s.items.filter((i) => i.id !== id) })), 4200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

export const toast = {
  ok: (title: string, desc?: string) => useToastStore.getState().push({ title, desc, tone: 'ok' }),
  err: (title: string, desc?: string) => useToastStore.getState().push({ title, desc, tone: 'err' }),
  info: (title: string, desc?: string) => useToastStore.getState().push({ title, desc, tone: 'info' }),
  warn: (title: string, desc?: string) => useToastStore.getState().push({ title, desc, tone: 'warn' }),
};

const ICONS: Record<Tone, string> = { ok: 'check', err: 'alert', info: 'info', warn: 'alert' };
const COLORS: Record<Tone, string> = { ok: 'var(--ok)', err: 'var(--err)', info: 'var(--brand-1)', warn: 'var(--warn)' };

export function Toaster() {
  const { items, dismiss } = useToastStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,370px)] flex-col gap-2.5">
      {items.map((t) => (
        <div
          key={t.id}
          className={cx('pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-3xl border border-line bg-surface p-3.5 pr-10 shadow-[var(--shadow-2)]')}
          style={{ animation: 'z-pop .34s cubic-bezier(.22,1,.36,1) both', background: 'var(--glass)', backdropFilter: 'blur(18px)' }}
        >
          <span className="absolute inset-y-0 left-0 w-1" style={{ background: COLORS[t.tone] }} />
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border" style={{ borderColor: `${COLORS[t.tone]}44`, background: `${COLORS[t.tone]}1a`, color: COLORS[t.tone] }}>
            <Icon name={ICONS[t.tone]} size={15} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[13px] font-bold leading-tight text-ink">{t.title}</p>
            {t.desc && <p className="mt-1 text-[12px] leading-relaxed text-muted">{t.desc}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} aria-label="Tutup" className="absolute right-2.5 top-3 rounded-full p-1 text-dim transition-colors hover:text-ink">
            <Icon name="close" size={13} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
