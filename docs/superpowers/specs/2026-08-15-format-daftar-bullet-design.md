# Spec: Format Daftar Otomatis (Bullet + Spasi Titik)

Tanggal: 2026-08-15
Status: Disetujui (design review, user)

## Tujuan

Menghasilkan daftar ber-bullet `- ` dan penataan spasi titik/koma secara otomatis untuk semua input, tanpa pemicu/toggle. Berlaku untuk daftar undangan ("Turut mengundang") maupun daftar alamat — keputusan user: semua daftar bernomor jadi bullet.

## Perilaku

Pipeline per baris: `formatListLine(line)`:

1. **Buang karakter tak terlihat** — regex `[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]` (artefak salin WhatsApp/Telegram, mis. WORD JOINER U+2060). Ini memindahkan fix bug 2026-08-15 ke dalam modul.
2. **Bulletize** — baris ber-awalan daftar `N.` / `N)` / `N-` / `•` / `-` / `*` (regex `^\s*(\d+[.)-]|[-•*])\s*`) → diganti `- `.
   - Baris tanpa awalan (judul seperti "Turut mengundang mempelai wanita") → tidak berubah, tanpa bullet.
3. **Spasi titik/koma** (aturan detail di bawah).
4. **Trim**.

Setelah `formatListLine`, pipeline berlanjut seperti biasa: `filter(Boolean)` → `fixAddressTypos` → `applyCase(mode)`.

### Aturan spasi titik

Untuk setiap `.` yang diikuti huruf atau digit (tanpa spasi):

| Kondisi | Contoh | Hasil |
|---|---|---|
| Kata sebelum titik ∈ daftar gelar sapaan | `Alm.Bpk`, `H.Ropa'i`, `H.Hasanudin` | spasi → `Alm. Bpk`, `H. Ropa'i`, `H. Hasanudin` |
| Kata setelah titik ∈ daftar akhiran gelar akademik (dan kata sebelum bukan gelar sapaan) | `S.Pd`, `S.IP`, `M.Sc`, `Ph.D` | tetap rapat → `S.Pd`, `S.IP`, `M.Sc`, `Ph.D` |
| Diikuti digit | `No.5`, `RT.01` | spasi → `No. 5`, `RT. 01` |
| Diikuti huruf lain (nama panjang, dsb.) | `Jl.Raya` | spasi → `Jl. Raya` |
| Diikuti titik/spasi/akhir baris | `Alm.`, `Ust.`, `...` | tidak berubah |

Urutan prioritas: gelar sapaan → selalu spasi; selain itu, akhiran gelar akademik → rapat; selain itu → spasi.

### Aturan spasi koma

Untuk setiap `,` yang diikuti huruf (tanpa spasi) → spasi (`Alamsyah,S.IP` → `Alamsyah, S.IP`).
Koma yang diikuti digit (koma desimal, `1,5`) → tidak berubah.

### Daftar gelar sapaan (kata sebelum titik → selalu spasi)

`alm`, `almarhum`, `bpk`, `bapak`, `ibu`, `h`, `hj`, `ust`, `ustd`, `ustadz`, `dr`, `dra`, `ir`, `sdr`, `sdri`, `tn`, `ny`, `nn`, `kh`, `habib`, `gus` — pencocokan case-insensitive.

### Daftar akhiran gelar akademik (rapat)

`pd`, `ip`, `sc`, `si`, `kom`, `ag`, `hum`, `fil`, `fis`, `kes`, `ak`, `apt`, `ars`, `t`, `h`, `e`, `s`, `a`, `d`, `g`, `k`, `i`, `m`, `p`, `b`, `mt`, `mm`, `mba`, `eng`, `spd`, `msi`, `mkom`, `ba`, `ma`, `phd` — pencocokan case-insensitive. Daftar tetap; penambahan gelar baru dimungkinkan nanti.

## Batasan (scope ringan — keputusan user)

- Singkatan lain dibiarkan apa adanya: `Alm` tanpa titik tetap `Alm`; tidak ada normalisasi ejaan gelar (tidak menulis penuh "Almarhum"/"Bapak").
- Mode upper/lower/none dan koreksi typo (`fixAddressTypos`) tidak berubah; mode Title dinormalkan casing singkatan & gelar (lihat "Normalisasi casing mode Title").
- Tidak ada perubahan UI; tidak ada toggle; selalu otomatis.
- Auto-copy saat paste (pendekatan B) dan Salin manual tidak berubah — invariant clipboard = kartu hasil tetap.

## Normalisasi casing mode Title (keputusan user 15-08-2026)

Mode "Huruf Depan Kapital" (`toTitleCase`) diperbaiki agar singkatan dan gelar mengikuti bentuk baku, tanpa mengubah penanganan kata biasa:

- **RT/RW**: token `rt`/`rw` dengan atau tanpa titik (`rt.`, `(rw)`, `01/rw.`) → `RT`/`RW`. Contoh: `rt.01/rw.02` → `RT. 01/RW. 02` (spasi dari `formatListLine`), `(rw)` → `(RW)`.
- **Gelar akademik tanpa titik** → bentuk baku: `spd` → `S.Pd`, `sip` → `S.IP`, `skom` → `S.Kom`, `ssi` → `S.Si`, `msc` → `M.Sc`, `phd` → `Ph.D`, `mba` → `MBA`.
- **Gelar bertitik** (pola `huruf.huruf…`, tiap bagian 1–5 huruf): bagian pertama kapital-awal, bagian berikutnya kapital-awal, kecuali `ip` → `IP` dan `mba` → `MBA`. Contoh: `s.pd` → `S.Pd`, `s.pd.` → `S.Pd.`, `s.ip` → `S.IP`, `ph.d` → `Ph.D`, `m.sc` → `M.Sc`, `s.kom` → `S.Kom`, `a.md` → `A.Md`.
- **Kata biasa** → huruf pertama kapital, sisanya kecil (seperti sebelumnya): `omah` → `Omah`, `JALAN` → `Jalan`, `(camat cidahu)` → `(Camat Cidahu)`.
- Singkatan satu bagian dengan titik akhir (`Alm.`, `Bpk.`, `H.`, `Ust.`, `Komp.`, `No.`) → kapital-awal seperti sebelumnya: `alm.` → `Alm.`.
- Berlaku hanya di mode Title; mode upper/lower/none tidak berubah.
- Implementasi: `toTitleCase` pindah ke modul baru `src/lib/caseTitle.ts` (pola `typoFix.ts`/`listFormat.ts`), `Formatter.tsx` hanya meng-import.

## Arsitektur

- **Baru**: `src/lib/listFormat.ts` — ekspor `formatListLine(line: string): string` (langkah 1–4 di atas), plus konstanta `GELAR_SAPAAN` dan `AKHIRAN_GELAR_AKADEMIK`.
- **Baru**: `src/lib/caseTitle.ts` — ekspor `toTitleCase(str: string): string` (normalisasi casing mode Title, keputusan 15-08-2026).
- **Ubah**: `src/components/Formatter.tsx` — hapus `stripPrefix` dan `toTitleCase` lokal, `formatLines` memakai `formatListLine`, `applyCase` memakai `toTitleCase` dari `caseTitle.ts`. Tidak ada perubahan lain.
- Modul murni (tanpa React), mengikuti pola `src/lib/typoFix.ts`.

## Verifikasi

Kriteria penerimaan (data undangan 14 baris):

```
Turut mengundang mempelai wanita
- Keluarga Besar Alm. Bpk H. Ropa'i
- Keluarga Besar Alm. Bpk H. Hamdani
- Asep Saepul Jamal (Kakak)
- Muhammad Krisna (Kakak)
- Bpk H. Tamtam Alamsyah, S.IP (Camat Cidahu)
- Bpk. Opik (Kepala Desa Jayabakti)
- H. Mahpud
- H. Basit
- H. Puadudin
- Ust. Hasan
- Ust. Ejang Syaripudin
- H. Wandi (RW)
- Kamaludin (RT)

Turut mengundang mempelai pria
- Keluarga Besar Ema Atikah
- H. Hasanudin S.Pd
- Ust. Moch Sabil Arsyad
```

Regression:
- Alamat: `1. omah kampung` → `- Omah Kampung`; `Jl.Raya Sudirman No.5` → `Jalan. Raya Sudirman No. 5` (typo fixer lama mengubah `Jl` → `Jalan`, perilaku disetujui; spasi titik tetap berlaku); `Komp. Permata Indah RT.01/RW.02` → `Komp. Permata Indah RT. 01/RW. 02`
- Casing Title: `rt. 01/rw. 02` → `RT. 01/RW. 02`; `(rw)` → `(RW)`; `spd` → `S.Pd`; `s.ip` → `S.IP`; `s.pd.` → `S.Pd.`; `(camat cidahu)` → `(Camat Cidahu)`; `JALAN` → `Jalan`
- WORD JOINER U+2060 tetap terbuang (pindah ke modul)
- Typo tetap berfungsi (`1. JLN merdeka` → `- Jalan Merdeka`)
- Mode upper/lower/none tetap berfungsi
- `npx tsc -b --force` exit 0, `npm run build` PASS, cek live di browser (0 console error)
