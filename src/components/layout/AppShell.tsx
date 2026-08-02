'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarContent } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { CommandPalette } from './CommandPalette';
import { NAV } from './nav';
import { Icon, ZivaMark } from '@/components/icons';
import { ScrollProgress } from '@/components/ui/Reveal';
import { Toaster } from '@/components/ui/Toast';
import { ThemeSync } from './ThemeSync';
import { useZiva } from '@/lib/store';
import { cx } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = React.useState(false);
  const [cmd, setCmd] = React.useState(false);
  const keys = useZiva((s) => s.keys);
  const nKeys = Object.keys(keys).length;

  React.useEffect(() => { setDrawer(false); }, [pathname]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd((c) => !c); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const current = NAV.find((n) => (n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)));

  return (
    <>
      <ThemeSync />
      <ScrollProgress />
      <div className="relative z-10 flex min-h-dvh">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOPBAR */}
          <header className="sticky top-0 z-40 border-b border-line/70 bg-[var(--glass)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
              <button onClick={() => setDrawer(true)} aria-label="Buka menu" className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-line bg-surface2 text-muted transition-colors hover:text-ink lg:hidden">
                <Icon name="menu" size={17} />
              </button>
              <Link href="/" className="lg:hidden"><ZivaMark size={30} /></Link>

              <div className="hidden min-w-0 items-center gap-2.5 lg:flex">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-brand/30 bg-brand/10 text-brand">
                  <Icon name={current?.icon ?? 'pulse'} size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-extrabold leading-tight tracking-tight text-ink">{current?.label ?? 'Ziva'}</p>
                  <p className="truncate text-[11px] text-dim">{current?.desc}</p>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setCmd(true)}
                  className="group hidden h-10 items-center gap-2.5 rounded-full border border-line bg-surface2 pl-3.5 pr-2 text-[13px] text-dim transition-all duration-300 hover:border-brand/45 hover:text-ink sm:flex"
                >
                  <Icon name="search" size={15} />
                  <span className="pr-6">Cari cepat</span>
                  <kbd className="z-mono rounded-lg border border-line bg-surface px-1.5 py-1 text-[10px] font-bold">⌘K</kbd>
                </button>

                <Link
                  href="/keys"
                  className={cx('hidden h-10 items-center gap-2 rounded-full border px-3.5 text-[12px] font-bold transition-all duration-300 md:flex',
                    nKeys > 0 ? 'border-ok/30 bg-ok/10 text-ok' : 'border-warn/30 bg-warn/10 text-warn')}
                >
                  <Icon name={nKeys > 0 ? 'lock' : 'alert'} size={14} />
                  {nKeys > 0 ? `${nKeys} key aktif` : 'Belum ada key'}
                </Link>

                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-7 sm:px-6">{children}</main>

          <footer className="border-t border-line/70 px-4 py-7 sm:px-6">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 text-[11.5px] text-dim">
              <p className="flex items-center gap-2">
                <ZivaMark size={18} />
                <span className="font-semibold">Ziva Agent AI</span> · 10-Role Multi-Agent Router
              </p>
              <p>Berjalan sepenuhnya di browser · tanpa server · tanpa backend</p>
            </div>
          </footer>
        </div>
      </div>

      {/* DRAWER MOBILE */}
      {drawer && (
        <div className="fixed inset-0 z-[92] lg:hidden">
          <div className="z-anim-fade absolute inset-0 bg-[rgba(6,9,18,.62)] backdrop-blur-md" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] overflow-hidden rounded-r-[2rem] border-r border-line bg-surface shadow-[var(--shadow-2)]" style={{ animation: 'z-fade-in .25s ease both' }}>
            <SidebarContent onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      <Toaster />
    </>
  );
}
