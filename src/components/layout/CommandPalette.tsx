'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { NAV } from './nav';
import { Icon, CornerFrame } from '@/components/icons';
import { useZiva } from '@/lib/store';
import { cx } from '@/lib/utils';

interface Cmd { id: string; label: string; hint: string; icon: string; run: () => void; group: string }

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const roles = useZiva((s) => s.roles);
  const setSettings = useZiva((s) => s.setSettings);
  const theme = useZiva((s) => s.settings.theme);
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const cmds: Cmd[] = React.useMemo(() => [
    ...NAV.map((n) => ({ id: `nav:${n.href}`, label: n.label, hint: n.desc, icon: n.icon, group: 'Navigasi', run: () => router.push(n.href) })),
    ...roles.map((r) => ({ id: `role:${r.id}`, label: r.name, hint: `${r.provider} · ${r.model}`, icon: r.icon, group: 'Role', run: () => router.push(`/roles?focus=${r.id}`) })),
    { id: 'theme', label: theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap', hint: 'Toggle light/dark', icon: theme === 'dark' ? 'sun' : 'moon', group: 'Aksi', run: () => setSettings({ theme: theme === 'dark' ? 'light' : 'dark' }) },
  ], [roles, router, setSettings, theme]);

  const list = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return cmds;
    return cmds.filter((c) => c.label.toLowerCase().includes(s) || c.hint.toLowerCase().includes(s));
  }, [q, cmds]);

  React.useEffect(() => { setIdx(0); }, [q]);
  React.useEffect(() => { if (open) setQ(''); }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(list.length - 1, i + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
      if (e.key === 'Enter') { e.preventDefault(); const c = list[idx]; if (c) { c.run(); onClose(); } }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, list, idx, onClose]);

  if (!mounted || !open) return null;

  let lastGroup = '';
  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-start justify-center p-4 pt-[12vh]">
      <div className="z-anim-fade absolute inset-0 bg-[rgba(6,9,18,.6)] backdrop-blur-md" onClick={onClose} />
      <div className="z-anim-pop relative w-full max-w-[600px] overflow-hidden rounded-[2rem] border border-line shadow-[var(--shadow-2)]" style={{ background: 'var(--glass)', backdropFilter: 'blur(24px) saturate(160%)' }}>
        <CornerFrame inset={12} />
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <Icon name="search" size={17} className="text-brand" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari halaman, role, atau aksi..." className="flex-1 bg-transparent text-sm outline-none" />
          <kbd className="z-mono rounded-lg border border-line bg-surface2 px-2 py-1 text-[10px] font-bold text-dim">ESC</kbd>
        </div>
        <div className="z-scroll max-h-[52vh] p-2">
          {list.length === 0 && <p className="px-3 py-10 text-center text-sm text-dim">Tidak ada yang cocok.</p>}
          {list.map((c, i) => {
            const showGroup = c.group !== lastGroup;
            lastGroup = c.group;
            return (
              <React.Fragment key={c.id}>
                {showGroup && <p className="px-3 pb-1 pt-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-dim">{c.group}</p>}
                <button
                  onClick={() => { c.run(); onClose(); }}
                  onMouseEnter={() => setIdx(i)}
                  className={cx('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors', i === idx ? 'bg-surface3' : '')}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-line bg-surface2 text-brand"><Icon name={c.icon} size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-ink">{c.label}</span>
                    <span className="block truncate text-[11px] text-dim">{c.hint}</span>
                  </span>
                  {i === idx && <Icon name="arrowRight" size={14} className="text-brand" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
