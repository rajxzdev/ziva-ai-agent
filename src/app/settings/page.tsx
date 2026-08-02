'use client';

import * as React from 'react';
import { useZiva, exportState, STORAGE_KEY } from '@/lib/store';
import { PROVIDERS } from '@/lib/providers';
import { useMounted } from '@/components/layout/ThemeSync';
import type { AccentId, ThemeMode } from '@/types';
import { Reveal } from '@/components/ui/Reveal';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch, Segmented, Badge, Textarea, Label } from '@/components/ui/Controls';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { Icon, ZivaMark } from '@/components/icons';
import { download, cx } from '@/lib/utils';

const ACCENTS: { id: AccentId; label: string; c1: string; c2: string }[] = [
  { id: 'aurora', label: 'Aurora', c1: '#7c5cff', c2: '#22d3ee' },
  { id: 'ember', label: 'Ember', c1: '#ff6a3d', c2: '#ffb020' },
  { id: 'mint', label: 'Mint', c1: '#10d9a0', c2: '#34d399' },
  { id: 'violet', label: 'Violet', c1: '#a855f7', c2: '#ec4899' },
  { id: 'ocean', label: 'Ocean', c1: '#3b82f6', c2: '#06b6d4' },
];

export default function SettingsPage() {
  const mounted = useMounted();
  const { settings, setSettings, importState, hardReset, roles, keys, history } = useZiva();
  const [askReset, setAskReset] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [raw, setRaw] = React.useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const bytes = mounted ? new Blob([localStorage.getItem(STORAGE_KEY) ?? '']).size : 0;
  const kb = (bytes / 1024).toFixed(1);

  const onFile = (f: File) => {
    const fr = new FileReader();
    fr.onload = () => {
      const res = importState(String(fr.result));
      res.ok ? toast.ok('Berhasil dipulihkan', res.message) : toast.err('Gagal memulihkan', res.message);
    };
    fr.readAsText(f);
  };

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <SectionHeader eyebrow="Preferensi" icon="sliders" title="Pengaturan"
          desc="Semua preferensi disimpan di perangkat ini. Tidak ada akun, tidak ada sinkronisasi cloud." />
      </Reveal>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Tampilan */}
        <Reveal>
          <Card className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-brand/30 bg-brand/10 text-brand"><Icon name="palette" size={18} /></span>
              <div>
                <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Tampilan</h3>
                <p className="text-[12px] text-muted">Tema, warna aksen, dan kepadatan visual.</p>
              </div>
            </div>

            <div>
              <Label icon="sun">Mode tema</Label>
              <Segmented<ThemeMode>
                value={settings.theme} onChange={(v) => setSettings({ theme: v })} full
                items={[{ value: 'light', label: 'Terang', icon: 'sun' }, { value: 'dark', label: 'Gelap', icon: 'moon' }, { value: 'system', label: 'Sistem', icon: 'monitor' }]}
              />
            </div>

            <div>
              <Label icon="spark">Warna aksen</Label>
              <div className="grid grid-cols-5 gap-2">
                {ACCENTS.map((a) => {
                  const on = settings.accent === a.id;
                  return (
                    <button key={a.id} onClick={() => setSettings({ accent: a.id })}
                      className={cx('group flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-300',
                        on ? 'border-brand/60 bg-brand/8' : 'border-line bg-surface2 hover:border-brand/40')}>
                      <span className="h-8 w-8 rounded-full transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `linear-gradient(135deg, ${a.c1}, ${a.c2})`, boxShadow: on ? `0 0 0 3px ${a.c1}33` : undefined }} />
                      <span className="text-[10.5px] font-bold text-ink">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-line pt-5">
              <Switch checked={settings.motion} onChange={(v) => setSettings({ motion: v })} label="Animasi & transisi" hint="Matikan bila kamu lebih nyaman tanpa gerakan." />
              <Switch checked={settings.dots} onChange={(v) => setSettings({ dots: v })} label="Dot mengalir di workflow" hint="Titik putih yang berjalan di sepanjang kabel antar agent." />
              <Switch checked={settings.glass} onChange={(v) => setSettings({ glass: v })} label="Efek kaca" hint="Latar buram pada panel melayang." />
            </div>
          </Card>
        </Reveal>

        {/* Data */}
        <Reveal delay={80} className="flex flex-col gap-6">
          <Card className="flex flex-col gap-5 p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-brand/30 bg-brand/10 text-brand"><Icon name="database" size={18} /></span>
              <div>
                <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Data lokal</h3>
                <p className="text-[12px] text-muted">Cadangkan atau pindahkan konfigurasi antar perangkat.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { k: 'Role', v: mounted ? roles.length : '—' },
                { k: 'Key', v: mounted ? Object.keys(keys).length : '—' },
                { k: 'Riwayat', v: mounted ? history.length : '—' },
                { k: 'Ukuran', v: mounted ? `${kb} KB` : '—' },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-line bg-surface2 px-2 py-3 text-center">
                  <p className="text-[15px] font-extrabold text-ink">{s.v}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-dim">{s.k}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="soft" icon="download" onClick={() => { download(`ziva-config-${new Date().toISOString().slice(0, 10)}.json`, exportState()); toast.ok('Konfigurasi diekspor'); }}>
                Ekspor JSON
              </Button>
              <Button variant="soft" icon="upload" onClick={() => fileRef.current?.click()}>Impor berkas</Button>
              <Button variant="ghost" icon="terminal" onClick={() => setImportOpen(true)}>Tempel JSON</Button>
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl border border-warn/30 bg-warn/10 p-3.5">
              <Icon name="alert" size={15} className="mt-0.5 shrink-0 text-warn" />
              <p className="text-[12px] leading-relaxed text-muted">Berkas ekspor <strong className="text-ink">berisi API key</strong> dalam bentuk teks biasa. Simpan di tempat aman dan jangan dibagikan.</p>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-err/30 bg-err/10 text-err"><Icon name="trash" size={18} /></span>
              <div>
                <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Zona berbahaya</h3>
                <p className="text-[12px] text-muted">Hapus seluruh jejak Ziva di perangkat ini.</p>
              </div>
            </div>
            <Button variant="danger" icon="trash" onClick={() => setAskReset(true)}>Hapus semua data</Button>
          </Card>

          <Card className="relative overflow-hidden p-6">
            <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl" style={{ background: 'radial-gradient(circle,var(--brand-1),transparent 70%)' }} />
            <div className="flex items-center gap-3">
              <ZivaMark size={40} />
              <div>
                <h3 className="text-[15px] font-extrabold tracking-tight text-ink">Ziva Agent AI</h3>
                <p className="text-[12px] text-muted">Versi 1.0.0 · Next.js · 100% klien</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="ok" icon="lock">Tanpa backend</Badge>
              <Badge tone="brand" icon="cpu">{PROVIDERS.length} provider</Badge>
              <Badge icon="layers">{roles.length} role</Badge>
            </div>
          </Card>
        </Reveal>
      </div>

      <Modal
        open={importOpen} onClose={() => setImportOpen(false)} icon="upload" width={620}
        title="Tempel konfigurasi" desc="Tempel isi berkas ekspor Ziva di bawah ini, lalu pulihkan."
        footer={
          <>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>Batal</Button>
            <Button variant="primary" icon="check" onClick={() => {
              const res = importState(raw);
              if (res.ok) { toast.ok('Berhasil dipulihkan', res.message); setImportOpen(false); setRaw(''); }
              else toast.err('Gagal memulihkan', res.message);
            }}>Pulihkan</Button>
          </>
        }
      >
        <Textarea rows={12} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder='{ "app": "ziva-agent-ai", ... }' className="z-mono text-[12px]" />
      </Modal>

      <ConfirmDialog
        open={askReset} onClose={() => setAskReset(false)}
        onConfirm={() => { hardReset(); toast.info('Semua data dihapus.', 'Ziva kembali ke kondisi awal.'); }}
        title="Hapus semua data Ziva?" desc="Role, API key, riwayat, dan preferensi akan hilang permanen dari perangkat ini." danger confirmLabel="Hapus semuanya"
      />
    </div>
  );
}
