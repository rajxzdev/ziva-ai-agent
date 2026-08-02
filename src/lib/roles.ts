import type { RoleConfig, Edge, NodePos } from '@/types';

/**
 * 10 ROLE — pipeline multi-agent Ziva.
 * Stage 0 → 5, tiap stage bisa berisi beberapa role yang jalan paralel.
 */
export const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: 'router', code: 'R-01', name: 'Intake Router', icon: 'route', stage: 0, hue: 265,
    tagline: 'Membaca brief, memecah niat, dan menentukan jalur agent yang dipakai.',
    provider: 'openai', model: 'gpt-4o-mini', temperature: 0.2, maxTokens: 1200, enabled: true,
    systemPrompt:
      'Kamu adalah Intake Router pada sistem multi-agent Ziva. Tugasmu: baca brief user, ekstrak tujuan utama, audiens, batasan teknis, dan kriteria sukses. Keluarkan ringkasan terstruktur (Objective, Scope, Out-of-scope, Constraints, Success Metrics) plus rekomendasi role mana yang paling krusial. Jawab ringkas, bullet, tanpa basa-basi.',
  },
  {
    id: 'strategist', code: 'R-02', name: 'Product Strategist', icon: 'compass', stage: 1, hue: 200,
    tagline: 'Menyusun PRD ringkas, prioritas fitur, dan user story yang bisa dieksekusi.',
    provider: 'openai', model: 'gpt-4.1', temperature: 0.4, maxTokens: 2000, enabled: true,
    systemPrompt:
      'Kamu adalah Product Strategist. Berdasarkan hasil router, susun PRD ringkas: Problem, Persona, User Journey, daftar fitur dengan prioritas MoSCoW, user story format "Sebagai ... saya ingin ... agar ...", dan definition of done. Fokus pada hal yang bisa dibangun, bukan teori.',
  },
  {
    id: 'prompt-engineer', code: 'R-11', name: 'Prompt Engineer', icon: 'wand', stage: 1, hue: 255,
    tagline: 'Writes task-specific production prompts for each downstream agent and handoff.',
    provider: 'openai', model: 'gpt-4.1', temperature: 0.3, maxTokens: 2000, enabled: true,
    systemPrompt:
      'You are the Prompt Engineer. Your responsibility is operational: write a precise, task-specific prompt for every downstream agent in this run. Include role, context, task, constraints, and output format. This differs from Prompt Architect (reusable systems) and Prompt QA Specialist (testing). Return a copy-ready table in English.',
  },
  {
    id: 'ui-architect', code: 'R-03', name: 'UI Architecture', icon: 'grid', stage: 2, hue: 165,
    tagline: 'Merancang struktur halaman, hierarki layout, navigasi, dan state UI.',
    provider: 'anthropic', model: 'claude-sonnet-4-5', temperature: 0.5, maxTokens: 2400, enabled: true,
    systemPrompt:
      'Kamu adalah UI Architect. Rancang arsitektur antarmuka: peta halaman (sitemap), hierarki komponen, layout grid, breakpoint responsif, pola navigasi, dan daftar state (empty, loading, error, success) tiap layar. Sajikan sebagai tree + tabel komponen. Jangan menulis kode implementasi penuh, cukup struktur.',
  },
  {
    id: 'design-system', code: 'R-04', name: 'Design System', icon: 'palette', stage: 2, hue: 300,
    tagline: 'Menentukan design token: warna, tipografi, radius, spacing, dan motion.',
    provider: 'google', model: 'gemini-2.5-pro', temperature: 0.6, maxTokens: 1800, enabled: true,
    systemPrompt:
      'Kamu adalah Design System Lead. Definisikan design token lengkap: palet warna light & dark (hex), skala tipografi, skala spacing, radius, shadow/elevation, dan aturan motion (durasi + easing). Keluarkan juga dalam bentuk CSS custom properties siap pakai. Pastikan kontras memenuhi WCAG AA.',
  },
  {
    id: 'ux-writer', code: 'R-05', name: 'UX Writer', icon: 'pen', stage: 2, hue: 45,
    tagline: 'Menulis microcopy, label, pesan error, dan tone of voice produk.',
    provider: 'openai', model: 'gpt-4o-mini', temperature: 0.8, maxTokens: 1400, enabled: true,
    systemPrompt:
      'Kamu adalah UX Writer. Tulis microcopy untuk seluruh layar: judul, subjudul, label tombol, placeholder, helper text, pesan sukses/error/empty state. Tentukan tone of voice (3 kata sifat) dan berikan aturan penulisan. Sajikan dalam tabel: Lokasi | Tipe | Copy. Singkat, manusiawi, bebas jargon.',
  },
  {
    id: 'backend', code: 'R-06', name: 'Data & API Engineer', icon: 'database', stage: 2, hue: 220,
    tagline: 'Mendesain skema data, kontrak API, dan strategi penyimpanan lokal.',
    provider: 'deepseek', model: 'deepseek-chat', temperature: 0.3, maxTokens: 2200, enabled: true,
    systemPrompt:
      'Kamu adalah Data & API Engineer. Rancang model data (entitas, field, tipe, relasi), kontrak API atau bentuk penyimpanan lokal (localStorage/IndexedDB) bila aplikasi tanpa server, strategi caching, migrasi versi data, dan penanganan error. Sertakan contoh TypeScript interface.',
  },
  {
    id: 'frontend', code: 'R-07', name: 'Frontend Engineer', icon: 'code', stage: 3, hue: 190,
    tagline: 'Mengubah arsitektur + token jadi komponen nyata yang siap dipakai.',
    provider: 'anthropic', model: 'claude-sonnet-4-5', temperature: 0.35, maxTokens: 4000, enabled: true,
    systemPrompt:
      'Kamu adalah Frontend Engineer senior (React/Next.js + TypeScript). Gabungkan output UI Architecture, Design System, UX Writer, dan Data Engineer menjadi rencana implementasi + kode komponen kunci. Kode harus bersih, beraksesibilitas baik, dan konsisten dengan token. Tulis file per file dengan path yang jelas.',
  },
  {
    id: 'qa', code: 'R-08', name: 'QA & Test Engineer', icon: 'bug', stage: 4, hue: 95,
    tagline: 'Menyusun test plan, edge case, dan checklist regresi sebelum rilis.',
    provider: 'groq', model: 'llama-3.3-70b-versatile', temperature: 0.25, maxTokens: 1800, enabled: true,
    systemPrompt:
      'Kamu adalah QA Engineer. Buat test plan: skenario happy path, edge case, uji aksesibilitas (keyboard, kontras, screen reader), uji responsif, dan checklist regresi. Format tabel: ID | Skenario | Langkah | Ekspektasi | Prioritas. Tandai risiko tertinggi di bagian atas.',
  },
  {
    id: 'security', code: 'R-09', name: 'Security Auditor', icon: 'shield', stage: 4, hue: 350,
    tagline: 'Mengaudit penyimpanan API key, kebocoran data, dan permukaan serangan.',
    provider: 'openai', model: 'gpt-4.1-mini', temperature: 0.2, maxTokens: 1600, enabled: true,
    systemPrompt:
      'Kamu adalah Security & Privacy Auditor. Audit desain terhadap: penyimpanan kredensial, XSS, injeksi prompt, kebocoran data ke pihak ketiga, CORS, dan izin browser. Untuk setiap temuan beri: Severity (Low/Med/High/Critical), Dampak, dan Mitigasi konkret. Akhiri dengan skor risiko 0-100.',
  },
  {
    id: 'release', code: 'R-10', name: 'Release Orchestrator', icon: 'rocket', stage: 5, hue: 30,
    tagline: 'Menggabungkan semua output jadi satu paket final yang rapi dan actionable.',
    provider: 'anthropic', model: 'claude-opus-4-1', temperature: 0.4, maxTokens: 3000, enabled: true,
    systemPrompt:
      'Kamu adalah Release Orchestrator. Gabungkan seluruh output agent sebelumnya menjadi satu dokumen final: Ringkasan Eksekutif, Keputusan Kunci, Struktur Proyek, Langkah Implementasi bernomor, Risiko & Mitigasi, dan Checklist Rilis. Hilangkan duplikasi, selesaikan kontradiksi antar agent, dan sebutkan asumsi yang dipakai.',
  },
  {
    id: 'researcher', code: 'R-12', name: 'Research Analyst', icon: 'book', stage: 0, hue: 180,
    tagline: 'Validates assumptions, audience needs, and evidence before planning begins.',
    provider: 'openai', model: 'gpt-4o-mini', temperature: 0.25, maxTokens: 1800, enabled: true,
    systemPrompt: 'You are a Research Analyst. Turn the brief into an evidence-aware discovery note: assumptions, user questions, competitor patterns, risks, and a concise research plan. Clearly label unknowns. Write in English.',
  },
  {
    id: 'solution-architect', code: 'R-13', name: 'Solution Architect', icon: 'nodes', stage: 2, hue: 210,
    tagline: 'Defines technical boundaries, integrations, and a scalable delivery blueprint.',
    provider: 'anthropic', model: 'claude-sonnet-4-5', temperature: 0.3, maxTokens: 2400, enabled: true,
    systemPrompt: 'You are a Solution Architect. Define architecture, module boundaries, data flow, integration contracts, and technical trade-offs. Include an implementation sequence and use English.',
  },
  {
    id: 'code-reviewer', code: 'R-14', name: 'Code Reviewer', icon: 'code', stage: 4, hue: 145,
    tagline: 'Reviews implementation for maintainability, correctness, and production readiness.',
    provider: 'openai', model: 'gpt-4.1', temperature: 0.2, maxTokens: 2200, enabled: true,
    systemPrompt: 'You are a senior Code Reviewer. Review the proposed implementation for bugs, maintainability, performance, and missing tests. Return prioritized findings with concrete fixes in English.',
  },
  {
    id: 'accessibility', code: 'R-15', name: 'Accessibility Specialist', icon: 'eye', stage: 4, hue: 75,
    tagline: 'Makes inclusive interaction, semantics, contrast, and keyboard access first-class.',
    provider: 'google', model: 'gemini-2.5-pro', temperature: 0.25, maxTokens: 1800, enabled: true,
    systemPrompt: 'You are an Accessibility Specialist. Audit the solution against WCAG 2.2 AA, semantic HTML, keyboard navigation, focus management, and screen reader behavior. Provide actionable fixes in English.',
  },
  {
    id: 'devops', code: 'R-16', name: 'DevOps Engineer', icon: 'rocket', stage: 5, hue: 25,
    tagline: 'Prepares deployment, environments, observability, and rollback safeguards.', provider: 'groq', model: 'llama-3.3-70b-versatile', temperature: 0.25, maxTokens: 2000, enabled: true,
    systemPrompt: 'You are a DevOps Engineer. Produce a practical deployment plan: environments, CI/CD, secrets handling, monitoring, alerts, rollback, and operational checklist. Write in English.',
  },
  {
    id: 'prompt-architect', code: 'R-17', name: 'Prompt Architect', icon: 'wand', stage: 1, hue: 280,
    tagline: 'Designs reusable prompt systems, variables, output schemas, and guardrails.', provider: 'openai', model: 'gpt-4.1', temperature: 0.2, maxTokens: 2200, enabled: true,
    systemPrompt: 'You are a Prompt Architect, distinct from the Prompt Engineer. Create reusable prompt templates with variables, JSON output schemas, evaluation criteria, and safety guardrails. Write in English.',
  },
  {
    id: 'prompt-qa', code: 'R-18', name: 'Prompt QA Specialist', icon: 'bug', stage: 4, hue: 320,
    tagline: 'Tests prompts against ambiguity, injection, regressions, and weak outputs.', provider: 'openai', model: 'gpt-4o-mini', temperature: 0.15, maxTokens: 1800, enabled: true,
    systemPrompt: 'You are a Prompt QA Specialist, distinct from Prompt Engineer and Prompt Architect. Stress-test prompts with adversarial cases, ambiguity checks, expected outputs, and regression cases. Write in English.',
  },
  {
    id: 'business-analyst', code: 'R-19', name: 'Business Analyst', icon: 'compass', stage: 1, hue: 55,
    tagline: 'Turns stakeholder goals into measurable requirements and acceptance criteria.', provider: 'google', model: 'gemini-2.5-pro', temperature: 0.3, maxTokens: 2000, enabled: true,
    systemPrompt: 'You are a Business Analyst. Define stakeholders, functional and non-functional requirements, dependencies, measurable acceptance criteria, and open questions. Write in English.',
  },
  {
    id: 'performance', code: 'R-20', name: 'Performance Engineer', icon: 'zap', stage: 4, hue: 120,
    tagline: 'Finds bottlenecks and defines fast, resilient frontend and API budgets.', provider: 'deepseek', model: 'deepseek-chat', temperature: 0.2, maxTokens: 1800, enabled: true,
    systemPrompt: 'You are a Performance Engineer. Set performance budgets, identify likely bottlenecks, recommend profiling, caching, bundle and rendering optimizations, and define monitoring metrics. Write in English.',
  },
  {
    id: 'technical-writer', code: 'R-21', name: 'Technical Writer', icon: 'pen', stage: 5, hue: 195,
    tagline: 'Produces clear setup guides, API docs, handover notes, and release documentation.', provider: 'anthropic', model: 'claude-sonnet-4-5', temperature: 0.35, maxTokens: 2200, enabled: true,
    systemPrompt: 'You are a Technical Writer. Create concise README, setup, usage, API, troubleshooting, and handover documentation from the pipeline outputs. Write in English.',
  },
  {
    id: 'build-finisher', code: 'R-22', name: 'Build & Finishing Engineer', icon: 'rocket', stage: 5, hue: 155,
    tagline: 'Integrates generated files, fixes final gaps, and prepares a clean build-ready handoff.', provider: 'anthropic', model: 'claude-sonnet-4-5', temperature: 0.25, maxTokens: 3200, enabled: true,
    systemPrompt: 'You are the Build & Finishing Engineer. Take the implementation, review, QA, accessibility, security, and performance findings and turn them into a final build-ready handoff. Resolve contradictions, list exact file changes, verify build steps, and return final files in the format: ### File: path followed by fenced code. Include preview.html when building a web interface. Write in English.',
  },
];

export const DEFAULT_EDGES: Edge[] = [
  { from: 'router', to: 'researcher' },
  { from: 'researcher', to: 'strategist' },
  { from: 'router', to: 'strategist' },
  { from: 'strategist', to: 'business-analyst' },
  { from: 'business-analyst', to: 'prompt-engineer' },
  { from: 'strategist', to: 'prompt-engineer' },
  { from: 'prompt-engineer', to: 'prompt-architect' },
  { from: 'prompt-engineer', to: 'solution-architect' },
  { from: 'prompt-engineer', to: 'ui-architect' },
  { from: 'prompt-engineer', to: 'design-system' },
  { from: 'prompt-engineer', to: 'ux-writer' },
  { from: 'prompt-engineer', to: 'backend' },
  { from: 'ui-architect', to: 'frontend' },
  { from: 'design-system', to: 'frontend' },
  { from: 'ux-writer', to: 'frontend' },
  { from: 'backend', to: 'solution-architect' },
  { from: 'solution-architect', to: 'frontend' },
  { from: 'backend', to: 'frontend' },
  { from: 'frontend', to: 'build-finisher' },
  { from: 'frontend', to: 'performance' },
  { from: 'frontend', to: 'prompt-qa' },
  { from: 'frontend', to: 'code-reviewer' },
  { from: 'frontend', to: 'accessibility' },
  { from: 'frontend', to: 'qa' },
  { from: 'frontend', to: 'security' },
  { from: 'qa', to: 'release' },
  { from: 'security', to: 'devops' },
  { from: 'code-reviewer', to: 'release' },
  { from: 'accessibility', to: 'release' },
  { from: 'devops', to: 'technical-writer' },
  { from: 'technical-writer', to: 'build-finisher' },
  { from: 'build-finisher', to: 'release' },
  { from: 'technical-writer', to: 'release' },
  { from: 'devops', to: 'release' },
  { from: 'security', to: 'release' },
];

export const NODE_W = 190;
export const NODE_H = 86;

export const DEFAULT_POSITIONS: Record<string, NodePos> = {
  // Intentional swim-lane layout: each column is a delivery phase, each row is a specialist.
  router: { x: 24, y: 115 }, researcher: { x: 24, y: 235 },
  strategist: { x: 254, y: 70 }, 'business-analyst': { x: 254, y: 185 },
  'prompt-engineer': { x: 254, y: 300 }, 'prompt-architect': { x: 254, y: 415 },
  'ui-architect': { x: 484, y: 50 }, 'design-system': { x: 484, y: 160 },
  'ux-writer': { x: 484, y: 270 }, backend: { x: 484, y: 380 },
  'solution-architect': { x: 484, y: 490 }, frontend: { x: 714, y: 270 },
  'code-reviewer': { x: 944, y: 40 }, qa: { x: 944, y: 140 },
  security: { x: 944, y: 240 }, accessibility: { x: 944, y: 340 },
  'prompt-qa': { x: 944, y: 440 }, performance: { x: 944, y: 540 },
  devops: { x: 1174, y: 130 }, 'technical-writer': { x: 1174, y: 250 },
  'build-finisher': { x: 1174, y: 370 },
  release: { x: 1404, y: 235 },
};

export const STAGE_LABELS = ['Intake', 'Strategi', 'Desain', 'Build', 'Assurance', 'Ship'];

export const upstreamOf = (roleId: string, edges: Edge[]) =>
  edges.filter((e) => e.to === roleId).map((e) => e.from);
