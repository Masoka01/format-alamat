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
  if (b.toLowerCase() === 'ip') return 'IP'
  if (b.toLowerCase() === 'mba') return 'MBA'
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