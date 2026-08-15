# Desain: Studio Denah — Redesign Full-Viewport + Gimmick

Tanggal: 2026-08-15
Status: Disetujui (bagian 1-4 dikonfirmasi user)

## Ringkasan

Redesign halaman Denah Formatter dari card kecil di tengah menjadi workspace
"Studio Denah" yang memenuhi layar desktop, dengan styling premium
(glassmorphism + glow) dan gimmick menghibur: mascot pensil animasi, pesan
sarkastik dinamis, confetti saat salin, dan easter egg rainbow mode.

Constraint: **zero-dependency** (tanpa library baru; confetti & animasi murni
CSS + React state + emoji/CSS art). Tetap TypeScript + Tailwind.

## 1. Struktur & Tata Letak

- Container `h-screen` flex column, `p-6`, `max-w-[1400px] mx-auto`.
- **Header** (`h-14`): glassmorphism `bg-white/5 backdrop-blur-xl border-white/10`,
  rounded. Kiri: mascot pensil + judul "Studio Denah". Kanan: statistik
  (jumlah baris valid, jumlah kata, mode aktif).
- **Main grid**: `flex-1 grid grid-cols-2 gap-6 min-h-0` — kedua kolom `h-full`.
  Stack ke 1 kolom di bawah `lg` (dengan scroll).
- **Kolom input**: label + textarea `h-full resize-none` (min-h 300px) +
  pill bar mode (Huruf Depan Kapital / SEMUA BESAR / semua kecil / Apa Adanya).
- **Kolom hasil**: panel abu gelap rounded, isi `overflow-y-auto h-full`,
  tombol "Salin → CorelDraw" besar di bawah.
- **Status bar** (`h-10`): pesan sarkastik dinamis + indikator mode aktif.

## 2. Sistem Visual

- Palet: navy gelap `#0a0e1f` → `#101a3a` gradien radial background;
  aksen biru elektrik `#3b82f6` → `#60a5fa` gradien; teks `#e2e8f0` / muted `#94a3b8`.
- Glassmorphism pada semua panel; tombol Salin `shadow-[0_0_30px_rgba(59,130,246,0.4)]`
  + glow makin terang saat hover + `active:scale-95`.
- `font-mono` untuk angka/statistik; judul `text-2xl font-semibold tracking-tight`.
- Mode pills beranimasi, focus ring biru glow, scrollbar kustom tipis.
- Responsive: ≥`lg` grid 2 kolom penuh tinggi; <`lg` stack.

## 3. Gimmick

### Mascot pensil (Pencil.tsx)
Dibangun CSS: badan kuning, ujung segitiga runcing, karet penghapus, mata.
Reaksi per kondisi:
- Idle: bob pelan, mata berkedip.
- Typing: menulis cepat (miring + getar ritmis) saat input berubah.
- Kosong: layu (miring lesu, keabuan).
- Setelah salin: lompat + putar 360°.

### Pesan sarkastik dinamis (StatusBar.tsx)
- Kosong: "Males nih, isi dulu dong…" / "Pensil ini laper, kasih makan teks."
- 1-2 baris: "Cuma segitu? Ayo, malu sama pensil ini."
- >20 baris: "Wah banyak juga. Semangat ngetiknya."
- Setelah salin (random): "Terkirim! CorelDraw nangis bahagia." / "Beres. Pensil ini layak naik gaji."
- Pool random untuk idle.
- Copy gagal: "Gagal nyalin. Coba lagi ya." + pensil sedih.

### Confetti (Confetti.tsx)
~60 partikel div (biru/cyan/kuning/pink/putih) meledak dari titik tombol,
CSS keyframe jatuh + fade, dihapus dari DOM setelah ~1.5s. Pensil melompat
bersamaan.

### Easter egg
Klik pensil 7× cepat → Rainbow Mode 10 detik: border & glow card berputar
pelangi (`hue-rotate` CSS), pensil pelangi, status bar "MODE PELANGI! 🌈".
Bisa diulang.

### Statistik live header
Jumlah baris valid, jumlah kata, mode aktif.

## 4. Arsitektur Kode

```
src/
├── app/
│   ├── globals.css        ← + keyframes (confetti, pensil, rainbow)
│   ├── layout.tsx         ← metadata update
│   └── page.tsx           ← layout full-viewport, panel glass
└── components/
    ├── Formatter.tsx      ← state utama + pickMessage (refactor)
    ├── Pencil.tsx         ← mascot + reaksi (prop mood) + onEasterEgg
    ├── StatusBar.tsx      ← pesan sarkastik
    └── Confetti.tsx       ← partikel + cleanup
```

Data flow:
- `Formatter` memegang `input`, `mode`, `copied`, `rainbowMode`, dan
  `pencilMood: 'idle' | 'typing' | 'happy' | 'sad'`.
  Mood pensil bukan state turunan murni: saat `onChange` textarea, mood
  diset `'typing'` lalu `setTimeout` (~800ms) kembali ke `'idle'`;
  setelah copy sukses `'happy'` (2 detik); saat kosong/salah `'sad'`.
- `Confetti` dipicu event copy; partikel dibersihkan via setTimeout.
- `Pencil` menerima prop `mood` + `onEasterEgg` (7 klik cepat) dan
  `rainbow` (boolean).
- `StatusBar` menerima pesan dari `pickMessage(state)`.

Edge handling:
- Clipboard `.catch()` → pesan gagal + pensil sedih.
- Input kosong saat Salin → tombol disabled + pesan sarkastik.
- Partikel confetti tidak menumpuk (cleanup DOM).
- `prefers-reduced-motion`: gimmick animasi dimatikan.

## Bug fix bawaan (dari review sebelumnya)

- `navigator.clipboard` tanpa `.catch()` → tambahkan.
- `grid-cols-2` tanpa breakpoint → `grid-cols-1 lg:grid-cols-2`.
- Mode pills tanpa `aria-pressed`.
- `<label>` tidak terhubung ke textarea (`htmlFor`/`id`).

## Lingkup non-tujuan (YAGNI)

- Tidak menambah library baru.
- Tidak mengubah logika format (regex stripPrefix/toTitleCase) kecuali bug
  yang memengaruhi kelayakan; behavior format tetap sama.
- Tidak menambah fitur baru (upload gambar, dsb.).
