'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/icons';
import { AiLogo } from '@/components/icons/logos';
import type { ProviderId } from '@/types';

export interface Option {
  value: string;
  label: string;
  hint?: string;
  desc?: string;
  icon?: string;
  hue?: number;
  logo?: string;
  group?: string;
}

/* ── Popover ter-anchor (fixed) supaya tidak terpotong container ──── */
function useAnchor(open: boolean, ref: React.RefObject<HTMLElement | null>, panelH = 300) {
  const [box, setBox] = React.useState<{ left: number; top: number; width: number; up: boolean } | null>(null);
  React.useLayoutEffect(() => {
    if (!open) { setBox(null); return; }
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const up = spaceBelow < panelH + 24 && r.top > spaceBelow;
      setBox({ left: r.left, top: up ? r.top - 8 : r.bottom + 8, width: r.width, up });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [open, ref, panelH]);
  return box;
}

function Panel({
  box, onClose, children, anchorRef, maxH = 300,
}: {
  box: { left: number; top: number; width: number; up: boolean } | null;
  onClose: () => void;
  children: React.ReactNode;
  anchorRef: React.RefObject<HTMLElement | null>;
  maxH?: number;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [onClose, anchorRef]);

  if (!box || typeof document === 'undefined') return null;
  return createPortal(
    <div
      ref={panelRef}
      className="z-anim-in fixed z-[100] overflow-hidden rounded-3xl border border-line bg-surface p-1.5 shadow-[var(--shadow-2)] backdrop-blur-xl"
      style={{
        left: box.left,
        top: box.up ? undefined : box.top,
        bottom: box.up ? window.innerHeight - box.top : undefined,
        width: Math.max(box.width, 220),
        maxHeight: maxH,
        background: 'var(--glass)',
        transformOrigin: box.up ? 'bottom center' : 'top center',
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

function Row({
  opt, active, selected, onPick, onHover,
}: { opt: Option; active: boolean; selected: boolean; onPick: () => void; onHover: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      onMouseEnter={onHover}
      className={cx(
        'flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-colors duration-150',
        active ? 'bg-surface3' : 'bg-transparent',
      )}
    >
      {opt.logo ? (
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border"
          style={{
            borderColor: `hsl(${opt.hue ?? 260} 84% 62% / .3)`,
            background: `hsl(${opt.hue ?? 260} 84% 62% / .12)`,
          }}
        >
          <AiLogo provider={opt.logo as ProviderId} size={15} />
        </span>
      ) : opt.icon && (
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border"
          style={{
            borderColor: `hsl(${opt.hue ?? 260} 84% 62% / .3)`,
            background: `hsl(${opt.hue ?? 260} 84% 62% / .12)`,
            color: `hsl(${opt.hue ?? 260} 84% 62%)`,
          }}
        >
          <Icon name={opt.icon} size={14} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-ink">{opt.label}</span>
        {opt.desc ? (
          <span className="block truncate text-[10.5px] text-dim">{opt.desc}</span>
        ) : opt.hint ? (
          <span className="block truncate text-[11px] text-dim">{opt.hint}</span>
        ) : null}
      </span>
      {selected && <Icon name="check" size={15} className="shrink-0 text-brand" />}
    </button>
  );
}

/* ── SELECT ───────────────────────────────────────────────────────── */
export function Select({
  value, onChange, options, placeholder = 'Pilih...', size = 'md', searchable = false, className, disabled, leading,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  size?: 'sm' | 'md';
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
  leading?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const box = useAnchor(open, btnRef, 320);
  const cur = options.find((o) => o.value === value);

  const list = React.useMemo(() => {
    if (!q.trim()) return options;
    const s = q.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s) || o.hint?.toLowerCase().includes(s));
  }, [q, options]);

  React.useEffect(() => { if (!open) { setQ(''); setIdx(Math.max(0, options.findIndex((o) => o.value === value))); } }, [open, options, value]);

  const pick = (v: string) => { onChange(v); setOpen(false); };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); setOpen(true); return; }
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(list.length - 1, i + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    if (e.key === 'Enter') { e.preventDefault(); const o = list[idx]; if (o) pick(o.value); }
  };

  return (
    <div className={cx('relative', className)}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          'group flex w-full items-center gap-2.5 rounded-2xl border bg-surface2 text-left transition-all duration-300',
          'hover:border-brand/45 disabled:opacity-50',
          open ? 'border-brand/60 z-ring-glow' : 'border-line',
          size === 'sm' ? 'h-10 px-3' : 'h-12 px-4',
        )}
      >
        {leading}
        {cur?.logo && !leading ? (
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border"
            style={{
              borderColor: `hsl(${cur.hue ?? 260} 84% 62% / .3)`,
              background: `hsl(${cur.hue ?? 260} 84% 62% / .12)`,
            }}
          >
            <AiLogo provider={cur.logo as ProviderId} size={15} />
          </span>
        ) : cur?.icon && !leading && (
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border"
            style={{
              borderColor: `hsl(${cur.hue ?? 260} 84% 62% / .3)`,
              background: `hsl(${cur.hue ?? 260} 84% 62% / .12)`,
              color: `hsl(${cur.hue ?? 260} 84% 62%)`,
            }}
          >
            <Icon name={cur.icon} size={14} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className={cx('block truncate font-semibold', size === 'sm' ? 'text-[13px]' : 'text-sm', cur ? 'text-ink' : 'text-dim')}>
            {cur?.label ?? placeholder}
          </span>
          {cur?.hint && size !== 'sm' && <span className="block truncate text-[11px] text-dim">{cur.hint}</span>}
        </span>
        <Icon name="chevronDown" size={16} className={cx('shrink-0 text-dim transition-transform duration-300', open && 'rotate-180 text-brand')} />
      </button>

      {open && (
        <Panel box={box} onClose={() => setOpen(false)} anchorRef={btnRef} maxH={340}>
          {searchable && (
            <div className="sticky top-0 mb-1 flex items-center gap-2 rounded-2xl bg-surface2 px-3 py-2">
              <Icon name="search" size={14} className="text-dim" />
              <input
                autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }} onKeyDown={onKey}
                placeholder="Cari..."
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
          )}
          <div className="z-scroll max-h-[264px]">
            {list.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-dim">Tidak ada hasil.</p>}
            {list.map((o, i) => (
              <Row key={o.value} opt={o} active={i === idx} selected={o.value === value} onPick={() => pick(o.value)} onHover={() => setIdx(i)} />
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ── COMBOBOX: bisa ketik bebas atau pilih dari daftar ─────────────── */
export function Combobox({
  value, onChange, options, placeholder = 'Ketik atau pilih...', className, emptyHint,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  emptyHint?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [idx, setIdx] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const box = useAnchor(open, wrapRef, 300);

  React.useEffect(() => { setDraft(value); }, [value]);

  const list = React.useMemo(() => {
    const s = draft.trim().toLowerCase();
    if (!s) return options;
    return options.filter((o) => o.value.toLowerCase().includes(s) || o.label.toLowerCase().includes(s));
  }, [draft, options]);

  const exact = options.some((o) => o.value === draft.trim());
  const commit = (v: string) => { onChange(v.trim()); setDraft(v.trim()); setOpen(false); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setIdx((i) => Math.min(list.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && list[idx]) commit(list[idx].value);
      else if (draft.trim()) commit(draft);
    } else if (e.key === 'Escape') { setOpen(false); setDraft(value); }
  };

  return (
    <div ref={wrapRef} className={cx('relative', className)}>
      <div
        className={cx(
          'flex h-12 items-center gap-2 rounded-2xl border bg-surface2 px-4 transition-all duration-300',
          open ? 'border-brand/60 z-ring-glow' : 'border-line hover:border-brand/45',
        )}
      >
        <Icon name="cpu" size={16} className="shrink-0 text-dim" />
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setOpen(true); setIdx(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => { if (draft.trim() && draft.trim() !== value) onChange(draft.trim()); }}
          onKeyDown={onKey}
          placeholder={placeholder}
          spellCheck={false}
          className="z-mono min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none"
        />
        {draft && (
          <button type="button" onClick={() => { setDraft(''); onChange(''); inputRef.current?.focus(); }} className="shrink-0 rounded-full p-1 text-dim transition-colors hover:text-err" aria-label="Kosongkan">
            <Icon name="close" size={13} />
          </button>
        )}
        <button type="button" onClick={() => { setOpen((o) => !o); inputRef.current?.focus(); }} className="shrink-0 rounded-full p-1 text-dim transition-transform duration-300 hover:text-brand" aria-label="Buka daftar model">
          <Icon name="chevronDown" size={15} className={cx('transition-transform duration-300', open && 'rotate-180')} />
        </button>
      </div>

      {open && (
        <Panel box={box} onClose={() => setOpen(false)} anchorRef={wrapRef} maxH={320}>
          <div className="z-scroll max-h-[250px]">
            {!exact && draft.trim() && (
              <button
                type="button" onClick={() => commit(draft)}
                className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-surface3"
              >
                <span className="grid h-7 w-7 place-items-center rounded-xl border border-brand/30 bg-brand/10 text-brand"><Icon name="plus" size={14} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink">Pakai &ldquo;{draft.trim()}&rdquo;</span>
                  <span className="block text-[11px] text-dim">Model kustom / di luar daftar</span>
                </span>
              </button>
            )}
            {list.map((o, i) => (
              <Row key={o.value} opt={o} active={i === idx} selected={o.value === value} onPick={() => commit(o.value)} onHover={() => setIdx(i)} />
            ))}
            {list.length === 0 && !draft.trim() && (
              <p className="px-3 py-6 text-center text-[12px] leading-relaxed text-dim">{emptyHint ?? 'Provider ini tidak punya preset model. Ketik nama model manual.'}</p>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
