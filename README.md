# Ziva Agent AI

**Router multi-agent 10 role — 100% lokal, tanpa server, tanpa backend.**

Satu brief dikirim ke sepuluh agent spesialis yang berjalan bertahap. Setiap role bebas
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

## Tujuh halaman

| Rute        | Isi                                                                    |
|-------------|------------------------------------------------------------------------|
| `/`         | Dashboard: status sistem, kesiapan key, orbit 10 role, aktivitas terakhir |
| `/roles`    | Konfigurasi 10 role: provider, model, temperature, max token, system prompt |
| `/workflow` | Editor kanvas: geser node, sambung/putus koneksi, rencana eksekusi      |
| `/run`      | Runner: brief, konsol langsung, kanvas status, hasil per agent          |
| `/keys`     | Manajer API key per provider + tes koneksi                              |
| `/history`  | Arsip 40 eksekusi terakhir beserta seluruh output                       |
| `/settings` | Tema, aksen, animasi, ekspor/impor JSON, hapus data                     |

---

## Sepuluh role

| Kode | Role | Tahap | Tugas |
|------|------|-------|-------|
| R-01 | Intake Router        | 0 Intake     | Memecah brief jadi objective, scope, constraint, metrik |
| R-02 | Product Strategist   | 1 Strategi   | PRD ringkas, prioritas MoSCoW, user story |
| R-03 | UI Architecture      | 2 Desain     | Sitemap, hierarki komponen, breakpoint, state matrix |
| R-04 | Design System        | 2 Desain     | Token warna/tipografi/spacing/motion + CSS variable |
| R-05 | UX Writer            | 2 Desain     | Microcopy, tone of voice, pesan error & empty state |
| R-06 | Data & API Engineer  | 2 Desain     | Model data, kontrak penyimpanan, TypeScript interface |
| R-07 | Frontend Engineer    | 3 Build      | Rencana implementasi + kode komponen kunci |
| R-08 | QA & Test Engineer   | 4 Assurance  | Test plan, edge case, aksesibilitas, checklist regresi |
| R-09 | Security Auditor     | 4 Assurance  | Audit kredensial, XSS, prompt injection, skor risiko |
| R-10 | Release Orchestrator | 5 Ship       | Menggabungkan semua output jadi satu paket final |

Alur bawaan: `R-01 → R-02 → (R-03, R-04, R-05, R-06) → R-07 → (R-08, R-09) → R-10`.
Role dalam satu tahap dieksekusi paralel. Semua sambungan bisa diubah di `/workflow`
(deteksi siklus otomatis).

---

## Memilih AI per role

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
| 1 · Penyedia AI | 11 penyedia, lengkap dengan penanda apakah API key-nya sudah terisi |
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
