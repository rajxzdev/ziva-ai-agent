export type ProviderId =
  | 'openai' | 'anthropic' | 'google' | 'groq' | 'mistral'
  | 'openrouter' | 'deepseek' | 'xai' | 'together' | 'ollama' | 'custom'
  | 'perplexity' | 'cohere' | 'fireworks' | 'moonshot' | 'qwen' | 'nvidia' | 'deepinfra';

export type ApiFlavor = 'openai' | 'anthropic' | 'google';

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  vendor: string;
  flavor: ApiFlavor;
  baseUrl: string;
  requiresKey: boolean;
  keyHint: string;
  docs: string;
  hue: number;
  models: string[];
}

export type StageId = 0 | 1 | 2 | 3 | 4 | 5;

export interface RoleConfig {
  id: string;
  name: string;
  code: string;
  tagline: string;
  icon: string;
  stage: StageId;
  provider: ProviderId;
  model: string;
  fallbackProvider?: ProviderId;
  fallbackModel?: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enabled: boolean;
  hue: number;
}

export interface Edge { from: string; to: string }
export interface RoleTemplate { id: string; name: string; roleIds: string[]; createdAt: number }
export interface NodePos { x: number; y: number }

export interface KeyEntry {
  provider: ProviderId;
  apiKey: string;
  baseUrl?: string;
  label?: string;
  updatedAt: number;
  verified?: 'unknown' | 'ok' | 'fail';
}

export type StepStatus = 'idle' | 'queued' | 'running' | 'done' | 'error' | 'skipped';

export interface RunStep {
  roleId: string;
  status: StepStatus;
  output: string;
  error?: string;
  provider: ProviderId;
  model: string;
  startedAt?: number;
  endedAt?: number;
  chars: number;
}

export interface RunRecord {
  id: string;
  brief: string;
  createdAt: number;
  durationMs: number;
  status: 'done' | 'error' | 'cancelled' | 'running';
  mode: 'live' | 'sim';
  steps: RunStep[];
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentId = 'aurora' | 'ember' | 'mint' | 'violet' | 'ocean';
export type Language = 'en' | 'id';

export interface Settings {
  theme: ThemeMode;
  accent: AccentId;
  motion: boolean;
  dots: boolean;
  glass: boolean;
  autoSim: boolean;
  concurrency: number;
  language: Language;
}
