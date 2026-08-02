'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from './nav';
import { Icon, ZivaMark } from '@/components/icons';
import { cx } from '@/lib/utils';
import { useZiva } from '@/lib/store';

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const roles = useZiva((s) => s.roles);
  const keys = useZiva((s) => s.keys);
  const history = useZiva((s) => s.history);
  const language = useZiva((s) => s.settings.language);
  const setSettings = useZiva((s) => s.setSettings);

  const counts: Record<string, number> = {
    roles: roles.filter((r) => r.enabled).length,
    keys: Object.keys(keys).length,
    history: history.length,
  };

  const indonesianNav: Record<string, [string, string]> = {
    '/': ['Dashboard', 'Ringkasan sistem & status agent'], '/roles': ['Role Agent', 'Atur provider & model per role'], '/workflow': ['Workflow', 'Peta alur kerja antar agent'], '/run': ['Runner', 'Jalankan pipeline & lihat output'], '/keys': ['API Key', 'Kredensial milikmu, tersimpan lokal'], '/history': ['Riwayat', 'Arsip eksekusi sebelumnya'], '/settings': ['Pengaturan', 'Tema, bahasa, data & backup'],
  };
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col gap-5 p-4">
      <Link href="/" onClick={onNavigate} className="group flex items-center gap-3 rounded-3xl border border-line bg-surface2 p-3 transition-all duration-400 hover:border-brand/40">
        <span className="transition-transform duration-500 group-hover:rotate-[18deg]"><ZivaMark size={36} /></span>
        <span className="min-w-0">
          <span className="block text-[15px] font-extrabold leading-tight tracking-tight text-ink">
            Ziva <span className="z-grad-text">Agent AI</span>
          </span>
          <span className="block truncate text-[10.5px] font-semibold uppercase tracking-[.16em] text-dim">Multi-Agent Router</span>
        </span>
      </Link>

      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface2 p-2"><span className="px-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-dim">Language</span><div className="flex rounded-xl border border-line bg-surface p-1"><button onClick={() => setSettings({ language: 'en' })} className={cx('rounded-lg px-2 py-1 text-[10px] font-bold', language === 'en' ? 'bg-brand text-white' : 'text-muted')}>EN</button><button onClick={() => setSettings({ language: 'id' })} className={cx('rounded-lg px-2 py-1 text-[10px] font-bold', language === 'id' ? 'bg-brand text-white' : 'text-muted')}>ID</button></div></div>

      <nav className="flex flex-col gap-1.5">
        {NAV.map((it, i) => {
          const on = isActive(it.href);
          const copy = language === 'id' ? indonesianNav[it.href] : [it.label, it.desc];
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={cx(
                'group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 transition-all duration-300',
                on ? 'border-brand/35 bg-brand/8 text-ink' : 'border-transparent text-muted hover:border-line hover:bg-surface2 hover:text-ink',
              )}
              style={{ animation: `z-fade-up .5s cubic-bezier(.22,1,.36,1) ${i * 45}ms both` }}
            >
              {on && <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full" style={{ background: 'linear-gradient(180deg,var(--brand-1),var(--brand-2))' }} />}
              <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all duration-300',
                on ? 'border-brand/35 bg-brand/12 text-brand' : 'border-line bg-surface2 text-dim group-hover:text-brand group-hover:scale-105')}>
                <Icon name={it.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold tracking-tight">{copy[0]}</span>
                <span className="block truncate text-[10.5px] text-dim">{copy[1]}</span>
              </span>
              {it.badge && counts[it.badge] > 0 && (
                <span className="shrink-0 rounded-full border border-line bg-surface px-1.5 py-0.5 text-[10px] font-bold text-muted">{counts[it.badge]}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface2 p-4">
          <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl" style={{ background: 'radial-gradient(circle,var(--brand-1),transparent 70%)' }} />
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg border border-ok/30 bg-ok/10 text-ok"><Icon name="lock" size={13} /></span>
            <p className="text-[12px] font-extrabold text-ink">100% Local</p>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            No server or backend. Your configuration and API keys stay in your own browser.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 border-r border-line bg-surface/70 backdrop-blur-xl lg:block">
      <SidebarContent />
    </aside>
  );
}
