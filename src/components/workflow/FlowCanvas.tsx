'use client';

import * as React from 'react';
import type { RoleConfig, Edge, NodePos, StepStatus } from '@/types';
import { NODE_W, NODE_H, STAGE_LABELS } from '@/lib/roles';
import { Icon } from '@/components/icons';
import { cx, clamp } from '@/lib/utils';

export interface FlowProps {
  roles: RoleConfig[];
  edges: Edge[];
  positions: Record<string, NodePos>;
  statuses?: Record<string, StepStatus>;
  activeId?: string | null;
  interactive?: boolean;
  showDots?: boolean;
  height?: number;
  scale?: number;
  onSelect?: (id: string) => void;
  onMove?: (id: string, pos: NodePos) => void;
}

const STATUS_COLOR: Record<StepStatus, string> = {
  idle: 'var(--dim)',
  queued: 'var(--warn)',
  running: 'var(--brand-1)',
  done: 'var(--ok)',
  error: 'var(--err)',
  skipped: 'var(--dim)',
};

function bezier(a: NodePos, b: NodePos) {
  const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2;
  const x2 = b.x, y2 = b.y + NODE_H / 2;
  const dx = Math.max(70, Math.abs(x2 - x1) * 0.48);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

/** Dot putih yang mengalir di sepanjang kabel. */
function FlowDots({ d, live, count = 3, dur = 3.2 }: { d: string; live: boolean; count?: number; dur?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <g key={i} opacity={live ? 1 : 0.8}>
          <circle r={live ? 7.5 : 5.5} className={cx('z-dot-halo', live && 'z-dot-halo--live')} filter="url(#zblur)">
            <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} begin={`${(i * dur) / count}s`} />
          </circle>
          <circle r={live ? 3.2 : 2.5} className={cx('z-dot-core', live && 'z-dot-core--live')}>
            <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} begin={`${(i * dur) / count}s`} />
          </circle>
        </g>
      ))}
    </>
  );
}

export function FlowCanvas({
  roles, edges, positions, statuses = {}, activeId, interactive = true,
  showDots = true, height = 620, scale: scaleProp, onSelect, onMove,
}: FlowProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(scaleProp ?? (roles.length > 14 ? 0.72 : 1));
  const [dragId, setDragId] = React.useState<string | null>(null);
  const dragOff = React.useRef<NodePos>({ x: 0, y: 0 });
  const panRef = React.useRef<{ x: number; y: number; l: number; t: number } | null>(null);

  React.useEffect(() => { if (scaleProp !== undefined) setScale(scaleProp); }, [scaleProp]);

  const byId = React.useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);
  const pos = (id: string): NodePos => positions[id] ?? { x: 0, y: 0 };

  const bounds = React.useMemo(() => {
    const xs = roles.map((r) => pos(r.id).x);
    const ys = roles.map((r) => pos(r.id).y);
    return {
      w: Math.max(900, Math.max(...xs, 0) + NODE_W + 120),
      h: Math.max(560, Math.max(...ys, 0) + NODE_H + 120),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles, positions]);

  /* Drag node */
  React.useEffect(() => {
    if (!dragId) return;
    const move = (e: PointerEvent) => {
      const wrap = wrapRef.current; if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left + wrap.scrollLeft) / scale - dragOff.current.x;
      const y = (e.clientY - r.top + wrap.scrollTop) / scale - dragOff.current.y;
      onMove?.(dragId, { x: Math.round(clamp(x, 0, 4000)), y: Math.round(clamp(y, 0, 2600)) });
    };
    const up = () => setDragId(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [dragId, scale, onMove]);

  /* Pan background */
  const onPanStart = (e: React.PointerEvent) => {
    if (!interactive) return;
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    const wrap = wrapRef.current; if (!wrap) return;
    panRef.current = { x: e.clientX, y: e.clientY, l: wrap.scrollLeft, t: wrap.scrollTop };
  };
  const onPanMove = (e: React.PointerEvent) => {
    const p = panRef.current; const wrap = wrapRef.current;
    if (!p || !wrap) return;
    wrap.scrollLeft = p.l - (e.clientX - p.x);
    wrap.scrollTop = p.t - (e.clientY - p.y);
  };
  const onPanEnd = () => { panRef.current = null; };

  // Animated SVG motion becomes expensive with a large role graph. Keep it for focused flows only.
  const animateDots = showDots && edges.length <= 14;
  const stageHeaders = React.useMemo(() => Array.from(new Set(roles.map((role) => role.stage))).map((stage) => ({
    stage, x: Math.min(...roles.filter((role) => role.stage === stage).map((role) => pos(role.id).x)),
  })), [roles, positions]);

  const liveEdge = (e: Edge) =>
    statuses[e.from] === 'done' && (statuses[e.to] === 'running' || statuses[e.to] === 'done');

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-[2rem] border border-line bg-surface2">
      {/* Kontrol zoom */}
      {interactive && (
        <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5 rounded-2xl border border-line bg-[var(--glass)] p-1.5 backdrop-blur-xl">
          {[
            { icon: 'plus', label: 'Perbesar', act: () => setScale((s) => Number(clamp(s + 0.1, 0.5, 1.5).toFixed(2))) },
            { icon: 'minus', label: 'Perkecil', act: () => setScale((s) => Number(clamp(s - 0.1, 0.5, 1.5).toFixed(2))) },
            { icon: 'target', label: 'Reset zoom', act: () => setScale(1) },
          ].map((b) => (
            <button key={b.icon} onClick={b.act} aria-label={b.label} title={b.label}
              className="grid h-8 w-8 place-items-center rounded-xl text-dim transition-all duration-300 hover:bg-surface3 hover:text-brand">
              <Icon name={b.icon} size={15} />
            </button>
          ))}
          <span className="z-mono py-1 text-center text-[9.5px] font-bold text-dim">{Math.round(scale * 100)}%</span>
        </div>
      )}

      <div
        ref={wrapRef}
        onPointerDown={onPanStart}
        onPointerMove={onPanMove}
        onPointerUp={onPanEnd}
        onPointerLeave={onPanEnd}
        className={cx('z-scroll relative overflow-auto', interactive && 'cursor-grab active:cursor-grabbing')}
        style={{
          height,
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)',
          backgroundSize: `${26 * scale}px ${26 * scale}px`,
        }}
      >
        <div className="relative origin-top-left" style={{ width: bounds.w * scale, height: bounds.h * scale }}>
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: bounds.w, height: bounds.h, transform: `scale(${scale})` }}>
            {/* KABEL + DOT */}
            <svg className="pointer-events-none absolute inset-0" width={bounds.w} height={bounds.h}>
              <defs>
                <filter id="zblur" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="2.6" />
                </filter>
              </defs>
              {edges.map((e) => {
                const a = byId.get(e.from), b = byId.get(e.to);
                if (!a || !b) return null;
                const d = bezier(pos(e.from), pos(e.to));
                const live = liveEdge(e);
                const dim = !a.enabled || !b.enabled;
                return (
                  <g key={`${e.from}->${e.to}`} opacity={dim ? 0.25 : 1}>
                    <path d={d} className={cx('z-wire', live && 'z-wire--live')} strokeWidth={live ? 2.4 : 1.6} />
                    {animateDots && !dim && <FlowDots d={d} live={live} count={live ? 4 : 2} dur={live ? 2.1 : 4} />}
                  </g>
                );
              })}
            </svg>

            {/* Stage swim-lane labels make the large graph scannable at a glance. */}
            {stageHeaders.map(({ stage, x }) => (
              <div key={stage} className="pointer-events-none absolute top-3 z-10 flex items-center gap-2" style={{ left: x }}>
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /><span className="z-mono text-[9px] font-extrabold uppercase tracking-[.14em] text-dim">{STAGE_LABELS[stage]}</span>
              </div>
            ))}

            {/* NODE */}
            {roles.map((r) => {
              const p = pos(r.id);
              const st = statuses[r.id] ?? 'idle';
              const color = STATUS_COLOR[st];
              const on = activeId === r.id;
              return (
                <div
                  key={r.id}
                  data-node
                  onPointerDown={(e) => {
                    if (!interactive || !onMove) return;
                    e.stopPropagation();
                    const wrap = wrapRef.current; if (!wrap) return;
                    const rect = wrap.getBoundingClientRect();
                    dragOff.current = {
                      x: (e.clientX - rect.left + wrap.scrollLeft) / scale - p.x,
                      y: (e.clientY - rect.top + wrap.scrollTop) / scale - p.y,
                    };
                    setDragId(r.id);
                  }}
                  onClick={() => onSelect?.(r.id)}
                  className={cx(
                    'group absolute select-none rounded-[1.4rem] border bg-surface p-3 transition-[box-shadow,border-color,transform] duration-300',
                    interactive && 'cursor-grab active:cursor-grabbing',
                    dragId === r.id && 'z-30 scale-[1.03] shadow-[var(--shadow-2)]',
                    on ? 'border-brand/60 z-ring-glow' : 'border-line hover:border-brand/45 hover:shadow-[var(--shadow-2)]',
                    !r.enabled && 'opacity-45',
                  )}
                  style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}
                >
                  {st === 'running' && (
                    <span className="pointer-events-none absolute -inset-[3px] rounded-[1.55rem] border-2 opacity-70"
                      style={{ borderColor: 'var(--brand-1)', animation: 'z-blink 1.2s ease-in-out infinite' }} />
                  )}
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-transform duration-500 group-hover:rotate-6"
                      style={{ borderColor: `hsl(${r.hue} 84% 62% / .34)`, background: `hsl(${r.hue} 84% 62% / .13)`, color: `hsl(${r.hue} 84% 62%)` }}>
                      <Icon name={r.icon} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="z-mono text-[9px] font-bold tracking-wider text-dim">{r.code}</span>
                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color, boxShadow: st === 'running' ? `0 0 8px ${color}` : undefined }} />
                      </div>
                      <p className="truncate text-[12.5px] font-extrabold leading-tight tracking-tight text-ink">{r.name}</p>
                      <p className="z-mono truncate text-[9.5px] text-dim">{r.provider} · {r.model || '—'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-surface px-4 py-2.5 text-[11px] text-dim">
        {([['idle', 'Menunggu'], ['running', 'Berjalan'], ['done', 'Selesai'], ['error', 'Gagal']] as [StepStatus, string][]).map(([k, l]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[k] }} />{l}
          </span>
        ))}
        {interactive && <span className="ml-auto inline-flex items-center gap-1.5"><Icon name="drag" size={12} /> Geser node · seret latar untuk pan</span>}
      </div>
    </div>
  );
}
