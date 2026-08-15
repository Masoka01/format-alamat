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