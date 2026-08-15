# Dua Kartu: Input + Hasil — Design

**Tanggal:** 2026-08-15
**Status:** Disetujui user (layout berdampingan, auto-copy pendekatan B)
**Aplikasi:** Studio Denah (Vite + React 19 + TS, dark flat corporate)

## Tujuan

Ubah dari 1 kartu (textarea + toolbar) menjadi 2 kartu: **Input** dan **Hasil**.
Kartu hasil menampilkan pratinjau live hasil format, dan saat user paste ke
input, hasil terformat langsung ter-copy ke clipboard. Tombol Salin tetap ada
sebagai fallback manual.

## Keputusan user

- Layout: **berdampingan 2 kolom** (desktop), menumpuk (mobile)
- Auto-copy saat paste: **B** — hasil penuh setelah insert di posisi kursor
  (clipboard selalu identik dengan isi kartu hasil)
- Tanpa toggle baru, tanpa file baru

## Layout & komponen (hanya `src/components/Formatter.tsx`)

- Wadah: `grid gap-6 md:grid-cols-2` — mobile stack, ≥768px berdampingan.
  Lebar wadah: `max-w-3xl` → `max-w-5xl`.
- 2 kartu dengan gaya identik dengan kartu sekarang (rounded-md border-line
  bg-surface/70 backdrop-blur-md shadow 0.35, p-6 sm:p-8, tinggi sejajar via
  grid stretch).
- **Kartu Input:** header "Input" + tombol **Hapus** (tidak berubah) → textarea
  (tidak berubah: min-h-[320px], studio-scroll, placeholder).
- **Kartu Hasil:** header "Hasil" + **ModeDropdown** (dipindah ke sini) →
  textarea **read-only** (min-h-[320px], studio-scroll, selectable) → tombol
  **Salin → CorelDraw (n)** (full-width, tidak berubah).
- Placeholder panel hasil saat kosong: "Hasil format akan muncul di sini".

## Perilaku & alur data

- **Pratinjau live:** kartu hasil = derived state. `lines` dihitung dari
  `input` + `mode` setiap render:
  `split('\n') → stripPrefix → filter(Boolean) → fixAddressTypos → applyCase(mode)`.
  Nilai panel hasil = `lines.join('\n')`.
- **Auto-copy saat paste (B):** handler `onPaste` pada textarea input:
  1. `text = e.clipboardData.getData('text')`
  2. `merged = input.slice(0, selectionStart) + text + input.slice(selectionEnd)`
     — tanpa `preventDefault`; paste native tetap berjalan dan `onChange`
     memperbarui state (string gabungan sama → invariant terjaga)
  3. Hitung `fullLines` dari `merged` (fungsi murni, sinkron) →
     `navigator.clipboard.writeText(fullLines.join('\n'))` di dalam handler
     (paste = user gesture → izin clipboard valid)
  4. Sukses → state `copied` (Salin tampil "Disalin" + hijau 2 detik);
     gagal → `copyError` ("Gagal nyalin")
  5. Guard: `merged` tanpa baris → tidak copy
- **Invariant:** clipboard === isi kartu hasil (keduanya dari string yang sama).
- **Salin manual:** perilaku tidak berubah (fallback).
- **State/error handling:** reuse `copied`/`copyError` + auto-clear 2s +
  `aria-live` — tidak ada state baru.

## Verifikasi

- `npx tsc -b --force` exit 0, `npm run build` PASS
- Live: paste multi-baris → kartu hasil terformat, clipboard identik dengan
  isi kartu hasil; paste di tengah input terisi → clipboard = hasil penuh
  (termasuk bagian lama); ganti mode → hasil & clipboard ikut; Hapus →
  kedua kartu kosong; Ctrl+V keyboard jalan; 0 console errors
- Mobile 390px: kartu menumpuk tanpa overflow

## File

- Edit: `src/components/Formatter.tsx` (grid wrapper + kartu hasil + onPaste)
