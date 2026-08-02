'use client';

import * as React from 'react';
import Link from 'next/link';
import { useZiva } from '@/lib/store';
import { useMounted } from '@/components/layout/ThemeSync';
import { PROVIDERS, getProvider, MODEL_DESC } from '@/lib/providers';
import { STAGE_LABELS, DEFAULT_ROLES } from '@/lib/roles';
import type { RoleConfig, ProviderId } from '@/types';
import { Reveal } from '@/components/ui/Reveal';
import { Card, SectionHeader, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, Combobox, type Option } from '@/components/ui/Select';
import { Switch, Slider, Input, Textarea, Label, Badge, Segmented } from '@/components/ui/Controls';
import { Drawer, ConfirmDialog } from '@/components/ui/Modal';
import { AiPicker, AiSummary } from '@/components/ui/AiPicker';
import { toast } from '@/components/ui/Toast';
import { uid } from '@/lib/utils';
import { Icon } from '@/components/icons';

const providerOptions: Option[] = PROVIDERS.map((p) => ({
  value: p.id, label: p.name, hint: p.requiresKey ? p.keyHint : 'tanpa API key', icon: 'cpu', logo: p.id, hue: p.hue,
}));

const modelOptions = (id: ProviderId): Option[] =>
  getProvider(id).models.map((m) => ({ value: m, label: m, hint: getProvider(id).name, desc: MODEL_DESC[m], icon: 'spark', hue: getProvider(id).hue }));

export default function RolesPage() {
  const mounted = useMounted();
  const { roles, keys, templates: savedTemplates, saveTemplate, removeTemplate, updateRole, toggleRole, resetRole, resetAllRoles, syncDefaultPipeline, bulkAssign } = useZiva();
  const [q, setQ] = React.useState('');
  const [stage, setStage] = React.useState<string>('all');
  const [focus, setFocus] = React.useState<string | null>(null);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [bulkProvider, setBulkProvider] = React.useState<ProviderId>('openai');
  const [bulkModel, setBulkModel] = React.useState('gpt-4o-mini');
  const [pickerFor, setPickerFor] = React.useState<string | null>(null);
  const [template, setTemplate] = React.useState('full-product');
  const [templateName, setTemplateName] = React.useState('');

  const templates = [
    { id: 'full-product', name: 'Full Product Team', desc: 'Research, product, design, engineering, quality, and release.', roles: DEFAULT_ROLES.map((r) => r.id) },
    { id: 'coding', name: 'Coding Build', desc: 'A focused build squad with prompts, architecture, frontend, review, QA, and DevOps.', roles: ['router', 'prompt-engineer', 'prompt-architect', 'solution-architect', 'backend', 'frontend', 'code-reviewer', 'prompt-qa', 'qa', 'security', 'devops'] },
    { id: 'discovery', name: 'Discovery Sprint', desc: 'Research, strategy, UX, and prompt design before implementation.', roles: ['router', 'researcher', 'strategist', 'prompt-engineer', 'ui-architect', 'ux-writer'] },
  ];
  const selectedTemplate = templates.find((item) => item.id === template) ?? templates[0];
  const applyTemplate = () => {
    roles.forEach((role) => updateRole(role.id, { enabled: selectedTemplate.roles.includes(role.id) }));
    toast.ok(`${selectedTemplate.name} applied`, `${selectedTemplate.roles.length} roles are checked and ready.`);
  };
  const saveCurrentTemplate = () => {
    const name = templateName.trim();
    const roleIds = roles.filter((role) => role.enabled).map((role) => role.id);
    if (!name) { toast.warn('Template name required', 'Give this role selection a name first.'); return; }
    if (!roleIds.length) { toast.warn('No roles selected', 'Enable at least one role before saving.'); return; }
    saveTemplate({ id: uid(), name, roleIds, createdAt: Date.now() });
    setTemplateName('');
    toast.ok('Custom template saved', `${roleIds.length} selected roles are stored locally.`);
  };
  React.useEffect(() => { syncDefaultPipeline(); }, [syncDefaultPipeline]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('focus');
    if (f) setFocus(f);
    const pk = params.get('pick');
    if (pk) setPickerFor(pk);
  }, []);

  const filtered = roles.filter((r) => {
    const s = q.trim().toLowerCase();
    const okQ = !s || r.name.toLowerCase().includes(s) || r.tagline.toLowerCase().includes(s) || r.model.toLowerCase().includes(s) || r.provider.includes(s);
    const okS = stage === 'all' || String(r.stage) === stage;
    return okQ && okS;
  });

  const active = roles.find((r) => r.id === focus) ?? null;
  const keyReady = (p: ProviderId) => !getProvider(p).requiresKey || Boolean(keys[p]?.apiKey);

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <SectionHeader
          eyebrow="Configuration" icon="layers" title={`${roles.length} agent roles`}
          desc="Every role has its own AI engine. Open the AI catalog on any role to select a provider and model, from presets or a custom model ID."
          right={
            <div className="flex flex-wrap gap-2">
              <Button variant="soft" icon="wand" onClick={() => setBulkOpen(true)}>Bulk assign</Button>
              <Button variant="ghost" icon="refresh" onClick={() => setConfirmReset(true)}>Reset all</Button>
            </div>
          }
        />
      </Reveal>

      <Reveal delay={40}>
        <Card className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-brand">Role templates</p><h2 className="mt-1 text-lg font-extrabold text-ink">Start with a ready-made team</h2><p className="mt-1 text-sm text-muted">Choose a template, then apply it to check the roles included in that workflow.</p></div>
            <Button variant="primary" icon="check" onClick={applyTemplate}>Apply template</Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">{templates.map((item) => <button key={item.id} type="button" onClick={() => setTemplate(item.id)} className={`rounded-2xl border p-4 text-left transition-all ${template === item.id ? 'border-brand bg-brand/10' : 'border-line bg-surface2 hover:border-brand/40'}`}><div className="flex items-center justify-between gap-3"><strong className="text-sm text-ink">{item.name}</strong><span className={`grid h-5 w-5 place-items-center rounded-md border ${template === item.id ? 'border-brand bg-brand text-white' : 'border-line'}`}>{template === item.id && <Icon name="check" size={13} />}</span></div><p className="mt-2 text-xs leading-relaxed text-muted">{item.desc}</p><p className="mt-3 text-[11px] font-bold text-brand">{item.roles.length} roles included</p></button>)}</div>
        </Card>
      </Reveal>

      <Reveal delay={50}>
        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex-1"><Label icon="save">Save your own template</Label><Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. My SaaS launch team" /></div><Button variant="soft" icon="save" onClick={saveCurrentTemplate}>Save selected roles</Button></div>
          <p className="mt-2 text-xs text-muted">Your currently enabled roles are saved on this device. Apply a saved template whenever you need it.</p>
          {savedTemplates.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{savedTemplates.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface2 p-3"><button type="button" onClick={() => { roles.forEach((role) => updateRole(role.id, { enabled: item.roleIds.includes(role.id) })); toast.ok(`${item.name} applied`, `${item.roleIds.length} roles enabled.`); }} className="min-w-0 flex-1 text-left"><p className="truncate text-sm font-extrabold text-ink">{item.name}</p><p className="text-xs text-muted">{item.roleIds.length} roles · custom template</p></button><button type="button" onClick={() => removeTemplate(item.id)} aria-label={`Delete ${item.name}`} className="rounded-lg p-2 text-dim hover:bg-err/10 hover:text-err"><Icon name="trash" size={14} /></button></div>)}</div>}
        </Card>
      </Reveal>

      <Reveal delay={60}>
        <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center" corners={false}>
          <Input icon="search" placeholder="Search roles, providers, or models..." value={q} onChange={(e) => setQ(e.target.value)} className="flex-1" />
          <div className="z-scroll -mx-1 flex min-w-0 max-w-full gap-2 overflow-x-auto px-1 pb-1 lg:pb-0">
            <Segmented
              value={stage}
              onChange={setStage}
              size="sm"
              items={[{ value: 'all', label: 'All' }, ...STAGE_LABELS.map((l, i) => ({ value: String(i), label: l }))]}
            />
          </div>
        </Card>
      </Reveal>

      {filtered.length === 0 ? (
        <EmptyState icon="search" title="Role tidak ditemukan" desc="Coba kata kunci lain atau ganti filter tahap." />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((r, i) => (
            <Reveal key={r.id} delay={(i % 4) * 70}>
              <RoleCard
                role={r} mounted={mounted} keyReady={keyReady(r.provider)}
                onChange={(patch) => updateRole(r.id, patch)}
                onToggle={() => toggleRole(r.id)}
                onOpen={() => setFocus(r.id)}
                onPick={() => setPickerFor(r.id)}
              />
            </Reveal>
          ))}
        </div>
      )}

      <Drawer
        open={Boolean(active)} onClose={() => setFocus(null)}
        title={active?.name ?? ''} desc={active ? `${active.code} · Tahap ${active.stage} — ${STAGE_LABELS[active.stage]}` : ''}
        icon={active?.icon}
        footer={
          <>
            <Button variant="ghost" icon="refresh" onClick={() => { if (active) { resetRole(active.id); toast.info('Role dikembalikan ke setelan awal.'); } }}>Reset role</Button>
            <Button variant="primary" icon="check" onClick={() => { setFocus(null); toast.ok('Konfigurasi tersimpan', 'Perubahan langsung berlaku dan disimpan di browser.'); }}>Selesai</Button>
          </>
        }
      >
        {active && <RoleDetail role={active} onChange={(patch) => updateRole(active.id, patch)} onPick={() => setPickerFor(active.id)} />}
      </Drawer>

      <Drawer
        open={bulkOpen} onClose={() => setBulkOpen(false)} icon="wand"
        title="Bulk assign" desc={`Terapkan satu provider & model ke seluruh ${roles.length} role sekaligus.`} width={460}
        footer={
          <>
            <Button variant="ghost" onClick={() => setBulkOpen(false)}>Batal</Button>
            <Button variant="primary" icon="check" onClick={() => { bulkAssign(bulkProvider, bulkModel); setBulkOpen(false); toast.ok(`Diterapkan ke ${roles.length} role`); }}>Terapkan</Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div>
            <Label icon="cpu">Provider</Label>
            <Select value={bulkProvider} onChange={(v) => { setBulkProvider(v as ProviderId); setBulkModel(getProvider(v as ProviderId).models[0] ?? ''); }} options={providerOptions} searchable />
          </div>
          <div>
            <Label icon="spark" hint="ketik bebas atau pilih">Model</Label>
            <Combobox value={bulkModel} onChange={setBulkModel} options={modelOptions(bulkProvider)} />
          </div>
          <div className="flex items-start gap-2.5 rounded-2xl border border-warn/30 bg-warn/10 p-3.5">
            <Icon name="alert" size={16} className="mt-0.5 shrink-0 text-warn" />
            <p className="text-[12.5px] leading-relaxed text-muted">Tindakan ini menimpa provider &amp; model di semua role. Prompt sistem tiap role tetap dipertahankan.</p>
          </div>
        </div>
      </Drawer>

      <AiPicker
        open={Boolean(pickerFor)} onClose={() => setPickerFor(null)}
        role={roles.find((r) => r.id === pickerFor) ?? null}
        onApply={(provider, model) => {
          if (!pickerFor) return;
          const name = roles.find((r) => r.id === pickerFor)?.name ?? 'Role';
          updateRole(pickerFor, { provider, model });
          toast.ok(`${name} sekarang pakai ${getProvider(provider).name}`, `Model: ${model}`);
        }}
      />

      <ConfirmDialog
        open={confirmReset} onClose={() => setConfirmReset(false)}
        onConfirm={() => { resetAllRoles(); toast.info('Semua role kembali ke setelan pabrik.'); }}
        title="Reset all role?" desc="Provider, model, temperatur, dan prompt sistem akan dikembalikan ke nilai bawaan." danger confirmLabel="Reset sekarang"
      />
    </div>
  );
}

function RoleCard({
  role, mounted, keyReady, onChange, onToggle, onOpen, onPick,
}: {
  role: RoleConfig; mounted: boolean; keyReady: boolean;
  onChange: (p: Partial<RoleConfig>) => void; onToggle: () => void; onOpen: () => void; onPick: () => void;
}) {
  const meta = getProvider(role.provider);
  return (
    <Card className="flex h-full flex-col gap-4 p-5" hue={role.hue}>
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-transform duration-500 group-hover:rotate-6"
          style={{ borderColor: `hsl(${role.hue} 84% 62% / .32)`, background: `hsl(${role.hue} 84% 62% / .12)`, color: `hsl(${role.hue} 84% 62%)` }}>
          <Icon name={role.icon} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="z-mono text-[10px] font-bold tracking-wider text-dim">{role.code}</span>
            <Badge>{STAGE_LABELS[role.stage]}</Badge>
            {mounted && (keyReady ? <Badge tone="ok" icon="lock">key siap</Badge> : <Badge tone="warn" icon="alert">key kosong</Badge>)}
          </div>
          <h3 className="mt-1 truncate text-[16px] font-extrabold tracking-tight text-ink">{role.name}</h3>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{role.tagline}</p>
        </div>
        <Switch checked={role.enabled} onChange={onToggle} size="sm" />
      </div>

      <div className="rounded-3xl border border-line bg-surface2/70 p-3.5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-dim">
            <Icon name="cpu" size={11} /> AI provider & model
          </span>
          <button
            type="button" onClick={onPick}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-2.5 py-1 text-[10.5px] font-extrabold text-brand transition-all duration-300 hover:-translate-y-[1px] hover:bg-brand/20"
          >
            <Icon name="sliders" size={11} /> Edit AI / Model
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label icon="cpu">AI provider</Label>
            <Select
              size="sm" value={role.provider} options={providerOptions} searchable
              onChange={(v) => {
                const p = v as ProviderId;
                onChange({ provider: p, model: getProvider(p).models[0] ?? '' });
              }}
            />
          </div>
          <div>
            <Label icon="spark" hint="ketik / pilih">Model</Label>
            <Combobox value={role.model} onChange={(m) => onChange({ model: m })} options={modelOptions(role.provider)} placeholder="mis. gpt-4o" />
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
        <Badge icon="zap">temp {role.temperature}</Badge>
        <Badge icon="book">{role.maxTokens} tok</Badge>{role.fallbackProvider && <Badge tone="warn" icon="refresh">fallback ready</Badge>}
        <span className="z-mono truncate text-[10.5px] text-dim">{meta.requiresKey ? meta.vendor : 'lokal'}</span>
        <Button size="sm" variant="soft" iconRight="chevronRight" className="ml-auto" onClick={onOpen}>Detail</Button>
      </div>
    </Card>
  );
}

function RoleDetail({ role, onChange, onPick }: { role: RoleConfig; onChange: (p: Partial<RoleConfig>) => void; onPick: () => void }) {
  const meta = getProvider(role.provider);
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-line bg-surface2 p-4">
        <p className="text-[13px] leading-relaxed text-muted">{role.tagline}</p>
      </div>

      <Switch checked={role.enabled} onChange={(v) => onChange({ enabled: v })} label="Aktifkan role ini" hint="Role nonaktif dilewati saat pipeline berjalan." />

      <div>
        <Label icon="cpu" hint="klik untuk buka katalog">AI provider & model</Label>
        <AiSummary role={role} onOpen={onPick} />
        <div className="mt-3">
          <Select value={role.provider} options={providerOptions} searchable
            onChange={(v) => { const p = v as ProviderId; onChange({ provider: p, model: getProvider(p).models[0] ?? '' }); }} />
        </div>
        <p className="mt-2 text-[11.5px] text-dim">Endpoint: <span className="z-mono">{meta.baseUrl || 'kustom (atur di halaman API Key)'}</span></p>
      </div>

      <div>
        <Label icon="spark" hint="ketik manual atau pilih preset">Model</Label>
        <Combobox value={role.model} onChange={(m) => onChange({ model: m })} options={modelOptions(role.provider)} />
      </div>

      <div className="rounded-3xl border border-line bg-surface2/60 p-4">
        <Switch checked={Boolean(role.fallbackProvider && role.fallbackModel)} onChange={(enabled) => onChange(enabled ? { fallbackProvider: 'openai', fallbackModel: 'gpt-4o-mini' } : { fallbackProvider: undefined, fallbackModel: undefined })} label="Fallback model" hint="Retries this role with a second model only if the primary call fails." />
        {role.fallbackProvider && role.fallbackModel && <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"><div><Label icon="cpu">Fallback provider</Label><Select value={role.fallbackProvider} options={providerOptions} searchable onChange={(value) => { const provider = value as ProviderId; onChange({ fallbackProvider: provider, fallbackModel: getProvider(provider).models[0] ?? '' }); }} /></div><div><Label icon="spark">Fallback model</Label><Combobox value={role.fallbackModel} onChange={(fallbackModel) => onChange({ fallbackModel })} options={modelOptions(role.fallbackProvider)} /></div></div>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Slider label="Temperature" value={role.temperature} min={0} max={1} step={0.05} onChange={(v) => onChange({ temperature: v })} format={(v) => v.toFixed(2)} />
        <Slider label="Max tokens" value={role.maxTokens} min={256} max={8192} step={128} onChange={(v) => onChange({ maxTokens: Math.round(v) })} format={(v) => String(Math.round(v))} />
      </div>

      <div>
        <Label icon="terminal" hint="instruksi inti agent">System prompt</Label>
        <Textarea rows={9} value={role.systemPrompt} onChange={(e) => onChange({ systemPrompt: e.target.value })} className="z-mono text-[12.5px]" />
        <p className="mt-2 text-[11.5px] text-dim">{role.systemPrompt.length} karakter</p>
      </div>

      <Link href="/keys" className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface2 p-3.5 transition-colors hover:border-brand/45">
        <Icon name="key" size={16} className="text-brand" />
        <span className="flex-1 text-[13px] font-semibold text-ink">Kelola API key {meta.name}</span>
        <Icon name="arrowRight" size={15} className="text-dim" />
      </Link>
    </div>
  );
}
