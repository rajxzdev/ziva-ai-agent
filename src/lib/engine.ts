'use client';

import type { RoleConfig, Edge, KeyEntry, ProviderId, RunStep } from '@/types';
import { getProvider } from './providers';

export interface CallResult { text: string; raw?: unknown }

export class ProviderError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ProviderError';
  }
}

const trim = (u: string) => u.replace(/\/+$/, '');

/** Satu panggilan chat ke provider mana pun — langsung dari browser, tanpa backend. */
export async function callModel(opts: {
  provider: ProviderId;
  model: string;
  system: string;
  user: string;
  temperature: number;
  maxTokens: number;
  key?: KeyEntry;
  signal?: AbortSignal;
}): Promise<CallResult> {
  const meta = getProvider(opts.provider);
  const base = trim(opts.key?.baseUrl?.trim() || meta.baseUrl);
  const apiKey = opts.key?.apiKey?.trim() || '';

  if (!base) throw new ProviderError('Base URL belum diisi untuk provider ini.');
  if (meta.requiresKey && !apiKey) throw new ProviderError(`API key ${meta.name} belum diisi.`);
  if (!opts.model) throw new ProviderError('Model belum dipilih.');

  if (meta.flavor === 'anthropic') {
    const res = await fetch(`${base}/messages`, {
      method: 'POST',
      signal: opts.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
        system: opts.system,
        messages: [{ role: 'user', content: opts.user }],
      }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new ProviderError(pickError(data) || `HTTP ${res.status}`, res.status);
    const text = (data?.content ?? []).map((c: { text?: string }) => c?.text ?? '').join('\n').trim();
    return { text, raw: data };
  }

  if (meta.flavor === 'google') {
    const url = `${base}/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      signal: opts.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: [{ role: 'user', parts: [{ text: opts.user }] }],
        generationConfig: { temperature: opts.temperature, maxOutputTokens: opts.maxTokens },
      }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new ProviderError(pickError(data) || `HTTP ${res.status}`, res.status);
    const text = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p?.text ?? '').join('\n').trim();
    return { text, raw: data };
  }

  // OpenAI-compatible (OpenAI, Groq, Mistral, OpenRouter, DeepSeek, xAI, Together, Ollama, Custom)
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  if (opts.provider === 'openrouter' && typeof window !== 'undefined') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Ziva Agent AI';
  }
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    signal: opts.signal,
    headers,
    body: JSON.stringify({
      model: opts.model,
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
    }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new ProviderError(pickError(data) || `HTTP ${res.status}`, res.status);
  const text = (data?.choices?.[0]?.message?.content ?? '').toString().trim();
  return { text, raw: data };
}

async function safeJson(res: Response) {
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return { _text: txt }; }
}

function pickError(data: unknown): string {
  const d = data as Record<string, unknown> | null;
  if (!d) return '';
  const err = d.error as Record<string, unknown> | string | undefined;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && typeof err.message === 'string') return err.message;
  if (typeof d.message === 'string') return d.message;
  if (typeof d._text === 'string') return d._text.slice(0, 240);
  return '';
}

/** Tes koneksi ringan: minta 1 token dari model termurah yang dipilih user. */
export async function testConnection(provider: ProviderId, model: string, key?: KeyEntry) {
  const started = performance.now();
  await callModel({
    provider, model, key,
    system: 'Balas persis satu kata: OK',
    user: 'ping',
    temperature: 0, maxTokens: 16,
  });
  return Math.round(performance.now() - started);
}

/* ── Perencanaan eksekusi ───────────────────────────────────────────── */

export function planStages(roles: RoleConfig[], edges: Edge[]): string[][] {
  const active = roles.filter((r) => r.enabled);
  const ids = new Set(active.map((r) => r.id));
  const indeg = new Map<string, number>();
  active.forEach((r) => indeg.set(r.id, 0));
  edges.forEach((e) => {
    if (ids.has(e.from) && ids.has(e.to)) indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  });

  const stages: string[][] = [];
  const done = new Set<string>();
  let guard = 0;
  while (done.size < active.length && guard++ < 50) {
    const layer = active
      .filter((r) => !done.has(r.id) && (indeg.get(r.id) ?? 0) === 0)
      .map((r) => r.id);
    if (!layer.length) {
      stages.push(active.filter((r) => !done.has(r.id)).map((r) => r.id));
      break;
    }
    layer.forEach((id) => {
      done.add(id);
      edges.filter((e) => e.from === id && ids.has(e.to)).forEach((e) => {
        indeg.set(e.to, (indeg.get(e.to) ?? 1) - 1);
      });
    });
    stages.push(layer);
  }
  return stages;
}

/* ── Runner ─────────────────────────────────────────────────────────── */

export interface RunEvents {
  onStep: (roleId: string, patch: Partial<RunStep>) => void;
  onLog: (line: string, tone?: 'info' | 'ok' | 'warn' | 'err') => void;
}

export interface RunOptions {
  brief: string;
  roles: RoleConfig[];
  edges: Edge[];
  keys: Partial<Record<ProviderId, KeyEntry>>;
  simulate: boolean;
  signal: AbortSignal;
  events: RunEvents;
}

const SIM_BLOCKS: Record<string, string[]> = {
  router: ['Objective', 'Scope', 'Constraints', 'Success Metrics'],
  strategist: ['Problem Statement', 'Persona', 'Fitur Prioritas (MoSCoW)', 'User Story'],
  'prompt-engineer': ['Brief Terkristalisasi', 'Struktur Prompt', 'Contoh Few-shot', 'Guardrail & Constraint', 'Variasi A/B'],
  'ui-architect': ['Sitemap', 'Hierarki Komponen', 'Breakpoint', 'State Matrix'],
  'design-system': ['Palet Warna', 'Skala Tipografi', 'Radius & Spacing', 'Token CSS'],
  'ux-writer': ['Tone of Voice', 'Label Utama', 'Pesan Error', 'Empty State'],
  backend: ['Entitas Data', 'Kontrak Penyimpanan', 'Strategi Cache', 'TypeScript Interface'],
  frontend: ['Struktur Folder', 'Komponen Inti', 'Contoh Implementasi', 'Catatan Performa'],
  qa: ['Skenario Happy Path', 'Edge Case', 'Aksesibilitas', 'Checklist Regresi'],
  security: ['Temuan', 'Severity', 'Mitigasi', 'Skor Risiko'],
  release: ['Ringkasan Eksekutif', 'Keputusan Kunci', 'Langkah Implementasi', 'Checklist Rilis'],
};

function simulatedOutput(role: RoleConfig, brief: string) {
  const blocks = SIM_BLOCKS[role.id] ?? ['Analisis', 'Rekomendasi'];
  const head = `### ${role.name} — mode simulasi\n_Provider:_ ${role.provider} · _Model:_ ${role.model}\n`;
  const body = blocks
    .map((b, i) => `**${i + 1}. ${b}**\n- Poin turunan dari brief: "${brief.slice(0, 72)}${brief.length > 72 ? '…' : ''}"\n- Rekomendasi ${role.name.toLowerCase()} untuk tahap ${role.stage}.\n- Catatan: isi ini contoh. Tambahkan API key untuk hasil sungguhan.`)
    .join('\n\n');
  return `${head}\n${body}`;
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });

export async function runWorkflow(opts: RunOptions): Promise<Record<string, string>> {
  const { brief, roles, edges, keys, simulate, signal, events } = opts;
  const byId = new Map(roles.map((r) => [r.id, r]));
  const stages = planStages(roles, edges);
  const outputs: Record<string, string> = {};

  events.onLog(`Rencana eksekusi: ${stages.length} tahap · ${stages.flat().length} agent aktif.`, 'info');

  for (let i = 0; i < stages.length; i++) {
    const layer = stages[i];
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    events.onLog(`Tahap ${i + 1}/${stages.length} → ${layer.map((id) => byId.get(id)?.name ?? id).join(', ')}`, 'info');
    layer.forEach((id) => events.onStep(id, { status: 'running', startedAt: Date.now() }));

    await Promise.all(
      layer.map(async (id) => {
        const role = byId.get(id);
        if (!role) return;
        const upstream = edges
          .filter((e) => e.to === id && outputs[e.from])
          .map((e) => `<<${byId.get(e.from)?.name ?? e.from}>>\n${outputs[e.from]}`)
          .join('\n\n');

        const userMsg = [
          `## BRIEF USER\n${brief}`,
          upstream ? `## KONTEKS DARI AGENT SEBELUMNYA\n${upstream}` : '',
          `## TUGASMU\nJalankan peran "${role.name}" (${role.tagline}). Jawab dalam Bahasa Indonesia, gunakan Markdown.`,
        ].filter(Boolean).join('\n\n');

        try {
          let text: string;
          if (simulate) {
            await sleep(650 + Math.random() * 900, signal);
            text = simulatedOutput(role, brief);
          } else {
            let usedProvider = role.provider;
            let usedModel = role.model;
            try {
              const r = await callModel({ provider: role.provider, model: role.model, key: keys[role.provider], system: role.systemPrompt, user: userMsg, temperature: role.temperature, maxTokens: role.maxTokens, signal });
              text = r.text || '_(model mengembalikan respons kosong)_';
            } catch (primaryError) {
              if ((primaryError as Error).name === 'AbortError' || !role.fallbackProvider || !role.fallbackModel) throw primaryError;
              usedProvider = role.fallbackProvider; usedModel = role.fallbackModel;
              events.onLog(`↻ ${role.name}: primary failed, trying fallback ${usedProvider} / ${usedModel}`, 'warn');
              const r = await callModel({ provider: usedProvider, model: usedModel, key: keys[usedProvider], system: role.systemPrompt, user: userMsg, temperature: role.temperature, maxTokens: role.maxTokens, signal });
              text = r.text || '_(fallback model returned an empty response)_';
            }
            events.onStep(id, { provider: usedProvider, model: usedModel });
          }
          outputs[id] = text;
          events.onStep(id, { status: 'done', output: text, endedAt: Date.now(), chars: text.length });
          events.onLog(`✓ ${role.name} selesai · ${text.length} karakter`, 'ok');
        } catch (e) {
          if ((e as Error).name === 'AbortError') {
            events.onStep(id, { status: 'idle', endedAt: Date.now() });
            throw e;
          }
          const msg = (e as Error).message || 'Gagal memanggil model';
          events.onStep(id, { status: 'error', error: msg, endedAt: Date.now() });
          events.onLog(`✕ ${role.name} gagal · ${msg}`, 'err');
        }
      }),
    );
  }
  return outputs;
}
