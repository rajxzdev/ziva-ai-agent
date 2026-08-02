'use client';

import * as React from 'react';
import Link from 'next/link';
import { PROVIDERS, getProvider, MODEL_DESC } from '@/lib/providers';
import { useZiva } from '@/lib/store';
import type { ProviderId, RoleConfig } from '@/types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge, Input } from './Controls';
import { Icon } from '@/components/icons';
import { AiLogo } from '@/components/icons/logos';
import { cx } from '@/lib/utils';

/**
 * Katalog pemilih AI untuk SATU role.
 * Langkah 1: pilih penyedia AI. Langkah 2: pilih model (atau ketik sendiri).
 */
export function AiPicker({
  open, onClose, role, onApply,
}: {
  open: boolean;
  onClose: () => void;
  role: RoleConfig | null;
  onApply: (provider: ProviderId, model: string) => void;
}) {
  const keys = useZiva((s) => s.keys);
  const [provider, setProvider] = React.useState<ProviderId>('openai');
  const [model, setModel] = React.useState('');
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    if (!open || !role) return;
    setProvider(role.provider);
    setModel(role.model);
    setQ('');
  }, [open, role]);

  const meta = getProvider(provider);
  const hasKey = !meta.requiresKey || Boolean(keys[provider]?.apiKey);

  const models = React.useMemo(() => {
    const base = [...meta.models];
    if (model && !base.includes(model)) base.unshift(model);
    const s = q.trim().toLowerCase();
    return s ? base.filter((m) => m.toLowerCase().includes(s)) : base;
  }, [meta.models, model, q]);

  const typed = q.trim();
  const showCustom = typed.length > 0 && !meta.models.includes(typed);

  const pickProvider = (id: ProviderId) => {
    setProvider(id);
    setModel(getProvider(id).models[0] ?? '');
    setQ('');
  };

  if (!role) return null;

  return (
    <Modal
      open={open} onClose={onClose} width={860}
      icon={role.icon}
      title={`Pilih AI untuk ${role.name}`}
      desc={`${role.code} · Role ini akan memanggil penyedia & model yang kamu tentukan di bawah.`}
      footer={
        <>
          <span className="mr-auto hidden items-center gap-2 text-[12px] text-muted sm:flex">
            <Icon name="arrowRight" size={13} className="text-brand" />
            Hasil:&nbsp;
            <span className="font-bold text-ink">{meta.name}</span>
            <span className="z-mono rounded-lg bg-surface3 px-2 py-0.5 text-[11px] font-bold text-ink">{model || '— belum ada model —'}</span>
          </span>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button variant="primary" icon="check" disabled={!model.trim()} onClick={() => { onApply(provider, model.trim()); onClose(); }}>
            Pakai AI ini
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,.46fr)_minmax(0,.54fr)]">
        {/* LANGKAH 1 — PENYEDIA */}
        <div className="min-w-0">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/15 text-[11px] font-extrabold text-brand">1</span>
            <span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-dim">Penyedia AI</span>
          </div>
          <div className="z-scroll grid max-h-[360px] grid-cols-1 gap-1.5 pr-1 sm:grid-cols-2">
            {PROVIDERS.map((p) => {
              const on = p.id === provider;
              const ready = !p.requiresKey || Boolean(keys[p.id]?.apiKey);
              return (
                <button
                  key={p.id} type="button" onClick={() => pickProvider(p.id)}
                  className={cx(
                    'flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-all duration-300',
                    on ? 'border-brand/60 bg-brand/8 z-ring-glow' : 'border-line bg-surface2 hover:border-brand/45 hover:-translate-y-[1px]',
                  )}
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
                    style={{ borderColor: `hsl(${p.hue} 84% 62% / .34)`, background: `hsl(${p.hue} 84% 62% / .13)` }}
                  >
                    <AiLogo provider={p.id} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-extrabold text-ink">{p.name}</span>
                    <span className="z-mono block truncate text-[10px] text-dim">{p.models.length ? `${p.models.length} model` : 'ketik manual'}</span>
                  </span>
                  {ready
                    ? <Icon name="lock" size={12} className="shrink-0 text-ok" />
                    : <Icon name="alert" size={12} className="shrink-0 text-warn" />}
                  {on && <Icon name="check" size={15} className="shrink-0 text-brand" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* LANGKAH 2 — MODEL */}
        <div className="min-w-0">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/15 text-[11px] font-extrabold text-brand">2</span>
            <span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-dim">Model {meta.name}</span>
          </div>

          <Input
            mono icon="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Cari preset atau ketik nama model sendiri..."
            className="mb-2"
          />

          <div className="z-scroll flex max-h-[286px] flex-col gap-1.5 pr-1">
            {showCustom && (
              <button
                type="button" onClick={() => { setModel(typed); setQ(''); }}
                className="flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand/8 p-2.5 text-left transition-all duration-300 hover:-translate-y-[1px]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-brand/30 bg-brand/12 text-brand"><Icon name="plus" size={14} /></span>
                <span className="min-w-0 flex-1">
                  <span className="z-mono block truncate text-[12.5px] font-extrabold text-ink">{typed}</span>
                  <span className="block text-[10.5px] text-dim">Pakai model kustom ini</span>
                </span>
              </button>
            )}

            {models.map((m) => {
              const on = m === model;
              return (
                <button
                  key={m} type="button" onClick={() => setModel(m)}
                  className={cx(
                    'flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-300',
                    on ? 'border-brand/60 bg-brand/8' : 'border-line bg-surface2 hover:border-brand/45 hover:-translate-y-[1px]',
                  )}
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border"
                    style={{ borderColor: `hsl(${meta.hue} 84% 62% / .3)`, background: `hsl(${meta.hue} 84% 62% / .12)` }}
                  >
                    <AiLogo provider={provider} size={16} />
                  </span>
                  <span className="z-mono min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold text-ink">{m}</span>
                    {MODEL_DESC[m] && <span className="block truncate text-[10.5px] text-dim">{MODEL_DESC[m]}</span>}
                  </span>
                  {on && <Icon name="check" size={15} className="shrink-0 text-brand" />}
                </button>
              );
            })}

            {models.length === 0 && !showCustom && (
              <p className="rounded-2xl border border-dashed border-line px-3 py-8 text-center text-[12px] leading-relaxed text-dim">
                Tidak ada preset yang cocok.<br />Ketik nama model di kolom atas untuk memakainya.
              </p>
            )}
          </div>

          {!hasKey && (
            <Link href="/keys" onClick={onClose} className="mt-3 flex items-center gap-2.5 rounded-2xl border border-warn/30 bg-warn/10 p-3">
              <Icon name="alert" size={15} className="shrink-0 text-warn" />
              <span className="flex-1 text-[11.5px] leading-relaxed text-muted">
                API key <strong className="text-ink">{meta.name}</strong> belum diisi. Tetap bisa dipilih, tapi role ini akan gagal saat mode live.
              </span>
              <Icon name="arrowRight" size={14} className="shrink-0 text-warn" />
            </Link>
          )}
          {hasKey && meta.requiresKey && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-ok/25 bg-ok/8 p-3">
              <Icon name="check" size={14} className="shrink-0 text-ok" />
              <span className="text-[11.5px] text-muted">API key <strong className="text-ink">{meta.name}</strong> sudah tersimpan — role ini siap jalan live.</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** Ringkasan AI yang sedang dipakai sebuah role + tombol buka katalog. */
export function AiSummary({
  role, onOpen, compact,
}: { role: RoleConfig; onOpen: () => void; compact?: boolean }) {
  const meta = getProvider(role.provider);
  const keys = useZiva((s) => s.keys);
  const ready = !meta.requiresKey || Boolean(keys[role.provider]?.apiKey);
  return (
    <button
      type="button" onClick={onOpen}
      className={cx(
        'group/ai flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 text-left transition-all duration-300 hover:border-brand/50 hover:-translate-y-[1px]',
        compact && 'p-2',
      )}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-transform duration-500 group-hover/ai:rotate-6"
        style={{ borderColor: `hsl(${meta.hue} 84% 62% / .34)`, background: `hsl(${meta.hue} 84% 62% / .13)` }}
      >
        <AiLogo provider={role.provider} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-extrabold text-ink">{meta.name}</span>
          <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', ready ? 'bg-ok' : 'bg-warn')} />
        </span>
        <span className="z-mono block truncate text-[10.5px] text-dim">{role.model || 'model belum dipilih'}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface2 px-2.5 py-1 text-[10.5px] font-bold text-muted transition-colors group-hover/ai:border-brand/45 group-hover/ai:text-brand">
        Ganti <Icon name="chevronRight" size={11} />
      </span>
    </button>
  );
}

export function AiBadge({ role }: { role: RoleConfig }) {
  const meta = getProvider(role.provider);
  return (
    <Badge tone="brand" icon="cpu">
      <span className="-ml-0.5 mr-1 inline-flex translate-y-[1px]"><AiLogo provider={role.provider} size={13} /></span>
      {meta.name} · {role.model || '—'}
    </Badge>
  );
}
