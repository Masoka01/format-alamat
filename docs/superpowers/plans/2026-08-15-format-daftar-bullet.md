# Format Daftar Otomatis (Bullet + Spasi Titik) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Semua baris ber-awalan daftar otomatis jadi bullet `- `, dengan spasi setelah titik/koma (kecuali gelar akademik), tanpa perubahan UI.

**Architecture:** Modul murni baru `src/lib/listFormat.ts` mengekspor `formatListLine(line)` (buang karakter tak terlihat → ganti awalan daftar dengan `- ` → spasi titik/koma dengan perlindungan gelar → trim). `Formatter.tsx` menghapus `stripPrefix` dan memakai `formatListLine` di `formatLines`. Pipeline lain (typo, case, auto-copy) tidak berubah.

**Tech Stack:** Vite + React 19 + TypeScript (no JSX di modul baru; test via `node --experimental-strip-types` — repo tidak punya test framework).

## Global Constraints

- Spesifikasi: `docs/superpowers/specs/2026-08-15-format-daftar-bullet-design.md`
- Tanpa dependensi baru; tanpa perubahan UI; tanpa toggle (selalu otomatis).
- Tanpa emoji; teks UI tetap Bahasa Indonesia.
- Commit: `git -c user.name="dev" -c user.email="dev@local" commit -m "<msg>"`; pesan `feat:` / `fix:` / `docs:`.
- Verifikasi wajib sebelum klaim selesai: `npx tsc -b --force` exit 0, `npm run build` PASS.
- Daftar gelar sapaan (kata sebelum titik → selalu spasi), case-insensitive: `alm, almarhum, bpk, bapak, ibu, h, hj, ust, ustd, ustadz, dr, dra, ir, sdr, sdri, tn, ny, nn, kh, habib, gus`
- Daftar akhiran gelar akademik (rapat), case-insensitive: `pd, ip, sc, si, kom, ag, hum, fil, fis, kes, ak, apt, ars, t, h, e, s, a, d, g, k, i, m, p, b, mt, mm, mba, eng, spd, msi, mkom, ba, ma, phd`

---

### Task 1: Modul `listFormat.ts` — `formatListLine`

**Files:**
- Create: `src/lib/listFormat.ts`

**Interfaces:**
- Consumes: (none)
- Produces: `formatListLine(line: string): string` — konstanta `GELAR_SAPAAN`, `AKHIRAN_GELAR_AKADEMIK` (tidak diekspor, internal).

- [ ] **Step 1: Tulis test gagal (skrip assert node)**

Jalankan (harap GAGAL: modul belum ada):

```bash
node --experimental-strip-types --input-type=module -e "
import { formatListLine } from './src/lib/listFormat.ts'
const kasus = [
  ['1. Jakarta', '- Jakarta'],
  ['2. legok', '- legok'],
  ['1. Keluarga Besar Alm. Bpk H.Ropa\x27i', '- Keluarga Besar Alm. Bpk H. Ropa\x27i'],
  ['5. Bpk H. Tamtam Alamsyah,S.IP (Camat Cidahu)', '- Bpk H. Tamtam Alamsyah, S.IP (Camat Cidahu)'],
  ['2. H.Hasanudin S.Pd', '- H. Hasanudin S.Pd'],
  ['Turut mengundang mempelai wanita', 'Turut mengundang mempelai wanita'],
  ['Jl.Raya Sudirman No.5', 'Jl. Raya Sudirman No. 5'],
  ['Komp. Permata Indah RT.01/RW.02', 'Komp. Permata Indah RT. 01/RW. 02'],
  ['Alm.', 'Alm.'],
  ['1. \u2060Jakarta', '- Jakarta'],
  ['12. H. Wandi (RW)', '- H. Wandi (RW)'],
  ['\u2022 Keluarga Besar', '- Keluarga Besar'],
  ['M.Ali', 'M. Ali'],
  ['Ph.D', 'Ph.D'],
  ['1,5 km', '1,5 km'],
]
let gagal = 0
for (const [masukan, harapan] of kasus) {
  const hasil = formatListLine(masukan)
  if (hasil !== harapan) { console.error('GAGAL:', JSON.stringify(masukan), '\u2192', JSON.stringify(hasil), 'harap', JSON.stringify(harapan)); gagal++ }
}
console.log(gagal === 0 ? 'SEMUA PASS (' + kasus.length + ' kasus)' : 'GAGAL: ' + gagal + ' kasus')
process.exit(gagal === 0 ? 0 : 1)
"
```

Expected: FAIL — `Cannot find module .../src/lib/listFormat.ts`.

- [ ] **Step 2: Implementasi minimal**

Buat `src/lib/listFormat.ts`:

```ts
const GELAR_SAPAAN = new Set([
  'alm', 'almarhum', 'bpk', 'bapak', 'ibu', 'h', 'hj', 'ust', 'ustd', 'ustadz',
  'dr', 'dra', 'ir', 'sdr', 'sdri', 'tn', 'ny', 'nn', 'kh', 'habib', 'gus',
])

const AKHIRAN_GELAR_AKADEMIK = new Set([
  'pd', 'ip', 'sc', 'si', 'kom', 'ag', 'hum', 'fil', 'fis', 'kes', 'ak', 'apt',
  'ars', 't', 'h', 'e', 's', 'a', 'd', 'g', 'k', 'i', 'm', 'p', 'b', 'mt', 'mm',
  'mba', 'eng', 'spd', 'msi', 'mkom', 'ba', 'ma', 'phd',
])

const KARAKTER_TAK_TERLIHAT = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g
const AWALAN_DAFTAR = /^\s*(\d+[.)-]|[-•*])\s*/

/** Kata terpanjang sebelum titik (gelar sapaan) → selalu diberi spasi. */
function kataSebelumTitik(baris: string, i: number): string {
  let awal = i - 1
  while (awal >= 0 && /[A-Za-z]/.test(baris[awal])) awal--
  return baris.slice(awal + 1, i).toLowerCase()
}

/** Titik di antara huruf merupakan bagian gelar akademik → tetap rapat. */
function adalahGelarAkademik(baris: string, i: number): boolean {
  if (GELAR_SAPAAN.has(kataSebelumTitik(baris, i))) return false
  const cocok = /^[A-Za-z]+/.exec(baris.slice(i + 1))
  if (!cocok) return false
  return AKHIRAN_GELAR_AKADEMIK.has(cocok[0].toLowerCase())
}

/** Normalisasi satu baris daftar: bullet, spasi titik/koma, bersih dari karakter tak terlihat. */
export function formatListLine(line: string): string {
  const bersih = line
    .replace(KARAKTER_TAK_TERLIHAT, '')
    .replace(AWALAN_DAFTAR, '- ')
  let hasil = ''
  for (let i = 0; i < bersih.length; i++) {
    const ch = bersih[i]
    hasil += ch
    if (ch !== '.' && ch !== ',') continue
    const berikut = bersih[i + 1]
    if (berikut === undefined) continue
    if (ch === ',' && /[0-9]/.test(berikut)) continue // koma desimal
    if (!/[A-Za-z0-9]/.test(berikut)) continue
    if (ch === ',' || !adalahGelarAkademik(bersih, i)) hasil += ' '
  }
  return hasil.trim()
}
```

- [ ] **Step 3: Jalankan test — harus PASS**

Jalankan ulang perintah Step 1. Expected: `SEMUA PASS (15 kasus)` dan exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/lib/listFormat.ts
git -c user.name="dev" -c user.email="dev@local" commit -m "feat: modul formatListLine (bullet + spasi titik)"
```

---

### Task 2: Integrasi ke `Formatter.tsx`

**Files:**
- Modify: `src/components/Formatter.tsx:38-45` (hapus `stripPrefix`), `:42-49` (`formatLines`), `:9` (import)

**Interfaces:**
- Consumes: `formatListLine(line: string): string` dari Task 1 (`src/lib/listFormat.ts`)
- Produces: `formatLines(raw, mode)` tetap dengan tanda tangan sama (kompatibel dengan `lines`, `handlePaste`)

- [ ] **Step 1: Ubah Formatter.tsx**

1. Tambah import di baris 9 (setelah import `fixAddressTypos`):
   ```ts
   import { formatListLine } from '@/lib/listFormat'
   ```
2. Hapus seluruh fungsi `stripPrefix` (versi multi-baris yang berisi regex `KARAKTER_TAK_TERLIHAT` — fix WORD JOINER sudah pindah ke `formatListLine`; JANGAN duplikasi).
3. Ganti `formatLines`:
   ```ts
   function formatLines(raw: string, mode: CaseMode): string[] {
     return raw
       .split('\n')
       .map(formatListLine)
       .filter(Boolean)
       .map(fixAddressTypos)
       .map((l) => applyCase(l, mode))
   }
   ```

Tidak ada perubahan lain di file ini.

- [ ] **Step 2: Verifikasi statis**

```bash
npx tsc -b --force
```
Expected: exit 0. Lalu:
```bash
npm run build
```
Expected: PASS.

- [ ] **Step 3: Verifikasi live (Playwright, dev server http://localhost:5173)**

1. Isi `#denah-input` dengan data undangan (14 baris dari spec, bagian "Kriteria penerimaan") via native setter + event `input` (bukan paste sintetis — event sintetis tidak menyisipkan teks).
2. Baca `#denah-result`. Harus sama persis dengan blok "Kriteria penerimaan" di spec (judul tanpa bullet, semua baris bernomor jadi `- `, `S.IP`/`S.Pd` rapat, `H. Ropa'i`/`Alamsyah, S.IP` ber-spasi).
3. Ganti input dengan sample alamat: `1. omah kampung\n2. JLN merdeka` → result `- Omah Kampung\n- Jalan Merdeka` (bullet + typo + title case).
4. Regression WORD JOINER: input `1. \u2060Jakarta` → result `- Jakarta`.
5. Mode case: klik dropdown (button `aria-label="Mode huruf"`) → pilih "SEMUA BESAR" → result untuk `1. Jakarta` menjadi `- JAKARTA`; pilih "semua kecil" → `- jakarta`; kembali ke "Huruf Depan Kapital".
6. Console: 0 error.

- [ ] **Step 4: Commit**

```bash
git add src/components/Formatter.tsx
git -c user.name="dev" -c user.email="dev@local" commit -m "feat: format daftar otomatis (bullet + spasi titik)"
```
