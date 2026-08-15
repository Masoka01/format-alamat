# Koreksi Typo Kata Alamat — Design

**Tanggal:** 2026-08-15
**Status:** Disetujui user (pendekatan B: kamus kanonik + fuzzy Levenshtein)
**Aplikasi:** Studio Denah (Vite + React 19 + TS, dark flat corporate)

## Tujuan

Sebelum casing diterapkan, perbaiki salah ketik (typo) kata-kata alamat umum
sesuai ejaan baku (KBBI). Selalu aktif, tanpa toggle, tanpa perubahan UI.

## Scope

**Masuk:**
- Koreksi typo kata alamat penuh (`jaln`→`jalan`, `kelurahn`→`kelurahan`)
- Varian singkat yang lazim salah tulis: `jl`/`jln`→`jalan`, `gg`→`gang`

**TIDAK masuk (ekspansi singkatan — di luar scope typo):**
- `No.`→`Nomor`, `RT`/`RW` (tetap), `dsn`→`Dusun`, `kec`→`Kecamatan`,
  `kab`→`Kabupaten`, `prov`→`Provinsi`
- Formatting (mis. `GG7`→`Gang 7` — digit tetap menempel)

## Algoritma

Modul baru `src/lib/typoFix.ts`, fungsi murni `fixAddressTypos(line: string): string`.
Per kata (split whitespace):

1. **Normalisasi token untuk pencocokan:** lowercase, buang karakter non-huruf
   di kedua ujung (iteratif): `Jln.`→`jln`, `GG7`→`gg`, `RT01`→`rt`.
   Simpan prefix/suffix yang dibuang untuk direkatkan kembali ke hasil.
2. **Tahap 1 — map eksplisit** (case-insensitive): cocok → ganti.
3. **Tahap 2 — fuzzy Levenshtein ≤ 1:** hanya token alfabetis murni ≥ 4 huruf,
   jarak edit ≤ 1 dari salah satu kata kanonik → ganti.
   Token yang sudah sama dengan kata kanonik → biarkan.
4. **Preservasi casing asli token:** `JALN`→`JALAN`, `Jaln`→`Jalan`,
   `jaln`→`jalan` (relevan untuk mode "Apa Adanya"; mode lain di-casing ulang
   oleh `applyCase` di hilir).

### Data

Kata kanonik (~22):
`jalan, gang, nomor, dusun, desa, kelurahan, kecamatan, kabupaten, provinsi,
kompleks, perumahan, blok, kavling, raya, timur, barat, utara, selatan, kiri,
kanan, perumnas, lorong`

Map eksplisit:
`jl→jalan, jln→jalan, gg→gang`

## Pipeline

`src/components/Formatter.tsx` — sisipkan satu langkah (import + 1 baris):

```
split('\n') → stripPrefix → filter(Boolean) → fixAddressTypos → applyCase(mode)
```

## Batas aman

- Token non-alfabetis murni (angka, `RT01`, `No.5`) tak tersentuh
- Nama tempat (`Yogyakarta`, `omah`) aman: jarak edit ke kata kanonik ≥ 2
- Tanda baca ujung (`Jln.`→`Jalan.`) dipertahankan

## Verifikasi

- `npx tsc -b --force` exit 0, `npm run build` PASS
- Uji fungsi: benar `jaln, JALN, jln, gg, kelurahn, barat`; aman
  `omah, Yogyakarta, RT01, No.5, komplk`; di semua mode casing
- Live: tempel teks ber-typo → Salin → isi clipboard terkoreksi

## File

- Baru: `src/lib/typoFix.ts`
- Edit: `src/components/Formatter.tsx` (import + panggil di pipeline `lines`)
