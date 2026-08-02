'use client';

import * as React from 'react';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/icons';

type Variant = 'primary' | 'ghost' | 'soft' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  full?: boolean;
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-full',
  md: 'h-11 px-5 text-sm gap-2 rounded-full',
  lg: 'h-13 px-7 text-[15px] gap-2.5 rounded-full',
  icon: 'h-10 w-10 rounded-full justify-center',
};

export function Button({
  variant = 'soft', size = 'md', icon, iconRight, loading, full,
  className, children, disabled, ...rest
}: ButtonProps) {
  const base =
    'relative inline-flex select-none items-center justify-center font-semibold tracking-tight ' +
    'transition-all duration-300 active:scale-[.97] disabled:pointer-events-none disabled:opacity-45 overflow-hidden';

  const variants: Record<Variant, string> = {
    primary: 'text-white shadow-[0_10px_30px_-12px_var(--brand-1)] hover:shadow-[0_16px_40px_-12px_var(--brand-1)] hover:-translate-y-[1px]',
    soft: 'bg-surface2 text-ink border border-line hover:border-brand/45 hover:bg-surface3 hover:-translate-y-[1px]',
    outline: 'bg-transparent text-ink border border-line hover:border-brand/60 hover:bg-surface2',
    ghost: 'bg-transparent text-muted hover:text-ink hover:bg-surface2',
    danger: 'bg-transparent text-err border border-err/35 hover:bg-err/10',
  };

  return (
    <button
      className={cx(base, sizes[size], variants[variant], full && 'w-full', className)}
      style={variant === 'primary'
        ? { background: 'linear-gradient(120deg, var(--brand-1), var(--brand-2))' }
        : undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {variant === 'primary' && (
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{ background: 'linear-gradient(120deg, var(--brand-2), var(--brand-1))' }} />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">
        {loading ? <Icon name="refresh" size={size === 'sm' ? 15 : 17} className="z-spin" />
          : icon ? <Icon name={icon} size={size === 'sm' ? 15 : 17} /> : null}
        {children}
        {iconRight && !loading ? <Icon name={iconRight} size={size === 'sm' ? 15 : 17} /> : null}
      </span>
    </button>
  );
}

export function IconButton({ label, ...p }: ButtonProps & { label: string }) {
  return (
    <span className="group/ib relative inline-flex">
      <Button size="icon" aria-label={label} {...p} />
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-muted opacity-0 shadow-[var(--shadow-1)] transition-all duration-200 group-hover/ib:opacity-100">
        {label}
      </span>
    </span>
  );
}
