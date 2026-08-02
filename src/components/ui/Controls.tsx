'use client';

import * as React from 'react';
import { cx, clamp } from '@/lib/utils';
import { Icon } from '@/components/icons';

/* ── SWITCH ───────────────────────────────────────────────────────── */
export function Switch({
  checked, onChange, label, hint, size = 'md', disabled,
}: { checked: boolean; onChange: (v: boolean) => void; label?: string; hint?: string; size?: 'sm' | 'md'; disabled?: boolean }) {
  const w = size === 'sm' ? 38 : 46;
  const h = size === 'sm' ? 22 : 26;
  const k = h - 6;
  const control = (
    <button
      type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx('relative shrink-0 rounded-full border transition-all duration-300 disabled:opacity-40', checked ? 'border-transparent' : 'border-line bg-surface3')}
      style={{ width: w, height: h, background: checked ? 'linear-gradient(120deg, var(--brand-1), var(--brand-2))' : undefined }}
    >
      <span
        className="absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-white shadow-md transition-all duration-300"
        style={{ width: k, height: k, left: checked ? w - k - 3 : 3 }}
      >
        {checked && <Icon name="check" size={k - 9} className="text-[var(--brand-1)]" strokeWidth={3} />}
      </span>
    </button>
  );
  if (!label) return control;
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{hint}</span>}
      </span>
      {control}
    </label>
  );
}

/* ── SLIDER (custom, bukan input[type=range]) ─────────────────────── */
export function Slider({
  value, onChange, min = 0, max = 1, step = 0.05, label, format,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; label?: string; format?: (v: number) => string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [drag, setDrag] = React.useState(false);
  const pct = ((value - min) / (max - min)) * 100;

  const setFromX = React.useCallback((clientX: number) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = clamp((clientX - r.left) / r.width, 0, 1);
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    onChange(Number(clamp(snapped, min, max).toFixed(4)));
  }, [min, max, step, onChange]);

  React.useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => setFromX(e.clientX);
    const up = () => setDrag(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [drag, setFromX]);

  return (
    <div>
      {label && (
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-semibold text-muted">{label}</span>
          <span className="z-mono text-xs font-bold text-brand">{format ? format(value) : value}</span>
        </div>
      )}
      <div
        ref={ref}
        onPointerDown={(e) => { setDrag(true); setFromX(e.clientX); }}
        role="slider" tabIndex={0}
        aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Number(clamp(value + step, min, max).toFixed(4))); }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Number(clamp(value - step, min, max).toFixed(4))); }
        }}
        className="group relative flex h-6 cursor-pointer touch-none items-center"
      >
        <span className="h-1.5 w-full rounded-full bg-surface3" />
        <span
          className="absolute left-0 h-1.5 rounded-full transition-[width] duration-75"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--brand-1), var(--brand-2))' }}
        />
        <span
          className={cx('absolute grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-[var(--brand-1)] shadow-md transition-transform duration-150', drag ? 'scale-125' : 'group-hover:scale-110')}
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── FIELD ────────────────────────────────────────────────────────── */
export function Label({ children, hint, icon }: { children: React.ReactNode; hint?: string; icon?: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      {icon && <Icon name={icon} size={13} className="text-dim" />}
      <span className="text-xs font-bold uppercase tracking-[.1em] text-dim">{children}</span>
      {hint && <span className="text-[11px] font-medium normal-case tracking-normal text-dim/80">· {hint}</span>}
    </div>
  );
}

export function Input({
  icon, className, right, mono, ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: string; right?: React.ReactNode; mono?: boolean }) {
  return (
    <div className={cx('flex h-12 items-center gap-2.5 rounded-2xl border border-line bg-surface2 px-4 transition-all duration-300 focus-within:border-brand/60 focus-within:z-ring-glow hover:border-brand/40', className)}>
      {icon && <Icon name={icon} size={16} className="shrink-0 text-dim" />}
      <input className={cx('min-w-0 flex-1 bg-transparent text-sm outline-none', mono && 'z-mono text-[13px]')} {...rest} />
      {right}
    </div>
  );
}

export function Textarea({
  className, rows = 5, ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cx(
        'z-scroll w-full resize-none rounded-3xl border border-line bg-surface2 px-4 py-3.5 text-sm leading-relaxed outline-none transition-all duration-300',
        'focus:border-brand/60 focus:z-ring-glow hover:border-brand/40',
        className,
      )}
      {...rest}
    />
  );
}

/* ── SEGMENTED / TABS ─────────────────────────────────────────────── */
export function Segmented<T extends string>({
  value, onChange, items, size = 'md', full,
}: { value: T; onChange: (v: T) => void; items: { value: T; label: string; icon?: string }[]; size?: 'sm' | 'md'; full?: boolean }) {
  return (
    <div className={cx('inline-flex items-center gap-1 rounded-full border border-line bg-surface2 p-1', full && 'w-full')}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value} type="button" onClick={() => onChange(it.value)}
            className={cx(
              'relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-full font-semibold transition-all duration-300',
              size === 'sm' ? 'h-8 px-3 text-[12px]' : 'h-10 px-4 text-[13px]',
              on ? 'text-white' : 'text-muted hover:text-ink',
            )}
            style={on ? { background: 'linear-gradient(120deg, var(--brand-1), var(--brand-2))', boxShadow: '0 6px 18px -8px var(--brand-1)' } : undefined}
          >
            {it.icon && <Icon name={it.icon} size={14} />}
            <span className="whitespace-nowrap">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── BADGE ────────────────────────────────────────────────────────── */
export function Badge({
  children, tone = 'neutral', icon, pulse,
}: { children: React.ReactNode; tone?: 'neutral' | 'ok' | 'warn' | 'err' | 'brand'; icon?: string; pulse?: boolean }) {
  const tones: Record<string, string> = {
    neutral: 'border-line bg-surface2 text-muted',
    ok: 'border-ok/30 bg-ok/10 text-ok',
    warn: 'border-warn/30 bg-warn/10 text-warn',
    err: 'border-err/30 bg-err/10 text-err',
    brand: 'border-brand/30 bg-brand/10 text-brand',
  };
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-tight', tones[tone])}>
      {pulse && <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-current"><span className="z-pulse-dot absolute inset-0 rounded-full" /></span>}
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* ── PROGRESS ─────────────────────────────────────────────────────── */
export function ProgressBar({ value, tone }: { value: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface3">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${clamp(value, 0, 100)}%`, background: tone ?? 'linear-gradient(90deg, var(--brand-1), var(--brand-2))' }}
      />
    </div>
  );
}

export function Ring({ value, size = 58, stroke = 5, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand-1)" />
            <stop offset="100%" stopColor="var(--brand-2)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringg)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (clamp(value, 0, 100) / 100) * c}
          style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <span className="absolute text-[11px] font-extrabold text-ink">{label ?? `${Math.round(value)}%`}</span>
    </div>
  );
}
