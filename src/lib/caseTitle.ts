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
  se: 'S.E',
  st: 'S.T',
  mm: 'M.M',
  msi: 'M.Si',
  mpd: 'M.Pd',
  mag: 'M.Ag',
  sag: 'S.Ag',
  sh: 'S.H',
  shi: 'S.H.I',
  sthi: 'S.Th.I',
  mkom: 'M.Kom',
  mt: 'M.T',
  ma: 'M.A',
  drs: 'Drs.',
  dra: 'Dra.',
}

function bagianGelar(b: string): string {
  if (b.toLowerCase() === 'ip') return 'IP'
  if (b.toLowerCase() === 'mba') return 'MBA'
  return b.charAt(0).toUpperCase() + b.slice(1).toLowerCase()
}

function normalisasiToken(w: string): string {
  const imbuhanAwal = w.match(/^[^A-Za-z]*/)?.[0] ?? ''
  // Digit bukan imbuahan: dipertahankan di inti agar RT/RW+angka (RT01/RW02) terbaca utuh.
  const imbuhanAkhir = w.match(/[^A-Za-z0-9]*$/)?.[0] ?? ''
  const inti = w.slice(imbuhanAwal.length, imbuhanAkhir ? w.length - imbuhanAkhir.length : w.length)

  // 1) RT/RW (dengan/tanpa titik, dengan/tanpa angka, bisa bergandengan via '/')
  //    angka nempel diberi spasi agar konsisten dengan bentuk bertitik: RT01 → RT 01
  if (/^(rt|rw)\.?\d*(\/(rt|rw)\.?\d*)*$/i.test(inti)) {
    const rapi = inti.replace(
      /(rt|rw)(\.?)(\d*)/gi,
      (_m, huruf: string, titik: string, angka: string) =>
        `${huruf.toUpperCase()}${titik}${angka ? ` ${angka}` : ''}`,
    )
    return imbuhanAwal + rapi + imbuhanAkhir
  }

  // 2) gelar tanpa titik
  const kunci = inti.toLowerCase()
  if (Object.hasOwn(GELAR_TANPA_TITIK, kunci)) {
    const baku = GELAR_TANPA_TITIK[kunci]
    // Hindari titik dobel: "Drs." (raw bertitik) → inti "Drs" + akhiran "." → "Drs."
    const akhiran = baku.endsWith('.') ? imbuhanAkhir.replace(/^\./, '') : imbuhanAkhir
    return imbuhanAwal + baku + akhiran
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
