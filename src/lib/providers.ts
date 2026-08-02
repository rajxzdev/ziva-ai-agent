import type { ProviderMeta, ProviderId } from '@/types';

export const PROVIDERS: ProviderMeta[] = [
  {
    id: 'openai', name: 'OpenAI', vendor: 'OpenAI', flavor: 'openai',
    baseUrl: 'https://api.openai.com/v1', requiresKey: true, keyHint: 'sk-...',
    docs: 'platform.openai.com/api-keys', hue: 158,
    models: ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini', 'o4-mini', 'o3', 'o3-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    id: 'anthropic', name: 'Anthropic', vendor: 'Anthropic', flavor: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1', requiresKey: true, keyHint: 'sk-ant-...',
    docs: 'console.anthropic.com/settings/keys', hue: 24,
    models: ['claude-opus-4-1', 'claude-opus-4', 'claude-sonnet-4-5', 'claude-sonnet-4-0', 'claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  },
  {
    id: 'google', name: 'Google Gemini', vendor: 'Google', flavor: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta', requiresKey: true, keyHint: 'AIza...',
    docs: 'aistudio.google.com/apikey', hue: 210,
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro-preview', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  },
  {
    id: 'groq', name: 'Groq', vendor: 'Groq', flavor: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1', requiresKey: true, keyHint: 'gsk_...',
    docs: 'console.groq.com/keys', hue: 12,
    models: ['llama-4-scout-17b-16e-instruct', 'llama-4-maverick-17b-128e-instruct', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'deepseek-r1-distill-llama-70b', 'qwen-2.5-32b', 'gemma2-9b-it', 'mixtral-8x7b-32768'],
  },
  {
    id: 'mistral', name: 'Mistral AI', vendor: 'Mistral', flavor: 'openai',
    baseUrl: 'https://api.mistral.ai/v1', requiresKey: true, keyHint: '...',
    docs: 'console.mistral.ai/api-keys', hue: 36,
    models: ['magistral-medium-latest', 'mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest', 'ministral-8b-latest', 'open-mistral-nemo'],
  },
  {
    id: 'openrouter', name: 'OpenRouter', vendor: 'OpenRouter', flavor: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1', requiresKey: true, keyHint: 'sk-or-v1-...',
    docs: 'openrouter.ai/keys', hue: 268,
    models: ['openai/gpt-5', 'openai/gpt-4.1', 'anthropic/claude-sonnet-4.5', 'google/gemini-2.5-pro', 'deepseek/deepseek-chat', 'meta-llama/llama-3.3-70b-instruct', 'qwen/qwen-2.5-72b-instruct', 'x-ai/grok-4', 'mistralai/mistral-large', 'perplexity/sonar'],
  },
  {
    id: 'deepseek', name: 'DeepSeek', vendor: 'DeepSeek', flavor: 'openai',
    baseUrl: 'https://api.deepseek.com/v1', requiresKey: true, keyHint: 'sk-...',
    docs: 'platform.deepseek.com/api_keys', hue: 224,
    models: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-v3', 'deepseek-r1', 'deepseek-coder'],
  },
  {
    id: 'xai', name: 'xAI Grok', vendor: 'xAI', flavor: 'openai',
    baseUrl: 'https://api.x.ai/v1', requiresKey: true, keyHint: 'xai-...',
    docs: 'console.x.ai', hue: 0,
    models: ['grok-4', 'grok-3', 'grok-3-mini', 'grok-2-1212', 'grok-2-mini', 'grok-beta'],
  },
  {
    id: 'together', name: 'Together AI', vendor: 'Together', flavor: 'openai',
    baseUrl: 'https://api.together.xyz/v1', requiresKey: true, keyHint: '...',
    docs: 'api.together.ai/settings/api-keys', hue: 190,
    models: ['meta-llama/Llama-4-Scout-17B-16E-Instruct', 'meta-llama/Llama-3.3-70B-Instruct-Turbo', 'Qwen/Qwen2.5-72B-Instruct-Turbo', 'deepseek-ai/DeepSeek-V3', 'mistralai/Mixtral-8x22B-Instruct-v0.1', 'google/gemma-3-27b-it'],
  },
  {
    id: 'ollama', name: 'Ollama (Lokal)', vendor: 'Lokal', flavor: 'openai',
    baseUrl: 'http://localhost:11434/v1', requiresKey: false, keyHint: 'tidak perlu key',
    docs: 'ollama.com', hue: 140,
    models: ['llama4', 'llama3.3', 'llama3.2', 'qwen2.5-coder', 'deepseek-r1', 'phi4', 'gemma3', 'mistral-nemo'],
  },
  {
    id: 'perplexity', name: 'Perplexity', vendor: 'Perplexity', flavor: 'openai',
    baseUrl: 'https://api.perplexity.ai', requiresKey: true, keyHint: 'pplx-...',
    docs: 'www.perplexity.ai/settings/api', hue: 190,
    models: ['sonar', 'sonar-pro', 'sonar-reasoning', 'sonar-reasoning-pro', 'sonar-small', 'r1-1776'],
  },
  {
    id: 'cohere', name: 'Cohere', vendor: 'Cohere', flavor: 'openai',
    baseUrl: 'https://api.cohere.com/compatibility/v1', requiresKey: true, keyHint: '...',
    docs: 'dashboard.cohere.com/api-keys', hue: 150,
    models: ['command-a-03-2025', 'command-r-plus', 'command-r', 'command-r7b-12-2024', 'command-light'],
  },
  {
    id: 'fireworks', name: 'Fireworks AI', vendor: 'Fireworks', flavor: 'openai',
    baseUrl: 'https://api.fireworks.ai/inference/v1', requiresKey: true, keyHint: 'fw_...',
    docs: 'fireworks.ai', hue: 28,
    models: ['accounts/fireworks/models/llama-v3p3-70b-instruct', 'accounts/fireworks/models/qwen3-235b-a22b', 'accounts/fireworks/models/deepseek-r1', 'accounts/fireworks/models/llama-4-maverick-instruct', 'accounts/fireworks/models/mixtral-8x22b-instruct'],
  },
  {
    id: 'moonshot', name: 'Moonshot (Kimi)', vendor: 'Moonshot AI', flavor: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1', requiresKey: true, keyHint: 'sk-...',
    docs: 'platform.moonshot.cn', hue: 250,
    models: ['kimi-k2', 'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  },
  {
    id: 'qwen', name: 'Qwen (Alibaba)', vendor: 'Alibaba', flavor: 'openai',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', requiresKey: true, keyHint: 'sk-...',
    docs: 'dashscope.console.aliyun.com', hue: 270,
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen3-235b-a22b', 'qwen2.5-72b-instruct', 'qwen-coder-plus'],
  },
  {
    id: 'nvidia', name: 'NVIDIA', vendor: 'NVIDIA', flavor: 'openai',
    baseUrl: 'https://integrate.api.nvidia.com/v1', requiresKey: true, keyHint: 'nvapi-...',
    docs: 'build.nvidia.com', hue: 95,
    models: ['nvidia/llama-3.3-nemotron-70b-instruct', 'nvidia/nemotron-4-340b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct', 'deepseek-ai/deepseek-r1'],
  },
  {
    id: 'deepinfra', name: 'DeepInfra', vendor: 'DeepInfra', flavor: 'openai',
    baseUrl: 'https://api.deepinfra.com/v1/openai', requiresKey: true, keyHint: '...',
    docs: 'deepinfra.com', hue: 340,
    models: ['meta-llama/Llama-3.3-70B-Instruct', 'deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct', 'mistralai/Mixtral-8x22B-Instruct-v0.1', 'meta-llama/Meta-Llama-4-Maverick-17B'],
  },
  {
    id: 'custom', name: 'Custom Endpoint', vendor: 'OpenAI-compatible', flavor: 'openai',
    baseUrl: '', requiresKey: true, keyHint: 'key milikmu',
    docs: 'endpoint apa pun yang OpenAI-compatible', hue: 300,
    models: [],
  },
];

export const providerMap: Record<ProviderId, ProviderMeta> = PROVIDERS.reduce(
  (acc, p) => { acc[p.id] = p; return acc; },
  {} as Record<ProviderId, ProviderMeta>,
);

export const getProvider = (id: ProviderId): ProviderMeta => providerMap[id] ?? providerMap.openai;

/** Sedikit "preview" tiap model supaya mudah memilih — ditampilkan di katalog & combobox. */
export const MODEL_DESC: Record<string, string> = {
  // OpenAI
  'gpt-5': 'Unggulan: penalaran, coding, & agen paling kuat.',
  'gpt-5-mini': 'Versi ringan gpt-5, cepat & hemat.',
  'gpt-5-nano': 'Paling hemat & kilat untuk tugas simpel.',
  'gpt-4.1': 'Sangat kuat untuk agen & tool‑calling.',
  'gpt-4.1-mini': 'Seimbang antara kualitas & biaya.',
  'gpt-4.1-nano': 'Paling hemat di keluarga 4.1.',
  'gpt-4o': 'Multimodal (teks+gambar) seimbang.',
  'gpt-4o-mini': 'Hemat & cepat, cocok untuk router.',
  'o4-mini': 'Model reasoning kompak & efisien.',
  'o3': 'Reasoning mendalam untuk soal sulit.',
  'o3-mini': 'Reasoning ringan, bagus untuk kode.',
  'gpt-4-turbo': 'Generasi sebelumnya yang stabil.',
  'gpt-3.5-turbo': 'Model lama, ringan & murah.',
  // Anthropic
  'claude-opus-4-1': 'Paling besar & pintar, untuk sintesis akhir.',
  'claude-opus-4': 'Opus generasi sebelumnya, sangat mumpuni.',
  'claude-sonnet-4-5': 'Seimbang: cerdas & responsif.',
  'claude-sonnet-4-0': 'Sonnet 4.0, stabil untuk agen.',
  'claude-3-7-sonnet-latest': 'Punya mode extended thinking.',
  'claude-3-5-haiku-latest': 'Paling cepat & murah di Anthropic.',
  'claude-3-opus-latest': 'Opus 3, kualitas tinggi.',
  'claude-3-5-sonnet-latest': 'Sonnet 3.5, populer & andal.',
  // Google Gemini
  'gemini-2.5-pro': 'Terbaik Gemini: reasoning & kode.',
  'gemini-2.5-flash': 'Cepat & murah, kualitas tinggi.',
  'gemini-2.5-flash-lite': 'Paling ringan & kilat.',
  'gemini-2.5-pro-preview': 'Preview Gemini 2.5 Pro.',
  'gemini-2.0-flash': 'Flash generasi 2.0 yang gesit.',
  'gemini-2.0-flash-lite': 'Flash lite 2.0, sangat hemat.',
  'gemini-1.5-pro': 'Kontekstel panjang (1M token).',
  'gemini-1.5-flash': 'Flash 1.5, cepat & murah.',
  // Groq
  'llama-4-scout-17b-16e-instruct': 'Llama 4 Scout, multimodal.',
  'llama-4-maverick-17b-128e-instruct': 'Llama 4 Maverick, kualitas tinggi.',
  'llama-3.3-70b-versatile': 'Llama 3.3 70B, kilat di Groq.',
  'llama-3.1-8b-instant': 'Model kecil, latensi rendah.',
  'deepseek-r1-distill-llama-70b': 'Distil R1, reasoning terbuka.',
  'qwen-2.5-32b': 'Qwen 2.5 32B dari Alibaba.',
  'gemma2-9b-it': 'Gemma 2 9B, ringan.',
  'mixtral-8x7b-32768': 'Mixtral MoE, konteks panjang.',
  // Mistral
  'magistral-medium-latest': 'Magistral, reasoning Mistral.',
  'mistral-large-latest': 'Flagship Mistral, mumpuni.',
  'mistral-medium-latest': 'Ukuran menengah, seimbang.',
  'mistral-small-latest': 'Ringan & hemat.',
  'codestral-latest': 'Spesialis coding Mistral.',
  'ministral-8b-latest': 'Mini model edge/cepat.',
  'open-mistral-nemo': 'Mistral Nemo, komunitas.',
  // OpenRouter
  'openai/gpt-5': 'Lewat OpenRouter: gpt-5.',
  'openai/gpt-4.1': 'Lewat OpenRouter: gpt-4.1.',
  'anthropic/claude-sonnet-4.5': 'Lewat OpenRouter: Claude Sonnet 4.5.',
  'google/gemini-2.5-pro': 'Lewat OpenRouter: Gemini 2.5 Pro.',
  'deepseek/deepseek-chat': 'Lewat OpenRouter: DeepSeek.',
  'meta-llama/llama-3.3-70b-instruct': 'Lewat OpenRouter: Llama 3.3 70B.',
  'qwen/qwen-2.5-72b-instruct': 'Lewat OpenRouter: Qwen 2.5 72B.',
  'x-ai/grok-4': 'Lewat OpenRouter: Grok 4.',
  'mistralai/mistral-large': 'Lewat OpenRouter: Mistral Large.',
  'perplexity/sonar': 'Lewat OpenRouter: Sonar (search).',
  // DeepSeek
  'deepseek-chat': 'Model chat andal & murah.',
  'deepseek-reasoner': 'Reasoning (R1) terbuka.',
  'deepseek-v3': 'Flagship V3, kualitas tinggi.',
  'deepseek-r1': 'R1 reasoning murni — juga bisa lokal via Ollama.',
  'deepseek-coder': 'Spesialis kode DeepSeek.',
  // xAI
  'grok-4': 'Flagship Grok terbaru.',
  'grok-3': 'Grok 3, kuat & cepat.',
  'grok-3-mini': 'Grok 3 mini, hemat.',
  'grok-2-1212': 'Grok 2 stabil.',
  'grok-2-mini': 'Grok 2 mini.',
  'grok-beta': 'Akses beta Grok.',
  // Together
  'meta-llama/Llama-4-Scout-17B-16E-Instruct': 'Llama 4 Scout di Together.',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo': 'Llama 3.3 70B Turbo.',
  'Qwen/Qwen2.5-72B-Instruct-Turbo': 'Qwen 2.5 72B Turbo.',
  'deepseek-ai/DeepSeek-V3': 'DeepSeek V3 (juga via DeepInfra).',
  'mistralai/Mixtral-8x22B-Instruct-v0.1': 'Mixtral 8x22B (juga via DeepInfra).',
  'google/gemma-3-27b-it': 'Gemma 3 27B.',
  // Ollama (lokal)
  llama4: 'Llama 4 lokal (Ollama).',
  'llama3.3': 'Llama 3.3 lokal.',
  'llama3.2': 'Llama 3.2 lokal, ringan.',
  'qwen2.5-coder': 'Qwen coder lokal.',
  phi4: 'Phi-4 Microsoft lokal.',
  gemma3: 'Gemma 3 lokal.',
  'mistral-nemo': 'Mistral Nemo lokal.',
  // Perplexity
  sonar: 'Model search + jawab online.',
  'sonar-pro': 'Sonar Pro, konteks lebih panjang.',
  'sonar-reasoning': 'Sonar dengan reasoning.',
  'sonar-reasoning-pro': 'Sonar reasoning teratas.',
  'sonar-small': 'Sonar kecil & kilat.',
  'r1-1776': 'R1 (1776) tanpa filter search.',
  // Cohere
  'command-a-03-2025': 'Command A, flagship Cohere.',
  'command-r-plus': 'Command R+ untuk agen.',
  'command-r': 'Command R, seimbang.',
  'command-r7b-12-2024': 'Command R7B ringan.',
  'command-light': 'Command Light, hemat.',
  // Fireworks
  'accounts/fireworks/models/llama-v3p3-70b-instruct': 'Llama 3.3 70B di Fireworks.',
  'accounts/fireworks/models/qwen3-235b-a22b': 'Qwen3 235B di Fireworks.',
  'accounts/fireworks/models/deepseek-r1': 'DeepSeek R1 di Fireworks.',
  'accounts/fireworks/models/llama-4-maverick-instruct': 'Llama 4 Maverick di Fireworks.',
  'accounts/fireworks/models/mixtral-8x22b-instruct': 'Mixtral 8x22B di Fireworks.',
  // Moonshot
  'kimi-k2': 'Kimi K2, flagship Moonshot.',
  'moonshot-v1-8k': 'Kimi v1 8K konteks.',
  'moonshot-v1-32k': 'Kimi v1 32K konteks.',
  'moonshot-v1-128k': 'Kimi v1 128K konteks panjang.',
  // Qwen
  'qwen-max': 'Qwen Max, terkuat Alibaba.',
  'qwen-plus': 'Qwen Plus, seimbang.',
  'qwen-turbo': 'Qwen Turbo, kilat.',
  'qwen3-235b-a22b': 'Qwen3 235B MoE.',
  'qwen2.5-72b-instruct': 'Qwen 2.5 72B instruct.',
  'qwen-coder-plus': 'Qwen Coder Plus.',
  // NVIDIA
  'nvidia/llama-3.3-nemotron-70b-instruct': 'Nemotron 70B di NVIDIA.',
  'nvidia/nemotron-4-340b-instruct': 'Nemotron 4 340B.',
  'nvidia/llama-3.1-nemotron-70b-instruct': 'Nemotron 3.1 70B.',
  'deepseek-ai/deepseek-r1': 'DeepSeek R1 di NVIDIA.',
  // DeepInfra
  'meta-llama/Llama-3.3-70B-Instruct': 'Llama 3.3 70B di DeepInfra.',
  'Qwen/Qwen2.5-72B-Instruct': 'Qwen 2.5 72B di DeepInfra.',
  'meta-llama/Meta-Llama-4-Maverick-17B': 'Llama 4 Maverick di DeepInfra.',
};

export const modelDesc = (providerId: ProviderId, model: string): string =>
  MODEL_DESC[model] ?? `Model ${model} dari ${getProvider(providerId).name}.`;
