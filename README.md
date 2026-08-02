# Ziva Agent AI

**22-role multi-agent workspace — 100% local, no server, no backend.**

One brief is sent through 22 specialist agents that run in stages. Setiap role bebas
memakai **provider dan model AI yang berbeda**, dengan **API key milikmu sendiri** yang
tersimpan hanya di browser (`localStorage`). Tidak ada API route, tidak ada database,
tidak ada data yang dikirim ke pihak ketiga selain provider yang kamu pilih sendiri.

---

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

Build statis murni (menghasilkan folder `out/` berisi HTML/CSS/JS saja):

```bash
npm run build
npm run start      # menyajikan folder out/ di http://localhost:3000
```

Folder `out/` bisa dibuka langsung lewat web server statis apa pun
(Nginx, `python -m http.server`, GitHub Pages, Netlify, USB flashdisk — bebas).

---

## Pages

| Rute        | Isi                                                                    |
|-------------|------------------------------------------------------------------------|
| `/`         | Dashboard: system status, key readiness, role overview, recent activity |
| `/roles`    | Configure 22 roles: provider, model, fallback model, temperature, tokens, and system prompt |
| `/workflow` | Editor kanvas: geser node, sambung/putus koneksi, rencana eksekusi      |
| `/run`      | Runner: brief, live console, stage status, per-agent results, and pipeline files          |
| `/keys`     | Manajer API key per provider + tes koneksi                              |
| `/history`  | Arsip 40 eksekusi terakhir beserta seluruh output                       |
| `/settings` | Tema, aksen, animasi, ekspor/impor JSON, hapus data                     |

---

## 22 specialist roles

| Code | Role | Stage | Responsibility |
|------|------|-------|----------------|
| R-01 | Intake Router | Intake | Extracts objective, scope, constraints, and success metrics. |
| R-12 | Research Analyst | Intake | Validates assumptions, audience needs, and research gaps. |
| R-02 | Product Strategist | Strategy | Produces a practical PRD, priorities, and user stories. |
| R-19 | Business Analyst | Strategy | Defines measurable requirements and acceptance criteria. |
| R-11 | Prompt Engineer | Strategy | Writes task-specific prompts for this pipeline run. |
| R-17 | Prompt Architect | Strategy | Designs reusable prompt systems, schemas, and guardrails. |
| R-03 | UI Architecture | Design | Defines sitemap, components, breakpoints, and UI states. |
| R-04 | Design System | Design | Defines tokens, typography, color, spacing, and motion. |
| R-05 | UX Writer | Design | Creates product copy, labels, and empty/error states. |
| R-06 | Data & API Engineer | Design | Designs data models, local storage, and API contracts. |
| R-13 | Solution Architect | Design | Defines technical boundaries, integrations, and delivery blueprint. |
| R-07 | Frontend Engineer | Build | Implements the frontend plan and key components. |
| R-14 | Code Reviewer | Assurance | Reviews code quality, correctness, and maintainability. |
| R-08 | QA & Test Engineer | Assurance | Builds test plans, edge cases, and regression checks. |
| R-09 | Security Auditor | Assurance | Audits credentials, XSS, injection, and privacy risks. |
| R-15 | Accessibility Specialist | Assurance | Audits WCAG, keyboard access, and semantic UI. |
| R-18 | Prompt QA Specialist | Assurance | Tests prompts for ambiguity, injection, and regressions. |
| R-20 | Performance Engineer | Assurance | Defines performance budgets and optimization work. |
| R-16 | DevOps Engineer | Ship | Prepares CI/CD, monitoring, secrets, and rollback plans. |
| R-21 | Technical Writer | Ship | Produces setup, API, handover, and troubleshooting docs. |
| R-22 | Build & Finishing Engineer | Ship | Integrates generated files and delivers a final build-ready handoff. |
| R-10 | Release Orchestrator | Ship | Consolidates all outputs into the final release package. |

The workflow is editable in `/workflow`. Roles in the same execution layer can run in parallel; cycle detection prevents invalid connections.

---

## Choosing AI per role

Setiap role memilih mesin AI-nya **sendiri-sendiri** — Frontend Engineer boleh pakai
Gemini, QA pakai Groq, Release pakai Claude, dan seterusnya.

Tiga jalan pintas ke pemilihnya:

1. **Dashboard** → klik kartu role mana pun (tombol *Pilih AI*) → katalog langsung terbuka.
2. **`/roles`** → tiap kartu punya panel **"Mesin AI role ini"**: dropdown *Penyedia AI* +
   combobox *Model*, plus tombol **Katalog AI** untuk tampilan penuh.
3. **`/workflow`** → klik sebuah node → panel kanan → tombol **Ganti**.

Katalog AI berjalan dua langkah:

| Langkah | Isi |
|---------|-----|
| 1 · Penyedia AI | 18 supported providers, lengkap dengan penanda apakah API key-nya sudah terisi |
| 2 · Model       | Daftar preset milik penyedia itu **atau ketik nama model sendiri** |

Contoh hasil akhir yang valid:

```
Intake Router        openai      gpt-4o-mini
UI Architecture      anthropic   claude-sonnet-4-5
Design System        google      gemini-2.5-pro
Frontend Engineer    google      gemini-2.5-flash
QA & Test Engineer   anthropic   claude-x-eksperimen-2027   ← model ketikan sendiri
Data & API Engineer  deepseek    deepseek-chat
```

---

## Provider yang didukung

OpenAI · Anthropic · Google Gemini · Groq · Mistral · OpenRouter · DeepSeek ·
xAI Grok · Together AI · Ollama (lokal, tanpa key) · **Custom endpoint** (OpenAI-compatible).

Model bisa **dipilih dari preset atau diketik manual** — combobox menerima nama model apa pun,
jadi model baru yang belum ada di daftar tetap bisa dipakai.

Tiga dialek API ditangani langsung dari browser:
`/chat/completions` (OpenAI-compatible), `/messages` (Anthropic), `:generateContent` (Gemini).

### Mode Simulasi
Belum punya API key? Runner otomatis memakai **mode simulasi** yang menghasilkan output contoh,
sehingga seluruh animasi dan alur kerja bisa dicoba tanpa biaya.

---

## Catatan keamanan

Karena aplikasi ini murni sisi-klien, API key ikut terlihat pada lalu lintas jaringan browser.
Gunakan key dengan kuota/izin terbatas dan hindari perangkat bersama. Berkas ekspor JSON
**berisi key dalam teks biasa** — simpan baik-baik. Semua data bisa dihapus total lewat
`/settings → Zona berbahaya`.

---

## Detail antarmuka

- **Semua kontrol dibuat sendiri** — dropdown, combobox, switch, slider, tab, modal, drawer,
  toast, tooltip, scrollbar, dan dialog konfirmasi. Tidak ada `<select>`, `alert()`,
  `confirm()`, atau `input[type=range]` bawaan browser.
- **Dot putih beranimasi** mengalir di sepanjang kabel bezier antar node (`<animateMotion>` SVG),
  melaju lebih cepat dan lebih terang saat konteks benar-benar sedang disalurkan.
- **Ornamen sudut SVG** (`CornerFrame`) membingkai tiap kartu dan menyala saat hover.
- **Scroll animation** berbasis `IntersectionObserver` + progress bar gradien di puncak halaman.
- **Full rounded**: radius 14–48 px, semua tombol berbentuk pil.
- **Light + dark + system**, lima warna aksen (Aurora, Ember, Mint, Violet, Ocean),
  tanpa kedip saat memuat.
- **Command palette** `⌘K` / `Ctrl+K` untuk lompat ke halaman, role, atau aksi.
- Ikon: satu set SVG stroke buatan sendiri. Font self-hosted (Plus Jakarta Sans + JetBrains Mono),
  tidak ada permintaan ke CDN mana pun.

## Struktur

```
src/
├─ app/                 7 rute + globals.css (design token)
├─ components/
│  ├─ icons/            set ikon SVG + logogram + CornerFrame
│  ├─ layout/           AppShell, Sidebar, Topbar, tema, command palette
│  ├─ ui/               Select, Combobox, Switch, Slider, Modal, Drawer, Toast, dll.
│  └─ workflow/         FlowCanvas (node draggable + kabel + dot animasi)
├─ lib/                 store (zustand+persist), engine (pemanggil provider), providers, roles, md
└─ types/
```

Stack: Next.js 15 (App Router, `output: 'export'`) · React 19 · TypeScript · Tailwind CSS v4 · Zustand.


---

## Copyright

© 2026 **Copyright by Rajxzdev**.
