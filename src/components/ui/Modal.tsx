'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@/lib/utils';
import { Icon, CornerFrame } from '@/components/icons';
import { Button } from './Button';

export function Modal({
  open, onClose, title, desc, icon, children, footer, width = 560,
}: {
  open: boolean; onClose: () => void; title: string; desc?: string; icon?: string;
  children?: React.ReactNode; footer?: React.ReactNode; width?: number;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-center p-4 sm:p-6">
      <div className="z-anim-fade absolute inset-0 bg-[rgba(6,9,18,.62)] backdrop-blur-md" onClick={onClose} />
      <div
        role="dialog" aria-modal="true"
        className="z-anim-pop relative w-full overflow-hidden rounded-[2rem] border border-line bg-surface shadow-[var(--shadow-2)]"
        style={{ maxWidth: width }}
      >
        <CornerFrame inset={12} />
        <span className="absolute inset-x-[15%] top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,var(--brand-1),transparent)' }} />
        <div className="flex items-start gap-3.5 px-6 pt-6">
          {icon && (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-brand/30 bg-brand/10 text-brand">
              <Icon name={icon} size={19} />
            </span>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-lg font-extrabold tracking-tight text-ink">{title}</h3>
            {desc && <p className="mt-1 text-[13px] leading-relaxed text-muted">{desc}</p>}
          </div>
          <button onClick={onClose} aria-label="Tutup" className="shrink-0 rounded-full p-2 text-dim transition-all duration-300 hover:rotate-90 hover:bg-surface2 hover:text-ink">
            <Icon name="close" size={16} />
          </button>
        </div>
        {children && <div className="z-scroll max-h-[62vh] px-6 py-5">{children}</div>}
        {footer && <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-line bg-surface2/60 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, desc, confirmLabel = 'Ya, lanjutkan', danger,
}: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; desc?: string; confirmLabel?: string; danger?: boolean }) {
  return (
    <Modal
      open={open} onClose={onClose} title={title} desc={desc} icon={danger ? 'alert' : 'info'} width={440}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button variant={danger ? 'danger' : 'primary'} icon={danger ? 'trash' : 'check'} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

/* ── DRAWER (panel samping) ───────────────────────────────────────── */
export function Drawer({
  open, onClose, title, desc, icon, children, footer, width = 520,
}: {
  open: boolean; onClose: () => void; title: string; desc?: string; icon?: string;
  children?: React.ReactNode; footer?: React.ReactNode; width?: number;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div className="z-anim-fade absolute inset-0 bg-[rgba(6,9,18,.6)] backdrop-blur-md" onClick={onClose} />
      <aside
        className={cx('absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-surface shadow-[var(--shadow-2)]',
          'rounded-l-[2rem] overflow-hidden')}
        style={{ maxWidth: width, animation: 'z-slide-down .32s cubic-bezier(.22,1,.36,1) both' }}
      >
        <div className="flex items-start gap-3.5 border-b border-line px-6 py-5">
          {icon && <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-brand/30 bg-brand/10 text-brand"><Icon name={icon} size={19} /></span>}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-extrabold tracking-tight text-ink">{title}</h3>
            {desc && <p className="mt-0.5 text-[13px] text-muted">{desc}</p>}
          </div>
          <button onClick={onClose} aria-label="Tutup" className="rounded-full p-2 text-dim transition-all duration-300 hover:rotate-90 hover:bg-surface2 hover:text-ink">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="z-scroll flex-1 px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2.5 border-t border-line bg-surface2/60 px-6 py-4">{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
}
