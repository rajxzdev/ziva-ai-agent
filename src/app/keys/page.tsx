'use client';

import * as React from 'react';
import { useZiva } from '@/lib/store';
import { useMounted } from '@/components/layout/ThemeSync';
import { PROVIDERS, getProvider, MODEL_DESC } from '@/lib/providers';
import { testConnection } from '@/lib/engine';
import type { ProviderId, ProviderMeta } from '@/types';
import { Reveal } from '@/components/ui/Reveal';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, Badge, Segmented } from '@/components/ui/Controls';
import { Combobox } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { Icon } from '@/components/icons';
import { AiLogo } from '@/components/icons/logos';
import { maskKey, relTime } from '@/lib/utils';

export default function KeysPage() {
  const mounted = useMounted();
  const { keys, roles, saveKey, removeKey, markKey } = useZiva();
  const [filter, setFilter] = React.useState<'all' | 'set' | 'empty'>('all');
  const [askDelete, setAskDelete] = React.useState<ProviderId | null>(null);

  const usage = React.useMemo(() => {
    const m: Record<string, number> = {};
    roles.forEach((r) => { m[r.provider] = (m[r.provider] ?? 0) + 1; });
    return m;
  }, [roles]);

  const list = PROVIDERS.filter((p) => {
    if (!mounted || filter === 'all') return true;
    const has = Boolean(keys[p.id]?.apiKey || keys[p.id]?.baseUrl);
    return filter === 'set' ? has : !has;
  });

  const nSet = mounted ? Object.keys(keys).length : 0;

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <SectionHeader
          eyebrow="Kredensial" icon="key" title="API key milikmu sendiri"
          desc="Ziva tidak punya server. Key yang kamu tempel disimpan di localStorage perangkat ini dan dikirim langsung dari browser ke provider yang bersangkutan."
          right={<Badge tone={nSet > 0 ? 'ok' : 'warn'} icon={nSet > 0 ? 'lock' : 'alert'}>{nSet} dari {PROVIDERS.length} terisi</Badge>}
        />
      </Reveal>

      <Reveal delay={60}>
        <Card className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center" corners={false}>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-ok/30 bg-ok/10 text-ok"><Icon name="shield" size={18} /></span>
            <p className="max-w-2xl text-[12.5px] leading-relaxed text-muted">
              <strong className="text-ink">Catatan keamanan.</strong> Karena aplikasi ini murni sisi-klien, key ikut terlihat pada lalu lintas jaringan browser.
              Pakailah key dengan kuota/izin terbatas, dan hindari memakainya di komputer bersama. Kamu bisa menghapus semua data kapan saja lewat halaman Pengaturan.
            </p>
          </div>
          <div className="lg:ml-auto">
            <Segmented value={filter} onChange={setFilter} size="sm" items={[
              { value: 'all', label: 'Semua' }, { value: 'set', label: 'Terisi' }, { value: 'empty', label: 'Kosong' },
            ]} />
          </div>
        </Card>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {list.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 60}>
            <ProviderKeyCard
              meta={p} mounted={mounted}
              used={usage[p.id] ?? 0}
              entry={keys[p.id]}
              defaultModel={roles.find((r) => r.provider === p.id)?.model ?? p.models[0] ?? ''}
              onSave={(apiKey, baseUrl) => { saveKey({ provider: p.id, apiKey, baseUrl, updatedAt: Date.now(), verified: 'unknown' }); toast.ok(`${p.name} tersimpan`, 'Key hanya tersimpan di browser ini.'); }}
              onDelete={() => setAskDelete(p.id)}
              onVerified={(v) => markKey(p.id, v)}
            />
          </Reveal>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(askDelete)} onClose={() => setAskDelete(null)}
        onConfirm={() => { if (askDelete) { removeKey(askDelete); toast.info('Key dihapus dari perangkat ini.'); } }}
        title="Hapus API key?" desc="Key akan dihapus permanen dari localStorage browser ini." danger confirmLabel="Hapus key"
      />
    </div>
  );
}

function ProviderKeyCard({
  meta, entry, used, mounted, defaultModel, onSave, onDelete, onVerified,
}: {
  meta: ProviderMeta;
  entry?: { apiKey: string; baseUrl?: string; updatedAt: number; verified?: 'unknown' | 'ok' | 'fail' };
  used: number; mounted: boolean; defaultModel: string;
  onSave: (apiKey: string, baseUrl?: string) => void;
  onDelete: () => void;
  onVerified: (v: 'ok' | 'fail') => void;
}) {
  const [val, setVal] = React.useState('');
  const [base, setBase] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [model, setModel] = React.useState(defaultModel);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    setVal(entry?.apiKey ?? '');
    setBase(entry?.baseUrl ?? '');
    setDirty(false);
  }, [entry?.apiKey, entry?.baseUrl]);

  const filled = Boolean(entry?.apiKey || entry?.baseUrl);
  const needsBase = meta.id === 'custom' || meta.id === 'ollama';

  const runTest = async () => {
    setTesting(true);
    try {
      const ms = await testConnection(meta.id, model, { provider: meta.id, apiKey: val, baseUrl: base || undefined, updatedAt: Date.now() });
      onVerified('ok');
      toast.ok(`${meta.name} terhubung`, `Balasan diterima dalam ${ms} ms menggunakan ${model}.`);
    } catch (e) {
      onVerified('fail');
      toast.err(`${meta.name} gagal`, (e as Error).message.slice(0, 160));
    } finally { setTesting(false); }
  };

  return (
    <Card className="flex h-full flex-col gap-4 p-5" hue={meta.hue}>
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-transform duration-500 group-hover:rotate-6"
          style={{ borderColor: `hsl(${meta.hue} 84% 62% / .32)`, background: `hsl(${meta.hue} 84% 62% / .12)` }}>
          <AiLogo provider={meta.id} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-[16px] font-extrabold tracking-tight text-ink">{meta.name}</h3>
            {mounted && filled && <Badge tone={entry?.verified === 'ok' ? 'ok' : entry?.verified === 'fail' ? 'err' : 'brand'} icon={entry?.verified === 'ok' ? 'check' : 'lock'}>
              {entry?.verified === 'ok' ? 'terverifikasi' : entry?.verified === 'fail' ? 'gagal tes' : 'tersimpan'}
            </Badge>}
            {used > 0 && <Badge icon="layers">{used} role</Badge>}
          </div>
          <p className="z-mono mt-1 truncate text-[11px] text-dim">{meta.baseUrl || 'endpoint kustom'}</p>
          {mounted && entry && <p className="mt-1 text-[11px] text-dim">{maskKey(entry.apiKey)} · diperbarui {relTime(entry.updatedAt)}</p>}
        </div>
      </div>

      {needsBase && (
        <div>
          <Label icon="link" hint={meta.id === 'ollama' ? 'default http://localhost:11434/v1' : 'wajib diisi'}>Base URL</Label>
          <Input mono icon="terminal" placeholder={meta.baseUrl || 'https://.../v1'} value={base}
            onChange={(e) => { setBase(e.target.value); setDirty(true); }} />
        </div>
      )}

      <div>
        <Label icon="key" hint={meta.requiresKey ? meta.keyHint : 'opsional'}>API key</Label>
        <Input
          mono type={show ? 'text' : 'password'} placeholder={meta.requiresKey ? meta.keyHint : 'tidak diperlukan'}
          value={val} onChange={(e) => { setVal(e.target.value); setDirty(true); }} autoComplete="off" spellCheck={false}
          right={
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Sembunyikan' : 'Tampilkan'}
              className="rounded-full p-1.5 text-dim transition-colors hover:text-brand">
              <Icon name={show ? 'eyeOff' : 'eye'} size={15} />
            </button>
          }
        />
        <p className="mt-2 text-[11px] text-dim">Dapatkan di <span className="z-mono">{meta.docs}</span></p>
      </div>

      <div>
        <Label icon="spark" hint="dipakai saat tes koneksi">Model uji</Label>
        <Combobox value={model} onChange={setModel} options={meta.models.map((m) => ({ value: m, label: m, desc: MODEL_DESC[m], icon: 'spark', hue: meta.hue }))} />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
        <Button size="sm" variant={dirty ? 'primary' : 'soft'} icon="save" onClick={() => { onSave(val.trim(), base.trim() || undefined); setDirty(false); }}>
          Simpan
        </Button>
        <Button size="sm" variant="soft" icon="zap" loading={testing} disabled={!model || (meta.requiresKey && !val.trim())} onClick={runTest}>
          Tes koneksi
        </Button>
        {filled && <Button size="sm" variant="danger" icon="trash" className="ml-auto" onClick={onDelete}>Hapus</Button>}
      </div>
    </Card>
  );
}
