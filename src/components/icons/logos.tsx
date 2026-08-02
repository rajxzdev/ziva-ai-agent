import * as React from 'react';
import type { ProviderId } from '@/types';

/** Warna brand tiap provider — dipakai supaya logo terlihat seperti logo asli, bukan ikon abu-abu. */
export const PROVIDER_LOGO_COLOR: Record<ProviderId, string> = {
  openai: '#10A37F',
  anthropic: '#CC785C',
  google: '#4285F4',
  groq: '#F55036',
  mistral: '#FF7000',
  openrouter: '#F1583E',
  deepseek: '#4D6BFE',
  xai: '#9CA3AF',
  together: '#19A0FB',
  ollama: '#B08968',
  custom: '#8B5CF6',
  perplexity: '#20B8CD',
  cohere: '#1F8A70',
  fireworks: '#F25C2A',
  moonshot: '#4D7CFE',
  qwen: '#5B5BF5',
  nvidia: '#76B900',
  deepinfra: '#E8415B',
};

const GLYPHS: Record<ProviderId, React.ReactNode> = {
  // OpenAI — bunga 6 kelopak
  openai: (
    <g fill="currentColor">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="12" cy="5" rx="2.3" ry="4.2" transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2.4" />
    </g>
  ),
  // Anthropic — mark "Λ"
  anthropic: (
    <path d="M5 19 L12 5 L19 19" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
  ),
  // Google Gemini — bintang 4 puncak
  google: (
    <path d="M12 2.5 C12 8.5 15.5 12 21.5 12 C15.5 12 12 15.5 12 21.5 C12 15.5 8.5 12 2.5 12 C8.5 12 12 8.5 12 2.5 Z" fill="currentColor" />
  ),
  // Groq — huruf G
  groq: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M14.6 14.6 V9.4 a2.2 2.2 0 0 1 3.6 1.4" />
    </g>
  ),
  // Mistral — tiga bilah miring
  mistral: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6.5 19 C7.5 14 9.5 10 13 5" />
      <path d="M11 19 C12 14 14 10 17.5 5" />
      <path d="M15.5 19 C16.5 14 18.5 10.5 21 9" />
    </g>
  ),
  // OpenRouter — heksagon + chevron rute
  openrouter: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 3 20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z" />
      <path d="M9.5 9 L12.5 12 L9.5 15" />
      <path d="M14.5 9 L17.5 12 L14.5 15" opacity=".5" />
    </g>
  ),
  // DeepSeek — huruf D
  deepseek: <path d="M8 4 H12 a7 7 0 0 1 0 16 H8 Z" fill="currentColor" />,
  // xAI Grok — silang X
  xai: (
    <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M5.5 5.5 L18.5 18.5" />
      <path d="M18.5 5.5 L5.5 18.5" />
    </g>
  ),
  // Together AI — T + titik
  together: (
    <g>
      <circle cx="12" cy="7" r="3" fill="currentColor" />
      <path d="M12 10.5 V20 M7 20 H17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  // Ollama — kepala llama
  ollama: (
    <g fill="currentColor">
      <path d="M9 8c0-1.4 1.1-2.4 2.6-2.4.6 0 1.1.2 1.5.5.5-.6 1.4-.9 2.2-.5.8.4 1 1.3.7 2.1L18 11c.2.9 0 1.9-.6 2.5-.5.5-1.2.6-1.7.2L15 14.2V19h-2.2l-.2-4.2h-1.6l-.2 4.2H8.6l.4-4.8c-.8 0-1.6-.4-2-1.1-.5-.8-.3-1.8.5-2.3Z" />
      <path d="M10.4 5.6 11.4 3 12.6 5.2 Z" />
      <path d="M14.6 5.4 15.5 2.9 16.6 5.1 Z" />
    </g>
  ),
  // Custom endpoint — roda gigi
  custom: (
    <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" fill="none">
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.5v2.4M12 18.1v2.4M3.5 12h2.4M18.1 12h2.4M6 6l1.7 1.7M16.3 16.3l1.7 1.7M18 6l-1.7 1.7M7.7 16.3l-1.7 1.7" />
    </g>
  ),
  // Perplexity — lingkaran + tanda tanya-ish
  perplexity: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5 a2.6 2.6 0 0 1 5 0 c0 1.8-2.5 2.2-2.5 4" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
  // Cohere — dua busur
  cohere: (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 16 C6 10 10 7 14 7" />
      <path d="M9 16 C9 12 11 10 14 10" opacity=".6" />
      <path d="M18 16 V9" />
    </g>
  ),
  // Fireworks — bunga api
  fireworks: (
    <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M12 3 V8 M12 16 V21 M3 12 H8 M16 12 H21 M5.5 5.5 L8.5 8.5 M15.5 15.5 L18.5 18.5 M18.5 5.5 L15.5 8.5 M8.5 15.5 L5.5 18.5" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
    </g>
  ),
  // Moonshot / Kimi — bulan sabit + bintang
  moonshot: (
    <g fill="currentColor">
      <path d="M16 4.5 A8.5 8.5 0 1 0 16 19.5 A6.5 6.5 0 1 1 16 4.5 Z" />
    </g>
  ),
  // Qwen (Alibaba) — tag "Q"
  qwen: (
    <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 9 a6 6 0 1 0 0 6" />
      <path d="M16 12 V16 H19.5" />
    </g>
  ),
  // NVIDIA — heksagon + garis
  nvidia: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 3 19 7 V17 L12 21 L5 17 V7 Z" />
      <path d="M9 15 V9.5 L14 14 V9" />
    </g>
  ),
  // DeepInfra — datacenter node
  deepinfra: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <path d="M16.5 16.5 H17.5 V17.5 H16.5 Z" />
    </g>
  ),
};

export function AiLogo({ provider, size = 18, className = '' }: { provider: ProviderId; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ color: PROVIDER_LOGO_COLOR[provider] ?? 'currentColor' }}
    >
      {GLYPHS[provider] ?? GLYPHS.custom}
    </svg>
  );
}
