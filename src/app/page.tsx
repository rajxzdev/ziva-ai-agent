'use client';

import * as React from 'react';
import Link from 'next/link';
import { useZiva } from '@/lib/store';
import { useMounted } from '@/components/layout/ThemeSync';
import { getProvider, PROVIDERS } from '@/lib/providers';
import { planStages } from '@/lib/engine';
import { Reveal } from '@/components/ui/Reveal';
import { Card, SectionHeader, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, ProgressBar } from '@/components/ui/Controls';
import { FlowCanvas } from '@/components/workflow/FlowCanvas';
import { Icon, ZivaMark, CornerFrame } from '@/components/icons';
import { relTime, fmtDur } from '@/lib/utils';

const STEPS = [
  { icon: 'key', title: 'Tempel API key', desc: 'Masukkan kredensial provider milikmu. Disimpan hanya di browser, tidak pernah dikirim ke server mana pun.' },
  { icon: 'layers', title: 'Petakan role agent', desc: 'Tiap role bebas memakai provider & model berbeda — ketik manual atau pilih dari preset.' },
  { icon: 'nodes', title: 'Rangkai workflow', desc: 'Atur simpul dan sambungan. Dot putih menandai konteks yang mengalir antar agent.' },
  { icon: 'rocket', title: 'Jalankan & panen', desc: 'Runner mengeksekusi per tahap, menyalurkan output ke hilir, lalu merangkum jadi satu paket.' },
];

export default function DashboardPage() {
  const mounted = useMounted();
  const { roles, edges, positions, keys, history } = useZiva();

  const enabled = roles.filter((r) => r.enabled);
  const stages = React.useMemo(() => planStages(roles, edges), [roles, edges]);
  const nKeys = Object.keys(keys).length;
  const usedProviders = Array.from(new Set(roles.map((r) => r.provider)));
  const ready = usedProviders.filter((p) => !getProvider(p).requiresKey || keys[p]?.apiKey);
  const readiness = usedProviders.length ? Math.round((ready.length / usedProviders.length) * 100) : 0;
  const last = history[0];

  return (
    <div className="flex flex-col gap-12">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <Reveal as="section">
        <Card className="overflow-hidden p-0">
          <div className="relative grid grid-cols-1 gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:p-12">
            <span className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, var(--brand-1), transparent 68%)' }} />
            <span className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full opacity-25 blur-3xl"
              style={{ background: 'radial-gradient(circle, var(--brand-2), transparent 68%)' }} />

            <div className="relative">
              <span className="z-chip"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> Sistem aktif · v1.0</span>
              <h1 className="mt-5 text-balance text-[34px] font-extrabold leading-[1.06] tracking-tight text-ink sm:text-[46px]">
                {roles.length} agent, <span className="z-grad-text z-grad-move">satu alur pikir.</span>
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted">
                Ziva merutekan satu brief ke <strong className="text-ink">{roles.length} role spesialis</strong>. Tiap role boleh memakai
                provider dan model yang berbeda, dengan API key milikmu sendiri. Semua berjalan di browser —
                tanpa server, tanpa backend, tanpa data yang keluar diam-diam.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/run"><Button variant="primary" size="lg" icon="play">Jalankan Pipeline</Button></Link>
                <Link href="/keys"><Button variant="soft" size="lg" icon="key">Atur API Key</Button></Link>
                <Link href="/workflow"><Button variant="ghost" size="lg" iconRight="arrowRight">Lihat Workflow</Button></Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {PROVIDERS.slice(0, 8).map((p, i) => (
                  <span key={p.id} className="z-chip" style={{ animation: `z-fade-up .6s cubic-bezier(.22,1,.36,1) ${i * 60}ms both` }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(${p.hue} 84% 60%)` }} />
                    {p.name}
                  </span>
                ))}
                <span className="z-chip">+{PROVIDERS.length - 8} lagi</span>
              </div>
            </div>

            {/* Orbit visual */}
            <div className="relative grid min-h-[280px] place-items-center">
              <div className="relative h-[260px] w-[260px]">
                <span className="absolute inset-0 rounded-full border border-line" />
                <span className="absolute inset-8 rounded-full border border-line" />
                <span className="absolute inset-16 rounded-full border border-dashed border-line" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-20 w-20 place-items-center rounded-[1.6rem] border border-brand/40 bg-surface z-ring-glow">
                    <ZivaMark size={44} />
                  </span>
                </span>
                {roles.map((r, i) => {
                  const a = (i / roles.length) * Math.PI * 2 - Math.PI / 2;
                  const rad = 118;
                  return (
                    <span
                      key={r.id}
                      className="absolute grid h-10 w-10 place-items-center rounded-2xl border bg-surface transition-transform duration-500 hover:scale-125"
                      style={{
                        left: `calc(50% + ${Math.cos(a) * rad}px - 20px)`,
                        top: `calc(50% + ${Math.sin(a) * rad}px - 20px)`,
                        borderColor: `hsl(${r.hue} 84% 62% / .34)`,
                        color: `hsl(${r.hue} 84% 62%)`,
                        animation: `z-float ${5 + (i % 4)}s ease-in-out ${i * 180}ms infinite`,
                      }}
                      title={r.name}
                    >
                      <Icon name={r.icon} size={16} />
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Role aktif', value: mounted ? `${enabled.length}/${roles.length}` : '—', sub: `${stages.length} tahap eksekusi`, icon: 'layers', hue: 265 },
          { label: 'Provider terhubung', value: mounted ? nKeys : '—', sub: `${usedProviders.length} provider dipakai role`, icon: 'key', hue: 165 },
          { label: 'Kesiapan sistem', value: mounted ? `${readiness}%` : '—', sub: readiness === 100 ? 'Semua key tersedia' : 'Sebagian key belum diisi', icon: 'shield', hue: 200 },
          { label: 'Total eksekusi', value: mounted ? history.length : '—', sub: last ? `Terakhir ${relTime(last.createdAt)}` : 'Belum pernah dijalankan', icon: 'clock', hue: 30 },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 80}><StatCard {...s} /></Reveal>
        ))}
      </section>

      {/* ── PREVIEW WORKFLOW ─────────────────────────────────── */}
      <Reveal as="section" className="flex flex-col gap-5">
        <SectionHeader
          eyebrow="Peta alur" icon="nodes" title="Workflow multi-agent"
          desc="Konteks mengalir dari kiri ke kanan. Titik putih yang bergerak menandakan penyaluran hasil antar agent."
          right={<Link href="/workflow"><Button variant="soft" iconRight="arrowRight">Buka editor</Button></Link>}
        />
        <FlowCanvas roles={roles} edges={edges} positions={positions} interactive={false} height={380} scale={0.62} />
      </Reveal>

      {/* ── CARA KERJA ───────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <Reveal>
          <SectionHeader eyebrow="Alur pakai" icon="wand" title="Empat langkah dari brief ke hasil"
            desc="Tidak ada proses tersembunyi. Semua tahap terlihat dan bisa kamu ubah." />
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <Card className="h-full p-6">
                <span className="z-mono text-[11px] font-bold text-dim">0{i + 1}</span>
                <span className="mt-3 grid h-12 w-12 place-items-center rounded-2xl border border-brand/30 bg-brand/10 text-brand transition-transform duration-500 group-hover:-translate-y-1">
                  <Icon name={s.icon} size={20} />
                </span>
                <h3 className="mt-4 text-[15px] font-extrabold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ROLE + AKTIVITAS ─────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <Reveal className="flex min-w-0 flex-col gap-5">
          <SectionHeader eyebrow="Kru agent" icon="layers" title={`${roles.length} role, satu alur pikir`}
            desc="Klik role mana pun untuk memilih penyedia AI dan modelnya sendiri-sendiri."
            right={<Link href="/roles"><Button variant="soft" size="sm" iconRight="arrowRight">Konfigurasi</Button></Link>} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {roles.map((r, i) => (
              <Link key={r.id} href={`/roles?pick=${r.id}`} style={{ animation: `z-fade-up .6s cubic-bezier(.22,1,.36,1) ${i * 45}ms both` }}>
                <Card className="flex h-full items-center gap-3 p-4" hue={r.hue} corners={false}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border transition-transform duration-500 group-hover:rotate-6"
                    style={{ borderColor: `hsl(${r.hue} 84% 62% / .32)`, background: `hsl(${r.hue} 84% 62% / .12)`, color: `hsl(${r.hue} 84% 62%)` }}>
                    <Icon name={r.icon} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="z-mono text-[10px] font-bold text-dim">{r.code}</span>
                      {!r.enabled && <Badge tone="warn">nonaktif</Badge>}
                    </span>
                    <span className="block truncate text-[13.5px] font-extrabold tracking-tight text-ink">{r.name}</span>
                    <span className="z-mono block truncate text-[10.5px] text-dim">{mounted ? `${getProvider(r.provider).name} · ${r.model}` : '—'}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface2 px-2.5 py-1 text-[10.5px] font-bold text-muted transition-all duration-300 group-hover:border-brand/45 group-hover:text-brand">
                    Pilih AI <Icon name="chevronRight" size={11} />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120} className="flex min-w-0 flex-col gap-5">
          <SectionHeader eyebrow="Aktivitas" icon="clock" title="Eksekusi terakhir" />
          <Card className="p-5">
            {!mounted || history.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-3xl border border-line bg-surface2 text-brand z-float"><Icon name="pulse" size={22} /></span>
                <p className="text-sm font-bold text-ink">Belum ada eksekusi</p>
                <p className="max-w-[240px] text-xs leading-relaxed text-muted">Jalankan pipeline pertamamu untuk melihat jejak kerja tiap agent di sini.</p>
                <Link href="/run"><Button size="sm" variant="primary" icon="play">Mulai sekarang</Button></Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {history.slice(0, 5).map((h) => {
                  const ok = h.steps.filter((s) => s.status === 'done').length;
                  return (
                    <li key={h.id}>
                      <Link href={`/history?run=${h.id}`} className="block rounded-2xl border border-line bg-surface2 p-3.5 transition-all duration-300 hover:border-brand/45 hover:-translate-y-[2px]">
                        <div className="flex items-center gap-2">
                          <Badge tone={h.status === 'done' ? 'ok' : h.status === 'error' ? 'err' : 'warn'}>{h.status}</Badge>
                          <Badge tone={h.mode === 'sim' ? 'warn' : 'brand'}>{h.mode === 'sim' ? 'simulasi' : 'live'}</Badge>
                          <span className="ml-auto text-[11px] text-dim">{relTime(h.createdAt)}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{h.brief}</p>
                        <div className="mt-2.5"><ProgressBar value={(ok / Math.max(1, h.steps.length)) * 100} /></div>
                        <p className="mt-1.5 text-[10.5px] text-dim">{ok}/{h.steps.length} agent · {fmtDur(h.durationMs)}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="relative overflow-hidden p-6">
            <CornerFrame />
            <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl" style={{ background: 'radial-gradient(circle,var(--brand-2),transparent 70%)' }} />
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-ok/30 bg-ok/10 text-ok"><Icon name="shield" size={18} /></span>
            <h3 className="mt-4 text-[15px] font-extrabold tracking-tight text-ink">Privasi by design</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Tidak ada API route, tidak ada database. Permintaan dikirim langsung dari browser ke provider pilihanmu,
              dan key tersimpan di <code className="z-mono rounded-md bg-surface3 px-1.5 py-0.5 text-[11px]">localStorage</code> perangkat ini.
            </p>
            <Link href="/settings" className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand transition-transform duration-300 hover:translate-x-1">
              Kelola data lokal <Icon name="arrowRight" size={14} />
            </Link>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
