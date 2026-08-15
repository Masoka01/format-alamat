# Format Daftar Otomatis (Bullet + Spasi Titik) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baris ber-awalan daftar otomatis jadi bullet — `- ` untuk daftar biasa, `• ` untuk daftar di bawah judul "Turut mengundang" — dengan spasi setelah titik/koma (kecuali gelar akademik), tanpa perubahan UI.

**Architecture:** Modul murni `src/lib/listFormat.ts` mengekspor `formatList(lines)` (deteksi section "Turut mengundang" lintas-baris → bullet `• `) dan `formatListLine(line, bullet?)` (buang karakter tak terlihat → ganti awalan daftar → spasi titik/koma dengan perlindungan gelar → trim). `Formatter.tsx` memakai `formatList` di `formatLines`. Pipeline lain (typo, case, auto-copy) tidak berubah. Bagian 1 (Task 1–3) SELESAI; Bagian 2 (Task 4–5) menambahkan bullet `•` (keputusan user 15-08-2026).

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

### Task 3: Normalisasi casing mode Title — `src/lib/caseTitle.ts`

**Latar**: keputusan user 15-08-2026 (setelah live check Task 2): mode Title harus menormalkan `rw` → `RW` dan gelar akademik ke bentuk baku (KBBI). `toTitleCase` lama (di `Formatter.tsx:26-28`) mengecilkan sisa huruf tiap token sehingga `S.IP` → `S.ip`, `(Camat Cidahu)` → `(camat Cidahu)`, `RT.01` → `Rt. 01`. Detail aturan: bagian "Normalisasi casing mode Title" di spec.

**Perubahan**:
1. File baru `src/lib/caseTitle.ts` — `toTitleCase` dipindah + ditingkatkan (aturan RT/RW, gelar baku tanpa/bartitik, kata biasa). Mengikuti pola `typoFix.ts`/`listFormat.ts`.
2. `src/components/Formatter.tsx`: hapus fungsi `toTitleCase` lokal, tambah `import { toTitleCase } from '@/lib/caseTitle'`. Tidak ada perubahan lain.

Kode modul (persis):

```ts
// src/lib/caseTitle.ts
// Normalisasi casing mode Title (keputusan user 15-08-2026):
// RT/RW → huruf besar; gelar akademik → bentuk baku; kata biasa → kapital-awal.

const GELAR_TANPA_TITIK: Record<string, string> = {
  spd: 'S.Pd',
  sip: 'S.IP',
  skom: 'S.Kom',
  ssi: 'S.Si',
  msc: 'M.Sc',
  phd: 'Ph.D',
  mba: 'MBA',
}

function bagianGelar(b: string): string {
  const k = b.toLowerCase()
  if (k === 'ip') return 'IP'
  if (k === 'mba') return 'MBA'
  return b.charAt(0).toUpperCase() + b.slice(1).toLowerCase()
}

function normalisasiToken(w: string): string {
  const imbuhanAwal = w.match(/^[^A-Za-z]*/)?.[0] ?? ''
  const imbuhanAkhir = w.match(/[^A-Za-z]*$/)?.[0] ?? ''
  const inti = w.slice(imbuhanAwal.length, imbuhanAkhir ? w.length - imbuhanAkhir.length : w.length)

  // 1) RT/RW (dengan atau tanpa titik)
  if (/^(rt|rw)\.?$/i.test(inti)) {
    return imbuhanAwal + inti.toUpperCase() + imbuhanAkhir
  }

  // 2) gelar tanpa titik
  const kunci = inti.toLowerCase()
  if (kunci in GELAR_TANPA_TITIK) {
    return imbuhanAwal + GELAR_TANPA_TITIK[kunci] + imbuhanAkhir
  }

  // 3) gelar bertitik: pola huruf.titik.huruf → bentuk baku
  if (kunci.includes('.')) {
    const bagian = inti.split('.')
    if (bagian.length >= 2 && bagian.every((b) => /^[A-Za-z]{1,5}$/.test(b))) {
      return imbuhanAwal + bagian.map(bagianGelar).join('.') + imbuhanAkhir
    }
  }

  // 4) kata biasa: huruf pertama kapital, sisanya kecil
  const huruf = inti.match(/[A-Za-z]/)
  if (!huruf || huruf.index === undefined) return w
  const intiBaru = inti.slice(0, huruf.index) + huruf[0].toUpperCase() + inti.slice(huruf.index + 1).toLowerCase()
  return imbuhanAwal + intiBaru + imbuhanAkhir
}

export function toTitleCase(str: string): string {
  return str.replace(/\S+/g, normalisasiToken)
}
```

**Step 1 — test** (sebelum modul dibuat: `ERR_MODULE_NOT_FOUND`; sesudah: `SEMUA PASS (30 kasus)`, exit 0):

```bash
node --experimental-strip-types --input-type=module -e "
import { toTitleCase } from './src/lib/caseTitle.ts'
const kasus = [
  ['rw', 'RW'], ['rt.', 'RT.'], ['(rw)', '(RW)'], ['01/rw.', '01/RW.'],
  ['spd', 'S.Pd'], ['sip', 'S.IP'], ['msc', 'M.Sc'], ['phd', 'Ph.D'], ['mba', 'MBA'],
  ['s.pd', 'S.Pd'], ['s.pd.', 'S.Pd.'], ['s.ip', 'S.IP'], ['S.IP', 'S.IP'],
  ['ph.d', 'Ph.D'], ['m.sc', 'M.Sc'], ['s.kom', 'S.Kom'], ['a.md', 'A.Md'],
  ['Alm.', 'Alm.'], ['alm.', 'Alm.'], ['Bpk.', 'Bpk.'], ['H.', 'H.'], ['No.', 'No.'],
  ['(camat cidahu)', '(Camat Cidahu)'], ['(kakak)', '(Kakak)'], ['(RT)', '(RT)'],
  ['omah', 'Omah'], ['JALAN', 'Jalan'], [\"Ropa'i\", \"Ropa'i\"], ['01', '01'],
  [\"Keluarga Besar Alm. Bpk H. Ropa'i\", \"Keluarga Besar Alm. Bpk H. Ropa'i\"],
]
let gagal = 0
for (const [input, harapan] of kasus) {
  const hasil = toTitleCase(input)
  if (hasil !== harapan) { gagal++; console.log('GAGAL:', JSON.stringify(input), '→', JSON.stringify(hasil), '(harapan', JSON.stringify(harapan) + ')') }
}
if (gagal === 0) console.log('SEMUA PASS (' + kasus.length + ' kasus)')
else { console.log('GAGAL ' + gagal + ' kasus'); process.exit(1) }
"
```

**Step 2 — commit**:

```bash
git add src/lib/caseTitle.ts src/components/Formatter.tsx
git -c user.name="dev" -c user.email="dev@local" commit -m "feat: normalisasi casing mode title (RT/RW + gelar baku KBBI)"
```

**Step 3 — verifikasi**: `npx tsc -b --force` exit 0; `npm run build` PASS. Verifikasi live (orchestrator): data undangan 14 baris = persis blok penerimaan spec (termasuk `S.IP (Camat Cidahu)`, `S.Pd`), `rt.01/rw.02` → `RT. 01/RW. 02`, `(rw)` → `(RW)`, `spd` → `S.Pd`, WORD JOINER & typo & mode upper/lower/none tetap.

---

## Bagian 2: Bullet `•` untuk Section "Turut Mengundang" (keputusan user 15-08-2026)

Latar: setelah Task 1–3 selesai & diverifikasi live, user meminta daftar nama di bawah judul "Turut mengundang…" memakai bullet `• ` (bukan `- `); daftar lain (alamat) tetap `- `. Deteksi berbasis judul (bukan klasifikasi konten — sample alamat sendiri mengandung baris nama seperti `H. Hasanudin S.Pd`). Aturan lengkap: bagian "Deteksi section 'Turut mengundang'" di spec.

### Task 4: Modul `listFormat.ts` — `formatList` + param `bullet`

**Files:**
- Modify: `src/lib/listFormat.ts`

**Interfaces:**
- Consumes: fungsi `formatListLine`, konstanta `KARAKTER_TAK_TERLIHAT`, `AWALAN_DAFTAR` (dari Bagian 1 Task 1 — file sudah ada).
- Produces: `formatList(lines: string[]): string[]` — dan `formatListLine(line: string, bullet: string = '- ')` dengan param kedua opsional (kompatibel dengan pemanggilan lama & test Task 1).

- [ ] **Step 1: Tulis test gagal (skrip assert node)**

Jalankan (harap GAGAL: `formatList` belum diekspor):

```bash
node --experimental-strip-types --input-type=module -e "
import { formatList } from './src/lib/listFormat.ts'
const kasus = [
  // [input, harapan]
  [
    ['Turut mengundang mempelai wanita', '1. Keluarga Besar Alm. Bpk H. Ropa\x27i', '2. Kamaludin (RT)'],
    ['Turut mengundang mempelai wanita', '• Keluarga Besar Alm. Bpk H. Ropa\x27i', '• Kamaludin (RT)'],
  ],
  [
    ['Turut mengundang mempelai wanita', '1. H. Mahpud', 'Turut mengundang mempelai pria', '1. H. Hasanudin S.Pd'],
    ['Turut mengundang mempelai wanita', '• H. Mahpud', 'Turut mengundang mempelai pria', '• H. Hasanudin S.Pd'],
  ],
  [
    ['Turut mengundang mempelai wanita', '1. H. Mahpud', 'Alamat', '1. Jl.Raya Sudirman'],
    ['Turut mengundang mempelai wanita', '• H. Mahpud', 'Alamat', '- Jl. Raya Sudirman'],
  ],
  [
    ['1. omah kampung', '2. Jl.Raya Sudirman No.5'],
    ['- omah kampung', '- Jl. Raya Sudirman No. 5'],
  ],
  [
    ['TURUT MENGUNDANG mempelai wanita', '1. Ust. Hasan'],
    ['TURUT MENGUNDANG mempelai wanita', '• Ust. Hasan'],
  ],
  [
    ['Turut mengundang mempelai wanita', '1. Asep Saepul Jamal', '', '1. Kamaludin (RT)'],
    ['Turut mengundang mempelai wanita', '• Asep Saepul Jamal', '', '• Kamaludin (RT)'],
  ],
  [
    ['1. H. Mahpud', '', '2. Ust. Hasan'],
    ['- H. Mahpud', '', '- Ust. Hasan'],
  ],
]
let gagal = 0
for (const [masukan, harapan] of kasus) {
  const hasil = formatList(masukan)
  if (JSON.stringify(hasil) !== JSON.stringify(harapan)) { console.error('GAGAL:', JSON.stringify(masukan), '\u2192', JSON.stringify(hasil), 'harap', JSON.stringify(harapan)); gagal++ }
}
console.log(gagal === 0 ? 'SEMUA PASS (' + kasus.length + ' kasus)' : 'GAGAL: ' + gagal + ' kasus')
process.exit(gagal === 0 ? 0 : 1)
"
```

Expected: FAIL — `formatList is not exported`.

- [ ] **Step 2: Implementasi minimal**

Di `src/lib/listFormat.ts`:

1. Tambah konstanta (setelah `AWALAN_DAFTAR`):
   ```ts
   const HEADER_TURUT_UNDANG = /\bturut mengundang\b/i
   ```
2. Ubah fungsi `formatListLine` — seluruh fungsi jadi (param `bullet`, default `'- '`):
   ```ts
   /** Normalisasi satu baris daftar: bullet (default '- '), spasi titik/koma, bersih dari karakter tak terlihat. */
   export function formatListLine(line: string, bullet: string = '- '): string {
     const bersih = line
       .replace(KARAKTER_TAK_TERLIHAT, '')
       .replace(AWALAN_DAFTAR, bullet)
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
3. Tambah fungsi ekspor di akhir file:
   ```ts
   /** Normalisasi seluruh baris: deteksi section "Turut mengundang" → bullet '• '. */
   export function formatList(lines: string[]): string[] {
     let sectionTurutUndang = false
     return lines.map((line) => {
       const polos = line.replace(KARAKTER_TAK_TERLIHAT, '').trim()
       if (HEADER_TURUT_UNDANG.test(polos)) {
         sectionTurutUndang = true
         return polos
       }
       if (AWALAN_DAFTAR.test(polos)) {
         return formatListLine(polos, sectionTurutUndang ? '• ' : '- ')
       }
       if (polos !== '') sectionTurutUndang = false
       return polos
     })
   }
   ```

- [ ] **Step 3: Jalankan test — harus PASS**

Jalankan ulang perintah Step 1. Expected: `SEMUA PASS (7 kasus)` dan exit 0.

- [ ] **Step 4: Regression test Task 1 (formatListLine tetap) — harus PASS**

Jalankan ulang skrip test Task 1 Bagian 1 (15 kasus). Expected: `SEMUA PASS (15 kasus)` dan exit 0.

- [ ] **Step 5: Regression pipeline penuh (undangan `• ` + alamat `- `) — harus PASS**

```bash
node --experimental-strip-types --input-type=module <<'EOF'
import { formatList } from './src/lib/listFormat.ts'
import { fixAddressTypos } from './src/lib/typoFix.ts'
import { toTitleCase } from './src/lib/caseTitle.ts'

const pipeline = (raw: string): string[] =>
  formatList(raw.split('\n')).filter(Boolean).map(fixAddressTypos).map(toTitleCase)

const undangan = `Turut mengundang mempelai wanita
1. Keluarga Besar Alm. Bpk H. Ropa'i
2. Keluarga Besar Alm. Bpk H. Hamdani
3. Asep Saepul Jamal (Kakak)
4. Muhammad Krisna (Kakak)
5. Bpk H. Tamtam Alamsyah, S.IP (Camat Cidahu)
6. Bpk. Opik (Kepala Desa Jayabakti)
7. H. Mahpud
8. H. Basit
9. H. Puadudin
10. Ust. Hasan
11. Ust. Ejang Syaripudin
12. H. Wandi (RW)
13. Kamaludin (RT)

Turut mengundang mempelai pria
1. Keluarga Besar Ema Atikah
2. H. Hasanudin S.Pd
3. Ust. Moch Sabil Arsyad`

const harapanUndangan = `Turut Mengundang Mempelai Wanita
• Keluarga Besar Alm. Bpk H. Ropa'i
• Keluarga Besar Alm. Bpk H. Hamdani
• Asep Saepul Jamal (Kakak)
• Muhammad Krisna (Kakak)
• Bpk H. Tamtam Alamsyah, S.IP (Camat Cidahu)
• Bpk. Opik (Kepala Desa Jayabakti)
• H. Mahpud
• H. Basit
• H. Puadudin
• Ust. Hasan
• Ust. Ejang Syaripudin
• H. Wandi (RW)
• Kamaludin (RT)
Turut Mengundang Mempelai Pria
• Keluarga Besar Ema Atikah
• H. Hasanudin S.Pd
• Ust. Moch Sabil Arsyad`

const hasilUndangan = pipeline(undangan).join('\n')
if (hasilUndangan !== harapanUndangan) {
  console.error('GAGAL pipeline undangan:\n' + hasilUndangan)
  process.exit(1)
}
console.log('PIPELINE UNDANGAN PASS')

const alamat = `1. omah kampung
2. Jl.Raya Sudirman No.5
3. Komp. Permata Indah RT.01/RW.02
4. (rw) RT 01
5. H. Hasanudin spd
6. Ibu s.ip (camat cidahu)
7. \u2060Jakarta
8. JLN merdeka`

const harapanAlamat = `- Omah Kampung
- Jalan. Raya Sudirman No. 5
- Komp. Permata Indah RT. 01/RW. 02
- (RW) RT 01
- H. Hasanudin S.Pd
- Ibu S.IP (Camat Cidahu)
- Jakarta
- Jalan Merdeka`

const hasilAlamat = pipeline(alamat).join('\n')
if (hasilAlamat !== harapanAlamat) {
  console.error('GAGAL pipeline alamat:\n' + hasilAlamat)
  process.exit(1)
}
console.log('PIPELINE ALAMAT PASS')
EOF
```

Expected: `PIPELINE UNDANGAN PASS` dan `PIPELINE ALAMAT PASS`, exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/listFormat.ts
git -c user.name="dev" -c user.email="dev@local" commit -m "feat: modul formatList (bullet • untuk section turut mengundang)"
```

---

### Task 5: Integrasi ke `Formatter.tsx`

**Files:**
- Modify: `src/components/Formatter.tsx:9-11` (import `formatListLine` → `formatList`), `:36-43` (`formatLines`)

**Interfaces:**
- Consumes: `formatList(lines: string[]): string[]` dari Task 4 (`src/lib/listFormat.ts`)
- Produces: `formatLines(raw, mode)` tetap dengan tanda tangan sama (kompatibel dengan `lines`, `handlePaste`)

- [ ] **Step 1: Ubah Formatter.tsx**

1. Ganti import di baris 10:
   ```ts
   import { formatList } from '@/lib/listFormat'
   ```
2. Ganti `formatLines`:
   ```ts
   function formatLines(raw: string, mode: CaseMode): string[] {
     return formatList(raw.split('\n'))
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

- [ ] **Step 3: Verifikasi live (Playwright, dev server http://localhost:5173) — oleh orchestrator**

1. Isi `#denah-input` dengan data undangan 18 baris (blok acceptance spec, bagian "Kriteria penerimaan") via native setter + event `input`.
2. Baca `#denah-result`: harus sama persis dengan blok acceptance — judul `Turut Mengundang Mempelai Wanita`/`Turut Mengundang Mempelai Pria` tanpa bullet, 16 baris nama dengan `• `, spasi titik/koma & gelar rapat seperti sebelumnya.
3. Ganti input dengan sample alamat (8 baris dari Task 4 Step 5): semua baris tetap `- `, termasuk baris nama `H. Hasanudin S.Pd` dan `Ibu S.IP (Camat Cidahu)` di dalam sample alamat (bukti deteksi berbasis judul, bukan konten).
4. Mode case: dropdown → "SEMUA BESAR" → `• KELUARGA BESAR ALM. BPK H. ROPA'I`; "semua kecil" → `• keluarga besar alm. bpk h. ropa'i`; kembali "Huruf Depan Kapital".
5. Console: 0 error.

- [ ] **Step 4: Commit**

```bash
git add src/components/Formatter.tsx
git -c user.name="dev" -c user.email="dev@local" commit -m "feat: bullet • untuk daftar turut mengundang"
```
