# Dua Kartu Input + Hasil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ubah Formatter dari 1 kartu menjadi 2 kartu (Input + Hasil) dengan pratinjau live, auto-copy saat paste (pendekatan B), dan Salin manual sebagai fallback.

**Architecture:** Hanya mengubah `src/components/Formatter.tsx` — grid wrapper 2 kolom (md+) dengan dua kartu bergaya sama; kartu hasil = derived state dari pipeline yang sudah ada (`split → stripPrefix → filter(Boolean) → fixAddressTypos → applyCase(mode)`); auto-copy di-hitung sinkron dari string gabungan (input + teks paste di posisi kursor) dengan fungsi murni yang sama, sehingga clipboard selalu identik dengan isi kartu hasil.

**Tech Stack:** Vite + React 19 + TypeScript + Tailwind v3. Dev server: `http://localhost:5173` (HMR). Alias `@` → `./src`.

## Global Constraints

- Hanya `src/components/Formatter.tsx` yang diubah; tidak ada file baru.
- Gaya kartu dipertahankan: `rounded-md border border-line bg-surface/70 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8`.
- Pipeline tidak berubah: `split('\n') → stripPrefix → filter(Boolean) → fixAddressTypos → applyCase(mode)`.
- Tidak ada state baru; reuse `copied`/`copyError` + auto-clear 2 detik + `aria-live="polite"` pada tombol Salin.
- Tidak ada emoji; ikon tetap SVG (CheckIcon/ChevronDownIcon).
- Komit pesan mengikuti gaya repo: `feat: ...`.

---

### Task 1: Grid 2 kartu (Input + Hasil, pratinjau live)

**Files:**
- Modify: `src/components/Formatter.tsx`

**Interfaces:**
- Consumes: `fixAddressTypos` dari `@/lib/typoFix` (sudah ada), `ModeDropdown`, `CheckIcon`, `ChevronDownIcon` (sudah ada di file).
- Produces: struktur JSX dua kartu; state `input`, `mode`, `copied`, `copyError` tetap; turunan `lines` dipakai Task 2.

- [ ] **Step 1: Tambah helper `formatLines` dan ganti elemen kartu tunggal dengan grid 2 kartu**

Tambahkan helper di atas komponen `Formatter` (dekat `applyCase`):

```tsx
function formatLines(raw: string, mode: CaseMode): string[] {
  return raw
    .split('\n')
    .map(stripPrefix)
    .filter(Boolean)
    .map(fixAddressTypos)
    .map((l) => applyCase(l, mode))
}
```

Di dalam komponen, ganti definisi `lines` menjadi:

```tsx
const lines: string[] = formatLines(input, mode)
```

```tsx
return (
  <div className="card-enter w-full max-w-5xl">
    <div className="grid gap-6 md:grid-cols-2">
      {/* ===== Kartu Input ===== */}
      <section className="flex flex-col rounded-md border border-line bg-surface/70 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <label htmlFor="denah-input" className="text-sm font-medium tracking-wide text-muted">
            Input
          </label>
          <button
            type="button"
            onClick={() => setInput('')}
            disabled={!input.trim()}
            className="rounded-sm border-[1.5px] border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition-colors enabled:hover:border-danger enabled:hover:bg-danger/10 enabled:hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hapus
          </button>
        </div>
        <textarea
          id="denah-input"
          value={input}
          onChange={handleInputChange}
          placeholder="Tulis atau tempel daftar alamat di sini, satu per baris"
          className="studio-scroll min-h-[320px] flex-1 w-full resize-none rounded-sm border border-line-strong bg-surface p-4 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-surface"
        />
      </section>

      {/* ===== Kartu Hasil ===== */}
      <section className="flex flex-col rounded-md border border-line bg-surface/70 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm font-medium tracking-wide text-muted">Hasil</span>
          <div className="w-full sm:w-auto sm:shrink-0">
            <ModeDropdown value={mode} onChange={setMode} />
          </div>
        </div>
        <textarea
          id="denah-result"
          readOnly
          value={lines.join('\n')}
          placeholder="Hasil format akan muncul di sini"
          className="studio-scroll min-h-[320px] flex-1 w-full resize-none rounded-sm border border-line-strong bg-surface p-4 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-surface"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!lines.length}
            aria-live="polite"
            className={`flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-sm px-4 text-sm font-semibold text-white transition-[transform,box-shadow,background-color] duration-200 enabled:hover:scale-[1.03] enabled:hover:shadow-[0_2px_8px_rgba(0,0,0,0.25)] active:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${
              copied
                ? 'bg-success'
                : copyError
                  ? 'bg-danger'
                  : 'bg-brand enabled:hover:bg-brand-dark'
            }`}
          >
            {copied ? (
              <>
                <CheckIcon />
                Disalin
              </>
            ) : copyError ? (
              'Gagal nyalin'
            ) : (
              `Salin → CorelDraw${lines.length ? ` (${lines.length})` : ''}`
            )}
          </button>
        </div>
      </section>
    </div>
  </div>
)
```

Pertahankan: `handleInputChange`, `handleCopy`, state `input`/`mode`/`copied`/`copyError`, dan definisi `lines` (kini via `formatLines`). Ganti seluruh JSX di `return` lama (kartu tunggal: label + textarea + ModeDropdown + tombol bawah) dengan grid 2 kartu di atas. Catatan: `ModeDropdown` kini berada di header kartu hasil; pindahkan seluruh bloknya (komponen tidak diubah isinya — hanya lokasi render). Struktur baris tombol Salin dipindah utuh ke footer kartu hasil.

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --force`
Expected: exit 0.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Verifikasi live (browser)**

Dev server `http://localhost:5173` (HMR otomatis):
- Dua kartu berdampingan desktop (≥768px), menumpuk di 390px, tanpa overflow horizontal
- Kartu hasil menampilkan pratinjau live: ketik `1. omah kampung` → hasil `Omah\nKampung` (mode title)
- Ganti mode dropdown → hasil ikut berubah
- Hapus → kedua kartu kosong
- 0 console errors

- [ ] **Step 5: Commit**

```bash
git add src/components/Formatter.tsx
git -c user.name="dev" -c user.email="dev@local" commit -m "feat: dua kartu input + hasil (pratinjau live)"
```

---

### Task 2: Auto-copy saat paste (pendekatan B)

**Files:**
- Modify: `src/components/Formatter.tsx`

**Interfaces:**
- Consumes: state `input`, `mode`, `setCopied`, `setCopyError` dari Task 1; `lines` (turunan); `handleInputChange` (tetap, untuk update state setelah paste native).
- Produces: `handlePaste` — dipasang sebagai `onPaste` pada textarea input.

- [ ] **Step 1: Tambah handler `handlePaste`**

Di dalam komponen `Formatter` (di dekat `handleCopy`), tambah:

```tsx
function handlePaste(e: ReactClipboardEvent<HTMLTextAreaElement>) {
  const text = e.clipboardData.getData('text')
  const start = e.currentTarget.selectionStart ?? 0
  const end = e.currentTarget.selectionEnd ?? start
  const merged = input.slice(0, start) + text + input.slice(end)
  const fullLines = formatLines(merged, mode)
  if (!fullLines.length) return
  navigator.clipboard
    .writeText(fullLines.join('\n'))
    .then(() => {
      setCopied(true)
      setCopyError(false)
      window.setTimeout(() => setCopied(false), 2000)
    })
    .catch(() => {
      setCopyError(true)
      window.setTimeout(() => setCopyError(false), 2000)
    })
}
```

Tambahkan `ReactClipboardEvent` ke import react type yang sudah ada:
```tsx
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
```

**Penting — jangan `preventDefault`:** paste native tetap berjalan; `onChange` akan memperbarui `input` dengan string gabungan yang sama sehingga invariant *clipboard === isi kartu hasil* terjaga.

- [ ] **Step 2: Pasang handler di textarea input**

Pada textarea kartu Input (yang ber-`id="denah-input"`), tambahkan prop:
```tsx
onPaste={handlePaste}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b --force`
Expected: exit 0.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Verifikasi live (browser)**

- Paste multi-baris (`1. JLN merdeka no 5` + baris lain) ke textarea kosong → tombol Salin jadi "Disalin" + hijau 2 detik; clipboard berisi hasil format penuh dan IDENTIK dengan isi kartu hasil (mode title): `Jalan Merdeka No 5\n…`
- Paste di tengah input yang sudah terisi → clipboard = hasil penuh (termasuk bagian lama), identik dengan kartu hasil
- Ganti mode → hasil & clipboard ikut (manual Salin kembali "Salin → CorelDraw (n)")
- Hapus → kartu hasil kosong, placeholder tampil
- 0 console errors

- [ ] **Step 6: Commit**

```bash
git add src/components/Formatter.tsx
git -c user.name="dev" -c user.email="dev@local" commit -m "feat: auto-copy hasil saat paste ke input"
```

---

## Self-Review

- **Spec coverage:** layout 2 kartu (Task 1) ✓; ModeDropdown pindah ke kartu hasil (Task 1) ✓; read-only textarea + placeholder (Task 1) ✓; pratinjau live (Task 1, derived `lines`) ✓; auto-copy pendekatan B insert-di-kursor + invariant clipboard (Task 2) ✓; guard tanpa baris (Task 2) ✓; Salin manual fallback (Task 1, tombol dipertahankan) ✓; max-w-5xl + grid md:grid-cols-2 (Task 1) ✓; tanpa file baru, hanya Formatter.tsx (Global Constraints) ✓.
- **Placeholder scan:** tidak ada TBD/TODO; semua langkah berisi kode konkret. ✓
- **Type consistency:** `handlePaste` menerima `ReactClipboardEvent<HTMLTextAreaElement>` — nama import konsisten dengan `ReactKeyboardEvent` yang sudah ada; `lines`, `input`, `mode`, `setCopied`, `setCopyError` merujuk state yang sama di kedua task; helper `formatLines(raw, mode)` didefinisikan Task 1 (Step 1) dan dipakai Task 1 (`lines`) serta Task 2 (`handlePaste`) — tanpa duplikasi pipeline. ✓
