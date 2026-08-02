'use client';

import * as React from 'react';
import Link from 'next/link';
import { useZiva } from '@/lib/store';
import { useMounted } from '@/components/layout/ThemeSync';
import { planStages } from '@/lib/engine';
import { getProvider } from '@/lib/providers';
import { STAGE_LABELS } from '@/lib/roles';
import { Reveal } from '@/components/ui/Reveal';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch, Badge } from '@/components/ui/Controls';
import { Select, type Option } from '@/components/ui/Select';
import { FlowCanvas } from '@/components/workflow/FlowCanvas';
import { toast } from '@/components/ui/Toast';
import { AiPicker, AiSummary } from '@/components/ui/AiPicker';
import { Icon } from '@/components/icons';

export default function WorkflowPage() {
  const mounted = useMounted();
  const { roles, edges, positions, settings, setPosition, resetPositions, toggleEdge, toggleRole, setSettings, updateRole } = useZiva();
  const [sel, setSel] = React.useState<string | null>(null);
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const stages = React.useMemo(() => planStages(roles, edges), [roles, edges]);
  const active = roles.find((r) => r.id === sel) ?? null;
  const roleOpts: Option[] = roles.map((r) => ({ value: r.id, label: r.name, hint: r.code, icon: r.icon, hue: r.hue }));

  const upstream = active ? edges.filter((e) => e.to === active.id) : [];
  const downstream = active ? edges.filter((e) => e.from === active.id) : [];

  const addEdge = () => {
    if (!from || !to || from === to) { toast.warn('Koneksi tidak valid', 'Pilih dua role yang berbeda.'); return; }
    if (edges.some((e) => e.from === from && e.to === to)) { toast.warn('Koneksi sudah ada'); return; }
    // cegah siklus sederhana
    const reach = (a: string, b: string, seen = new Set<string>()): boolean => {
      if (a === b) return true;
      if (seen.has(a)) return false;
      seen.add(a);
      return edges.filter((e) => e.from === a).some((e) => reach(e.to, b, seen));
    };
    if (reach(to, from)) { toast.err('Siklus terdeteksi', 'Koneksi ini akan membuat alur berputar tanpa akhir.'); return; }
    toggleEdge(from, to);
    toast.ok('Koneksi ditambahkan', `${roles.find((r) => r.id === from)?.name} → ${roles.find((r) => r.id === to)?.name}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <SectionHeader
          eyebrow="Peta alur" icon="nodes" title="Editor workflow"
          desc="Seret simpul untuk menata ulang, dan atur sambungan konteks antar agent. Titik putih yang bergerak menggambarkan hasil yang mengalir ke hilir."
          right={
            <div className="flex flex-wrap gap-2">
              <Button variant="soft" icon="target" onClick={() => { resetPositions(); toast.info('Tata letak dikembalikan.'); }}>Rapikan</Button>
              <Link href="/run"><Button variant="primary" icon="play">Jalankan</Button></Link>
            </div>
          }
        />
      </Reveal>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.5fr)]">
        <Reveal className="flex min-w-0 flex-col gap-4">
          <FlowCanvas
            roles={roles} edges={edges} positions={positions}
            activeId={sel} showDots={settings.dots} height={640}
            onSelect={setSel} onMove={setPosition}
          />
          <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4" corners={false}>
            <Switch checked={settings.dots} onChange={(v) => setSettings({ dots: v })} size="sm" label="Animasi dot" />
            <span className="hidden h-6 w-px bg-line sm:block" />
            <div className="flex flex-wrap items-center gap-2">
              <Badge icon="nodes">{roles.filter((r) => r.enabled).length} node aktif</Badge>
              <Badge icon="link">{edges.length} koneksi</Badge>
              <Badge icon="layers">{stages.length} tahap</Badge>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={100} className="flex min-w-0 flex-col gap-5">
          {/* Detail node */}
          <Card className="p-5">
            {!active ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-3xl border border-line bg-surface2 text-brand z-float"><Icon name="target" size={22} /></span>
                <p className="text-sm font-bold text-ink">Pilih sebuah node</p>
                <p className="max-w-[220px] text-xs leading-relaxed text-muted">Klik salah satu simpul di kanvas untuk melihat detail dan sambungannya.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border"
                    style={{ borderColor: `hsl(${active.hue} 84% 62% / .32)`, background: `hsl(${active.hue} 84% 62% / .12)`, color: `hsl(${active.hue} 84% 62%)` }}>
                    <Icon name={active.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="z-mono text-[10px] font-bold text-dim">{active.code} · {STAGE_LABELS[active.stage]}</span>
                    <h3 className="truncate text-[16px] font-extrabold tracking-tight text-ink">{active.name}</h3>
                    <p className="z-mono truncate text-[11px] text-dim">{mounted ? getProvider(active.provider).vendor : '—'}</p>
                  </div>
                </div>
                <p className="text-[12.5px] leading-relaxed text-muted">{active.tagline}</p>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-dim">
                    <Icon name="cpu" size={11} /> Mesin AI role ini
                  </p>
                  <AiSummary role={active} onOpen={() => setPickerOpen(true)} />
                </div>
                <Switch checked={active.enabled} onChange={() => toggleRole(active.id)} label="Aktif dalam pipeline" size="sm" />

                <div className="grid grid-cols-1 gap-3">
                  <ConnList title="Masukan" icon="download" items={upstream.map((e) => ({ id: e.from, label: roles.find((r) => r.id === e.from)?.name ?? e.from }))} onRemove={(id) => toggleEdge(id, active.id)} />
                  <ConnList title="Keluaran" icon="upload" items={downstream.map((e) => ({ id: e.to, label: roles.find((r) => r.id === e.to)?.name ?? e.to }))} onRemove={(id) => toggleEdge(active.id, id)} />
                </div>

                <Link href={`/roles?focus=${active.id}`}>
                  <Button size="sm" variant="soft" icon="sliders" full>Konfigurasi role</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Tambah koneksi */}
          <Card className="flex flex-col gap-3 p-5">
            <h3 className="flex items-center gap-2 text-[13px] font-extrabold tracking-tight text-ink">
              <Icon name="link" size={15} className="text-brand" /> Tambah koneksi
            </h3>
            <Select value={from} onChange={setFrom} options={roleOpts} placeholder="Dari role..." size="sm" searchable />
            <div className="flex justify-center text-dim"><Icon name="chevronDown" size={16} /></div>
            <Select value={to} onChange={setTo} options={roleOpts} placeholder="Ke role..." size="sm" searchable />
            <Button size="sm" variant="primary" icon="plus" full onClick={addEdge}>Sambungkan</Button>
          </Card>

          {/* Rencana eksekusi */}
          <Card className="p-5">
            <h3 className="flex items-center gap-2 text-[13px] font-extrabold tracking-tight text-ink">
              <Icon name="layers" size={15} className="text-brand" /> Rencana eksekusi
            </h3>
            <ol className="mt-3 flex flex-col gap-2.5">
              {stages.map((layer, i) => (
                <li key={i} className="rounded-2xl border border-line bg-surface2 p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-dim">Tahap {i + 1}{layer.length > 1 ? ' · paralel' : ''}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {layer.map((id) => {
                      const r = roles.find((x) => x.id === id);
                      return (
                        <span key={id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-1 text-[11px] font-semibold text-ink">
                          <Icon name={r?.icon ?? 'dot'} size={11} style={{ color: `hsl(${r?.hue ?? 260} 84% 62%)` }} />
                          {r?.name ?? id}
                        </span>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </Reveal>
      </div>
      <AiPicker
        open={pickerOpen} onClose={() => setPickerOpen(false)} role={active}
        onApply={(provider, model) => {
          if (!active) return;
          updateRole(active.id, { provider, model });
          toast.ok(`${active.name} sekarang pakai ${getProvider(provider).name}`, `Model: ${model}`);
        }}
      />
    </div>
  );
}

function ConnList({
  title, icon, items, onRemove,
}: { title: string; icon: string; items: { id: string; label: string }[]; onRemove: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-line bg-surface2 p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-dim">
        <Icon name={icon} size={11} /> {title} ({items.length})
      </p>
      {items.length === 0 ? (
        <p className="mt-1.5 text-[11.5px] text-dim">Tidak ada.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-2 rounded-xl bg-surface px-2.5 py-1.5">
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink">{it.label}</span>
              <button onClick={() => onRemove(it.id)} aria-label="Putuskan" className="rounded-full p-1 text-dim transition-colors hover:text-err">
                <Icon name="close" size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
