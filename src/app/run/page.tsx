'use client';

import * as React from 'react';
import Link from 'next/link';
import { useZiva } from '@/lib/store';
import { useMounted } from '@/components/layout/ThemeSync';
import { getProvider } from '@/lib/providers';
import { runWorkflow, planStages } from '@/lib/engine';
import type { RunStep, StepStatus } from '@/types';
import { Reveal } from '@/components/ui/Reveal';
import { Card, SectionHeader, EmptyState } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea, Label, Badge, Segmented, ProgressBar, Ring } from '@/components/ui/Controls';

import { Markdown } from '@/components/ui/Markdown';
import { toast } from '@/components/ui/Toast';
import { Icon } from '@/components/icons';
import { AiLogo } from '@/components/icons/logos';
import { uid, fmtDur, copyText, download, cx } from '@/lib/utils';
import { STAGE_LABELS } from '@/lib/roles';
import type { RoleConfig } from '@/types';
import { extractGeneratedFiles, type GeneratedFile } from '@/lib/generated-files';
import { downloadZip } from '@/lib/zip';

const PRESETS = [
  { label: 'Aplikasi catatan offline', text: 'Rancang aplikasi catatan yang bekerja penuh offline, punya folder, pencarian cepat, dan sinkronisasi opsional. Target pengguna: mahasiswa. Prioritas: ringan dan enak dipakai di HP.' },
  { label: 'Dashboard analitik UMKM', text: 'Buat dashboard analitik penjualan untuk UMKM kuliner: ringkasan omzet harian, menu terlaris, jam ramai, dan prediksi stok. Harus mudah dipahami pemilik warung yang bukan orang teknis.' },
  { label: 'Marketplace jasa lokal', text: 'Desain marketplace jasa tukang & servis rumah untuk kota tier-2 di Indonesia. Fokus pada kepercayaan: verifikasi penyedia, ulasan, dan estimasi biaya transparan.' },
  { label: 'Onboarding aplikasi fintech', text: 'Susun alur onboarding aplikasi dompet digital yang patuh KYC namun tetap terasa cepat. Sertakan penanganan gagal verifikasi dan copy yang menenangkan.' },
];

interface LogLine { id: string; text: string; tone: 'info' | 'ok' | 'warn' | 'err'; at: number }
export default function RunPage() {
  const mounted = useMounted();
  const { roles, edges, positions, keys, settings, pushRun } = useZiva();

  const [brief, setBrief] = React.useState('');
  const [mode, setMode] = React.useState<'live' | 'sim'>('sim');
  const [workMode, setWorkMode] = React.useState<'think' | 'code'>('think');
  const [attachments, setAttachments] = React.useState<{ name: string; text: string }[]>([]);
  const [resultView, setResultView] = React.useState<'result' | 'preview' | 'files'>('result');
  const [selectedFile, setSelectedFile] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState(false);
  const [steps, setSteps] = React.useState<Record<string, RunStep>>({});
  const [logs, setLogs] = React.useState<LogLine[]>([]);
  const [tab, setTab] = React.useState<string | null>(null);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const abortRef = React.useRef<AbortController | null>(null);
  const logRef = React.useRef<HTMLDivElement>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const accepted = Array.from(files).slice(0, 5);
    const entries = await Promise.all(accepted.map(async (file) => ({ name: file.name, text: file.size <= 200_000 ? await file.text() : `[File attached: ${file.name} (${Math.ceil(file.size / 1024)} KB)` })));
    setAttachments((current) => [...current, ...entries].slice(0, 5));
    toast.ok(`${entries.length} file${entries.length > 1 ? 's' : ''} added`, 'Their contents will be included in the pipeline context.');
  };
  const removeAttachment = (name: string) => setAttachments((current) => current.filter((file) => file.name !== name));
  const enrichedBrief = () => `${brief.trim()}\n\nWorking mode: ${workMode === 'code' ? 'CODE — return a complete file-by-file implementation. For every file use exactly this structure: ### File: path/to/file.ext followed by a fenced code block. Include a browser-ready preview.html whenever possible, with any CSS and JavaScript it needs. Do not combine files into one block.' : 'THINK — analyze, plan, and explain decisions before implementation.'}${attachments.length ? `\n\nAttached files:\n${attachments.map((file) => `--- ${file.name} ---\n${file.text.slice(0, 12000)}`).join('\n')}` : ''}`;
  const previewDocument = (files: GeneratedFile[]) => {
    const html = files.find((file) => /\.(html?|htm)$/i.test(file.path))?.code;
    if (html) return html;
    return '<!doctype html><html><body style="margin:0;background:#0d1220;color:#eef2ff;font:14px system-ui;padding:24px"><h2 style="color:#8b7cff">Preview needs an HTML file</h2><p>This response contains source files. Select a file in Code files to inspect or ask the agent to include <b>preview.html</b>.</p></body></html>';
  };

  const enabled = roles.filter((r) => r.enabled);
  const stages = React.useMemo(() => planStages(roles, edges), [roles, edges]);
  // A configured fallback makes a role runnable even if its primary provider is unavailable.
  const missing = Array.from(new Set(enabled.flatMap((role) => {
    const primaryReady = !getProvider(role.provider).requiresKey || Boolean(keys[role.provider]?.apiKey);
    const fallbackReady = Boolean(role.fallbackProvider && role.fallbackModel && (!getProvider(role.fallbackProvider).requiresKey || keys[role.fallbackProvider]?.apiKey));
    return primaryReady || fallbackReady ? [] : [role.provider];
  }))).filter((provider) => getProvider(provider).requiresKey && !keys[provider]?.apiKey);
  const canLive = missing.length === 0;

  React.useEffect(() => { if (mounted && canLive) setMode('live'); }, [mounted, canLive]);

  React.useEffect(() => {
    if (!running || !startedAt) return;
    const t = setInterval(() => setElapsed(Date.now() - startedAt), 200);
    return () => clearInterval(t);
  }, [running, startedAt]);

  React.useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }); }, [logs]);

  const statuses = React.useMemo(() => {
    const m: Record<string, StepStatus> = {};
    Object.values(steps).forEach((s) => { m[s.roleId] = s.status; });
    return m;
  }, [steps]);

  const doneCount = Object.values(steps).filter((s) => s.status === 'done').length;
  const errCount = Object.values(steps).filter((s) => s.status === 'error').length;
  const progress = enabled.length ? ((doneCount + errCount) / enabled.length) * 100 : 0;

  const pushLog = (text: string, tone: LogLine['tone'] = 'info') =>
    setLogs((l) => [...l, { id: uid(), text, tone, at: Date.now() }].slice(-160));

  const start = async () => {
    if (!brief.trim()) { toast.warn('Brief is empty', 'Describe what you want to build first.'); return; }
    if (enabled.length === 0) { toast.warn('Tidak ada role aktif', 'Aktifkan minimal satu role di halaman Role Agent.'); return; }

    const init: Record<string, RunStep> = {};
    enabled.forEach((r) => { init[r.id] = { roleId: r.id, status: 'queued', output: '', provider: r.provider, model: r.model, chars: 0 }; });
    setSteps(init);
    setLogs([]);
    setTab(null);
    setRunning(true);
    const t0 = Date.now();
    setStartedAt(t0);
    setElapsed(0);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    pushLog(`Pipeline started · mode ${mode === 'sim' ? 'SIMULATION' : 'LIVE'} · ${enabled.length} agent`, 'info');

    let status: 'done' | 'error' | 'cancelled' = 'done';
    try {
      await runWorkflow({
        brief: enrichedBrief(), roles, edges, keys, simulate: mode === 'sim', signal: ctrl.signal,
        events: {
          onStep: (roleId, patch) => setSteps((s) => ({ ...s, [roleId]: { ...s[roleId], ...patch } as RunStep })),
          onLog: (line, tone) => pushLog(line, tone ?? 'info'),
        },
      });
    } catch (e) {
      if ((e as Error).name === 'AbortError') { status = 'cancelled'; pushLog('Pipeline dihentikan oleh pengguna.', 'warn'); }
      else { status = 'error'; pushLog(`Kesalahan fatal: ${(e as Error).message}`, 'err'); }
    }

    setRunning(false);
    abortRef.current = null;
    const dur = Date.now() - t0;

    setSteps((cur) => {
      const arr = Object.values(cur);
      const anyErr = arr.some((s) => s.status === 'error');
      pushRun({
        id: uid(), brief: brief.trim(), createdAt: t0, durationMs: dur,
        status: status === 'cancelled' ? 'cancelled' : anyErr ? 'error' : 'done',
        mode, steps: arr,
      });
      const first = arr.find((s) => s.status === 'done');
      if (first) setTab((t) => t ?? first.roleId);
      return cur;
    });

    if (status === 'done') { pushLog(`Pipeline selesai dalam ${fmtDur(dur)}.`, 'ok'); toast.ok('Pipeline selesai', `${enabled.length} agent dieksekusi dalam ${fmtDur(dur)}.`); }
  };

  const stop = () => { abortRef.current?.abort(); setRunning(false); };

  const allMarkdown = () =>
    Object.values(steps)
      .filter((s) => s.output)
      .map((s) => `# ${roles.find((r) => r.id === s.roleId)?.name}\n\n${s.output}`)
      .join('\n\n---\n\n');

  const activeStep = tab ? steps[tab] : null;
  const activeRole = tab ? roles.find((r) => r.id === tab) : null;
  const generatedFiles = React.useMemo(() => activeStep?.output ? extractGeneratedFiles(activeStep.output) : [], [activeStep?.output]);
  // Files are scoped to the pipeline currently running in this Runner, never mixed with history.
  const pipelineFiles = React.useMemo(() => Object.values(steps).flatMap((step) => extractGeneratedFiles(step.output).map((file) => ({ ...file, roleId: step.roleId }))), [steps]);
  const visibleFile = generatedFiles.find((file) => file.path === selectedFile) ?? generatedFiles[0] ?? null;
  const workspaceFile = pipelineFiles.find((file) => `${file.roleId}:${file.path}` === selectedFile) ?? pipelineFiles[0] ?? null;
  React.useEffect(() => { setSelectedFile(null); }, [tab, activeStep?.output]);

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <SectionHeader
          eyebrow="Execution" icon="play" title="Pipeline runner"
          desc="One brief moves through enabled agents in stages. Every agent output becomes context for its downstream connections."
          right={
            <div className="flex items-center gap-3">
              {running && <Ring value={progress} label={`${doneCount}/${enabled.length}`} />}
              <Badge tone={mode === 'live' ? 'brand' : 'warn'} icon={mode === 'live' ? 'zap' : 'wand'} pulse={running}>
                {mode === 'live' ? 'Mode live' : 'Mode simulasi'}
              </Badge>
            </div>
          }
        />
      </Reveal>

      {/* Brief + kontrol */}
      <Reveal delay={60}>
        <Card className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
          <div>
            <Label icon="pen" hint="include goals, constraints, and context">Your brief</Label>
            <Textarea
              rows={7} value={brief} onChange={(e) => setBrief(e.target.value)} disabled={running}
              placeholder="Example: Build an offline habit tracker with weekly progress charts and gentle reminders..."
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="z-chip cursor-pointer transition-all hover:border-brand/50 hover:text-ink"><Icon name="upload" size={12} /> Add files<input type="file" multiple className="sr-only" onChange={(e) => { void addFiles(e.target.files); e.currentTarget.value = ''; }} /></label>
              {attachments.map((file) => <span key={file.name} className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-ink"><Icon name="book" size={11} />{file.name}<button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeAttachment(file.name)} className="ml-1 text-dim hover:text-err">×</button></span>)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} disabled={running} onClick={() => setBrief(p.text)}
                  className="z-chip transition-all duration-300 hover:border-brand/50 hover:text-ink disabled:opacity-40">
                  <Icon name="spark" size={12} /> {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Label icon="filter">Execution mode</Label>
              <Segmented
                value={mode} onChange={(v) => { if (v === 'live' && !canLive) { toast.warn('API key belum lengkap', 'Lengkapi key untuk provider yang dipakai role aktif.'); return; } setMode(v); }}
                full items={[{ value: 'sim', label: 'Simulation', icon: 'wand' }, { value: 'live', label: 'Live', icon: 'zap' }]}
              />
            </div>

            <div>
              <Label icon="code">Work mode</Label>
              <Segmented value={workMode} onChange={(v) => { setWorkMode(v as 'think' | 'code'); setResultView(v === 'code' ? 'preview' : 'result'); }} full items={[{ value: 'think', label: 'Think', icon: 'spark' }, { value: 'code', label: 'Code', icon: 'code' }]} />
              <p className="mt-2 text-[11px] leading-relaxed text-muted">Think produces an implementation plan. Code requests file-by-file fenced code and enables the live preview.</p>
            </div>

            {mounted && !canLive && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-warn/30 bg-warn/10 p-3.5">
                <Icon name="alert" size={15} className="mt-0.5 shrink-0 text-warn" />
                <p className="text-[12px] leading-relaxed text-muted">
                  {missing.length} provider belum punya key: <span className="font-semibold text-ink">{missing.map((m) => getProvider(m).name).join(', ')}</span>.{' '}
                  <Link href="/keys" className="font-bold text-brand">Isi sekarang →</Link>
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { k: 'Agent', v: enabled.length },
                { k: 'Tahap', v: stages.length },
                { k: 'Durasi', v: running ? fmtDur(elapsed) : '—' },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-line bg-surface2 px-2 py-3">
                  <p className="text-[15px] font-extrabold text-ink">{s.v}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-dim">{s.k}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto flex gap-2">
              {running
                ? <Button variant="danger" icon="stop" full onClick={stop}>Hentikan</Button>
                : <Button variant="primary" icon="play" full onClick={start}>Jalankan pipeline</Button>}
            </div>
            {(running || doneCount > 0) && <ProgressBar value={progress} />}
          </div>
        </Card>
      </Reveal>

      {/* Kanvas live */}
      <Reveal delay={100} className="flex min-w-0 flex-col gap-3">
        <h2 className="flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[.14em] text-dim">
          <Icon name="nodes" size={14} /> Aliran langsung
        </h2>
        <LiveWorkflowBoard roles={enabled} statuses={statuses} />
      </Reveal>

      {/* Konsol + output */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)]">
        <Reveal className="flex min-w-0 flex-col gap-3">
          <h2 className="flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[.14em] text-dim">
            <Icon name="terminal" size={14} /> Konsol
          </h2>
          <Card className="flex h-[420px] flex-col overflow-hidden p-0" corners={false}>
            <div ref={logRef} className="z-scroll flex-1 p-4">
              {logs.length === 0 ? (
                <p className="z-mono py-10 text-center text-[11.5px] text-dim">Menunggu perintah...</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {logs.map((l) => (
                    <li key={l.id} className="z-mono flex gap-2 text-[11.5px] leading-relaxed" style={{ animation: 'z-fade-in .3s ease both' }}>
                      <span className="shrink-0 text-dim">{new Date(l.at).toLocaleTimeString('id-ID', { hour12: false })}</span>
                      <span className={cx(
                        l.tone === 'ok' && 'text-ok', l.tone === 'err' && 'text-err',
                        l.tone === 'warn' && 'text-warn', l.tone === 'info' && 'text-muted',
                      )}>{l.text}</span>
                    </li>
                  ))}
                  {running && <li className="z-mono text-[11.5px] text-brand z-blink">▍menjalankan...</li>}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-line bg-surface2/60 px-4 py-2.5">
              <span className={cx('h-1.5 w-1.5 rounded-full', running ? 'bg-ok' : 'bg-dim')} />
              <span className="text-[11px] font-semibold text-dim">{running ? 'Berjalan' : 'Siaga'}</span>
              <button onClick={() => setLogs([])} className="ml-auto text-[11px] font-bold text-dim transition-colors hover:text-err">Bersihkan</button>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={80} className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[.14em] text-dim">
              <Icon name="book" size={14} /> Hasil agent
            </h2>
            {doneCount > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" icon="copy" onClick={async () => { (await copyText(allMarkdown())) ? toast.ok('Semua hasil disalin') : toast.err('Gagal menyalin'); }}>Salin semua</Button>
                <Button size="sm" variant="soft" icon="download" onClick={() => { download(`ziva-hasil-${Date.now()}.md`, allMarkdown(), 'text/markdown'); toast.ok('Berkas diunduh'); }}>Unduh .md</Button>
              </div>
            )}
          </div>

          {doneCount > 0 && workMode === 'code' && <div className="flex rounded-xl border border-line bg-surface2 p-1 self-start"><button onClick={() => setResultView('result')} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${resultView === 'result' ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}>Code result</button><button onClick={() => setResultView('files')} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${resultView === 'files' ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}>Pipeline files ({pipelineFiles.length})</button><button onClick={() => setResultView('preview')} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${resultView === 'preview' ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}>Preview</button></div>}
          <Card className="flex min-h-[420px] flex-col overflow-hidden p-0" corners={false}>
            {Object.keys(steps).length === 0 ? (
              <div className="grid flex-1 place-items-center p-6">
                <EmptyState icon="rocket" title="Belum ada hasil" desc="Tulis brief lalu tekan Jalankan pipeline. Setiap agent akan muncul di sini begitu selesai bekerja." />
              </div>
            ) : (
              <>
                <div className="z-scroll flex gap-1.5 overflow-x-auto border-b border-line p-2.5">
                  {enabled.map((r) => {
                    const st = steps[r.id]?.status ?? 'idle';
                    const on = tab === r.id;
                    return (
                      <button key={r.id} onClick={() => setTab(r.id)}
                        className={cx('inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-bold transition-all duration-300',
                          on ? 'border-brand/50 bg-brand/10 text-ink' : 'border-line bg-surface2 text-muted hover:text-ink')}>
                        <Icon name={r.icon} size={13} style={{ color: `hsl(${r.hue} 84% 62%)` }} />
                        <span className="whitespace-nowrap">{r.name}</span>
                        <span className={cx('h-1.5 w-1.5 rounded-full',
                          st === 'done' ? 'bg-ok' : st === 'running' ? 'bg-brand z-blink' : st === 'error' ? 'bg-err' : st === 'queued' ? 'bg-warn' : 'bg-dim')} />
                      </button>
                    );
                  })}
                </div>

                <div className="z-scroll max-h-[560px] flex-1 p-5">
                  {!activeStep ? (
                    <p className="py-16 text-center text-sm text-dim">Pilih salah satu agent di atas untuk melihat hasilnya.</p>
                  ) : activeStep.status === 'error' ? (
                    <div className="flex items-start gap-3 rounded-3xl border border-err/30 bg-err/10 p-4">
                      <Icon name="alert" size={18} className="mt-0.5 shrink-0 text-err" />
                      <div>
                        <p className="text-[13px] font-bold text-ink">{activeRole?.name} gagal dieksekusi</p>
                        <p className="z-mono mt-1.5 text-[12px] leading-relaxed text-muted">{activeStep.error}</p>
                      </div>
                    </div>
                  ) : activeStep.output ? (
                    <>
                      <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-line pb-3">
                        <Badge tone="brand" icon="cpu">
                          <span className="-ml-0.5 mr-1 inline-flex translate-y-[1px]"><AiLogo provider={activeStep.provider} size={13} /></span>
                          {getProvider(activeStep.provider).name}
                        </Badge>
                        <Badge icon="spark">{activeStep.model}</Badge>
                        <Badge icon="book">{activeStep.chars} karakter</Badge>
                        {activeStep.startedAt && activeStep.endedAt && <Badge icon="clock">{fmtDur(activeStep.endedAt - activeStep.startedAt)}</Badge>}
                        <Button size="sm" variant="ghost" icon="copy" className="ml-auto"
                          onClick={async () => { (await copyText(activeStep.output)) ? toast.ok('Disalin') : toast.err('Gagal menyalin'); }}>Salin</Button>
                      </div>
                      {workMode === 'code' ? (
                        resultView === 'files' ? <div className="grid min-h-[390px] grid-cols-[minmax(170px,0.38fr)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-line"><div className="z-scroll border-r border-line bg-surface2 p-2">{pipelineFiles.map((file) => <button key={`${file.roleId}:${file.path}`} onClick={() => setSelectedFile(`${file.roleId}:${file.path}`)} className={`mb-1 w-full rounded-lg px-2.5 py-2 text-left ${workspaceFile?.path === file.path && workspaceFile?.roleId === file.roleId ? 'bg-brand/10 text-ink' : 'text-muted hover:bg-surface'}`}><p className="truncate text-[11px] font-bold">{file.path}</p><p className="mt-0.5 truncate text-[9px] text-dim">{roles.find((r) => r.id === file.roleId)?.name}</p></button>)}</div>{workspaceFile && <div className="flex min-w-0 flex-col"><div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2"><span className="z-mono truncate text-[10px] text-dim">{workspaceFile.path}</span><div className="flex shrink-0 gap-1"><Button size="sm" variant="ghost" icon="copy" onClick={async () => (await copyText(workspaceFile.code)) ? toast.ok('File copied') : toast.err('Copy failed')}>Copy</Button><Button size="sm" variant="soft" icon="download" onClick={() => { const unique = Array.from(new Map(pipelineFiles.map((file) => [file.path, file])).values()); downloadZip(`ziva-pipeline-${Date.now()}.zip`, unique); toast.ok('Pipeline ZIP downloaded', `${unique.length} generated files included.`); }}>ZIP</Button></div></div><pre className="z-scroll flex-1 overflow-auto bg-[#0b1020] p-4 text-[12px] leading-relaxed text-[#d8e2ff]"><code>{workspaceFile.code}</code></pre></div>}</div> : resultView === 'preview' ? <div className="overflow-hidden rounded-2xl border border-line bg-white"><div className="border-b border-line bg-surface2 px-3 py-2 text-[11px] font-bold text-muted">Live preview · preview.html generated by the AI</div><iframe title="Generated code preview" sandbox="allow-scripts" srcDoc={previewDocument(generatedFiles)} className="h-[360px] w-full bg-white" /></div> :
                        <div className="overflow-hidden rounded-2xl border border-line"><div className="z-scroll flex gap-1 overflow-x-auto border-b border-line bg-surface2 p-2">{generatedFiles.map((file) => <button key={file.path} onClick={() => setSelectedFile(file.path)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${visibleFile?.path === file.path ? 'bg-brand text-white' : 'text-muted hover:bg-surface hover:text-ink'}`}>{file.path}</button>)}</div>{visibleFile ? <><div className="flex items-center justify-between border-b border-line px-3 py-2"><span className="z-mono text-[10px] text-dim">{visibleFile.path} · {visibleFile.language}</span><Button size="sm" variant="ghost" icon="copy" onClick={async () => { (await copyText(visibleFile.code)) ? toast.ok('File copied') : toast.err('Copy failed'); }}>Copy file</Button></div><pre className="z-scroll max-h-[420px] overflow-auto bg-[#0b1020] p-4 text-[12px] leading-relaxed text-[#d8e2ff]"><code>{visibleFile.code}</code></pre></> : <Markdown text={activeStep.output} />}</div>
                      ) : <Markdown text={activeStep.output} />}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <Icon name="refresh" size={26} className="text-brand z-spin" />
                      <p className="text-sm font-bold text-ink">{activeRole?.name} sedang bekerja...</p>
                      <p className="text-xs text-muted">Hasil akan muncul otomatis di sini.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        </Reveal>
      </div>
    </div>
  );
}


function LiveWorkflowBoard({ roles, statuses }: { roles: RoleConfig[]; statuses: Record<string, StepStatus> }) {
  const columns = STAGE_LABELS.map((label, stage) => ({ label, stage, roles: roles.filter((role) => role.stage === stage) })).filter((column) => column.roles.length);
  const stateLabel: Record<StepStatus, string> = { idle: 'Waiting', queued: 'Queued', running: 'Running', done: 'Done', error: 'Failed', skipped: 'Skipped' };
  const stateClass: Record<StepStatus, string> = { idle: 'bg-dim', queued: 'bg-warn', running: 'bg-brand z-blink', done: 'bg-ok', error: 'bg-err', skipped: 'bg-dim' };
  return (
    <Card className="overflow-hidden p-0" corners={false}>
      <div className="flex items-center justify-between border-b border-line bg-surface2/70 px-4 py-3"><span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-dim">Stage-by-stage live status</span><span className="text-[11px] text-muted">No animated connection graph</span></div>
      <div className="z-scroll overflow-x-auto p-4"><div className="grid min-w-[940px] gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(145px, 1fr))` }}>{columns.map((column, index) => (
        <div key={column.label} className="relative rounded-2xl border border-line bg-surface2/60 p-2.5">
          {index < columns.length - 1 && <span className="pointer-events-none absolute -right-2 top-7 z-10 hidden h-px w-4 bg-brand/50 xl:block" />}
          <div className="mb-2.5 border-b border-line pb-2"><p className="z-mono text-[9px] font-extrabold uppercase tracking-[.14em] text-brand">Stage {index + 1}</p><p className="text-xs font-extrabold text-ink">{column.label}</p></div>
          <div className="flex flex-col gap-2">{column.roles.map((role) => { const status = statuses[role.id] ?? 'idle'; return <div key={role.id} className={cx('rounded-xl border border-line bg-surface px-2.5 py-2 transition-opacity', !role.enabled && 'opacity-45')}><div className="flex items-center gap-2"><span className={cx('h-2 w-2 shrink-0 rounded-full', stateClass[status])} /><span className="truncate text-[11px] font-bold text-ink">{role.name}</span></div><p className="mt-1 pl-4 text-[10px] text-muted">{stateLabel[status]}</p></div>; })}</div>
        </div>
      ))}</div></div>
    </Card>
  );
}
