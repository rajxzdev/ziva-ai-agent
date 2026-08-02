'use client';

import * as React from 'react';
import Link from 'next/link';
import { useZiva } from '@/lib/store';
import { useMounted } from '@/components/layout/ThemeSync';
import { getProvider } from '@/lib/providers';
import type { RunRecord } from '@/types';
import { Reveal } from '@/components/ui/Reveal';
import { Card, SectionHeader, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, ProgressBar, Segmented } from '@/components/ui/Controls';
import { Drawer, ConfirmDialog } from '@/components/ui/Modal';
import { Markdown } from '@/components/ui/Markdown';
import { toast } from '@/components/ui/Toast';
import { Icon } from '@/components/icons';
import { AiLogo } from '@/components/icons/logos';
import { fmtDate, fmtDur, relTime, download, copyText, cx } from '@/lib/utils';

export default function HistoryPage() {
  const mounted = useMounted();
  const { history, roles, removeRun, clearHistory } = useZiva();
  const [open, setOpen] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'done' | 'error' | 'sim'>('all');
  const [askClear, setAskClear] = React.useState(false);
  const [tab, setTab] = React.useState<string | null>(null);

  React.useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('run');
    if (r) setOpen(r);
  }, []);

  const list = history.filter((h) =>
    filter === 'all' ? true : filter === 'sim' ? h.mode === 'sim' : h.status === filter);

  const active = history.find((h) => h.id === open) ?? null;
  React.useEffect(() => { setTab(active?.steps.find((s) => s.output)?.roleId ?? null); }, [active]);

  const toMd = (h: RunRecord) =>
    `# Eksekusi Ziva — ${fmtDate(h.createdAt)}\n\n**Brief:** ${h.brief}\n\n` +
    h.steps.filter((s) => s.output).map((s) => `## ${roles.find((r) => r.id === s.roleId)?.name ?? s.roleId}\n\n${s.output}`).join('\n\n---\n\n');

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <SectionHeader
          eyebrow="Arsip" icon="clock" title="Riwayat eksekusi"
          desc="Empat puluh eksekusi terakhir tersimpan di perangkat ini. Buka salah satu untuk membaca kembali hasil tiap agent."
          right={mounted && history.length > 0 ? <Button variant="ghost" icon="trash" onClick={() => setAskClear(true)}>Kosongkan</Button> : undefined}
        />
      </Reveal>

      {mounted && history.length > 0 && (
        <Reveal delay={50}>
          <Card className="flex flex-wrap items-center gap-3 p-4" corners={false}>
            <Segmented value={filter} onChange={setFilter} size="sm" items={[
              { value: 'all', label: `Semua (${history.length})` },
              { value: 'done', label: 'Sukses' },
              { value: 'error', label: 'Gagal' },
              { value: 'sim', label: 'Simulasi' },
            ]} />
          </Card>
        </Reveal>
      )}

      {!mounted || history.length === 0 ? (
        <EmptyState
          icon="clock" title="Riwayat masih kosong"
          desc="Setiap kali kamu menjalankan pipeline, hasilnya diarsipkan otomatis di sini."
          action={<Link href="/run"><Button variant="primary" icon="play">Jalankan pipeline</Button></Link>}
        />
      ) : list.length === 0 ? (
        <EmptyState icon="filter" title="Tidak ada yang cocok" desc="Ganti filter untuk melihat entri lain." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((h, i) => {
            const ok = h.steps.filter((s) => s.status === 'done').length;
            const err = h.steps.filter((s) => s.status === 'error').length;
            return (
              <Reveal key={h.id} delay={(i % 4) * 60}>
                <Card className="flex h-full cursor-pointer flex-col gap-3 p-5" onClick={() => setOpen(h.id)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={h.status === 'done' ? 'ok' : h.status === 'error' ? 'err' : 'warn'} icon={h.status === 'done' ? 'check' : h.status === 'error' ? 'alert' : 'stop'}>{h.status}</Badge>
                    <Badge tone={h.mode === 'sim' ? 'warn' : 'brand'} icon={h.mode === 'sim' ? 'wand' : 'zap'}>{h.mode === 'sim' ? 'simulasi' : 'live'}</Badge>
                    <span className="ml-auto text-[11px] text-dim">{relTime(h.createdAt)}</span>
                  </div>
                  <p className="line-clamp-3 text-[13px] leading-relaxed text-muted">{h.brief}</p>
                  <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
                    <ProgressBar value={(ok / Math.max(1, h.steps.length)) * 100} />
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-dim">
                      <span className="font-bold text-ok">{ok} sukses</span>
                      {err > 0 && <span className="font-bold text-err">{err} gagal</span>}
                      <span>· {h.steps.length} agent</span>
                      <span className="ml-auto inline-flex items-center gap-1"><Icon name="clock" size={11} />{fmtDur(h.durationMs)}</span>
                    </div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}

      <Drawer
        open={Boolean(active)} onClose={() => setOpen(null)} icon="clock" width={720}
        title="Detail eksekusi" desc={active ? fmtDate(active.createdAt) : ''}
        footer={
          <>
            <Button variant="danger" icon="trash" onClick={() => { if (active) { removeRun(active.id); setOpen(null); toast.info('Entri dihapus.'); } }}>Hapus entri</Button>
            <Button variant="soft" icon="download" onClick={() => { if (active) { download(`ziva-run-${active.id}.md`, toMd(active), 'text/markdown'); toast.ok('Berkas diunduh'); } }}>Unduh .md</Button>
          </>
        }
      >
        {active && (
          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-line bg-surface2 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-dim">Brief</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{active.brief}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { k: 'Agent', v: active.steps.length },
                { k: 'Durasi', v: fmtDur(active.durationMs) },
                { k: 'Mode', v: active.mode === 'sim' ? 'Simulasi' : 'Live' },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-line bg-surface2 px-2 py-3">
                  <p className="text-[14px] font-extrabold text-ink">{s.v}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-dim">{s.k}</p>
                </div>
              ))}
            </div>

            <div className="z-scroll flex gap-1.5 overflow-x-auto pb-1">
              {active.steps.map((s) => {
                const r = roles.find((x) => x.id === s.roleId);
                const on = tab === s.roleId;
                return (
                  <button key={s.roleId} onClick={() => setTab(s.roleId)}
                    className={cx('inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-bold transition-all duration-300',
                      on ? 'border-brand/50 bg-brand/10 text-ink' : 'border-line bg-surface2 text-muted hover:text-ink')}>
                    <Icon name={r?.icon ?? 'dot'} size={13} style={{ color: `hsl(${r?.hue ?? 260} 84% 62%)` }} />
                    <span className="whitespace-nowrap">{r?.name ?? s.roleId}</span>
                    <span className={cx('h-1.5 w-1.5 rounded-full', s.status === 'done' ? 'bg-ok' : s.status === 'error' ? 'bg-err' : 'bg-dim')} />
                  </button>
                );
              })}
            </div>

            {(() => {
              const s = active.steps.find((x) => x.roleId === tab);
              if (!s) return <p className="py-10 text-center text-sm text-dim">Pilih agent untuk melihat hasilnya.</p>;
              if (s.status === 'error') {
                return (
                  <div className="flex items-start gap-3 rounded-3xl border border-err/30 bg-err/10 p-4">
                    <Icon name="alert" size={17} className="mt-0.5 shrink-0 text-err" />
                    <p className="z-mono text-[12px] leading-relaxed text-muted">{s.error}</p>
                  </div>
                );
              }
              return (
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-line pb-3">
                    <Badge tone="brand" icon="cpu">
                      <span className="-ml-0.5 mr-1 inline-flex translate-y-[1px]"><AiLogo provider={s.provider} size={13} /></span>
                      {getProvider(s.provider).name}
                    </Badge>
                    <Badge icon="spark">{s.model}</Badge>
                    <Badge icon="book">{s.chars} karakter</Badge>
                    <Button size="sm" variant="ghost" icon="copy" className="ml-auto"
                      onClick={async () => { (await copyText(s.output)) ? toast.ok('Disalin') : toast.err('Gagal menyalin'); }}>Salin</Button>
                  </div>
                  <Markdown text={s.output || '_Tidak ada keluaran._'} />
                </div>
              );
            })()}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={askClear} onClose={() => setAskClear(false)}
        onConfirm={() => { clearHistory(); toast.info('Riwayat dikosongkan.'); }}
        title="Kosongkan seluruh riwayat?" desc="Semua arsip eksekusi akan dihapus dari perangkat ini dan tidak bisa dikembalikan." danger confirmLabel="Kosongkan"
      />
    </div>
  );
}
