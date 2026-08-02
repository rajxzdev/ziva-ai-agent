'use client';

import * as React from 'react';
import { cx } from '@/lib/utils';
import { CornerFrame, Icon } from '@/components/icons';

export function Card({
  className, children, corners = true, glass = false, hairline = true, hue,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { corners?: boolean; glass?: boolean; hairline?: boolean; hue?: number }) {
  return (
    <div
      className={cx('z-card group', glass && 'z-card--glass', className)}
      style={hue !== undefined ? ({ ['--brand-1' as string]: `hsl(${hue} 84% 62%)` } as React.CSSProperties) : undefined}
      {...rest}
    >
      {hairline && <span className="z-hairline" />}
      {corners && <CornerFrame />}
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow, title, desc, icon, right, className,
}: { eyebrow?: string; title: string; desc?: string; icon?: string; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cx('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <span className="z-chip mb-3">
            {icon && <Icon name={icon} size={13} />}
            {eyebrow}
          </span>
        )}
        <h2 className="text-balance text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h2>
        {desc && <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export function StatCard({
  label, value, sub, icon, hue = 260, delay = 0,
}: { label: string; value: React.ReactNode; sub?: string; icon: string; hue?: number; delay?: number }) {
  return (
    <Card className="overflow-hidden p-5" hue={hue}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-dim">{label}</p>
          <p className="mt-2 truncate text-[26px] font-extrabold leading-none tracking-tight text-ink">{value}</p>
          {sub && <p className="mt-2 truncate text-xs text-muted">{sub}</p>}
        </div>
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
          style={{
            borderColor: `hsl(${hue} 84% 62% / .3)`,
            background: `hsl(${hue} 84% 62% / .12)`,
            color: `hsl(${hue} 84% 62%)`,
            animationDelay: `${delay}ms`,
          }}
        >
          <Icon name={icon} size={19} />
        </span>
      </div>
    </Card>
  );
}

export function EmptyState({ icon = 'spark', title, desc, action }: { icon?: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-4xl border border-dashed border-line bg-surface2/50 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-3xl border border-line bg-surface text-brand z-float">
        <Icon name={icon} size={24} />
      </span>
      <p className="text-base font-bold text-ink">{title}</p>
      {desc && <p className="max-w-sm text-sm text-muted">{desc}</p>}
      {action}
    </div>
  );
}
