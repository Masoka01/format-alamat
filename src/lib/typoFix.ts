const CANONICAL: string[] = [
  'jalan',
  'gang',
  'nomor',
  'dusun',
  'desa',
  'kelurahan',
  'kecamatan',
  'kabupaten',
  'provinsi',
  'kompleks',
  'perumahan',
  'blok',
  'kavling',
  'raya',
  'timur',
  'barat',
  'utara',
  'selatan',
  'kiri',
  'kanan',
  'perumnas',
  'lorong',
]

const EXPLICIT_MAP: Record<string, string> = {
  jl: 'jalan',
  jln: 'jalan',
  jlan: 'jalan', // typo umum; dijaga tetap terkoreksi walau pendek (4 huruf)
  gg: 'gang',
  komplek: 'kompleks', // typo umum; kompensasi fuzzy yang kini min. 5 huruf
}

function isLetter(ch: string): boolean {
  return /[a-zA-Z]/.test(ch)
}

/** Standard Levenshtein edit distance (full-matrix DP, O(m·n)). */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  )
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
  }
  return dp[m][n]
}

/**
 * Fuzzy match terhadap kamus kanonikal (jarak ≤ 1, minimal 5 huruf).
 * Minimal 5 huruf: kata 4 huruf terlalu mudah "mirip" nama orang
 * (mis. "yang" → "gang", "gana" → "gang", "bara" → "barat").
 */
function fuzzyCorrection(core: string): string | undefined {
  if (core.length < 5 || CANONICAL.includes(core)) return undefined
  return CANONICAL.find((w) => levenshtein(core, w) <= 1)
}

/** Re-apply the original token casing to a corrected word. */
function applyOriginalCasing(word: string, original: string): string {
  if (original === original.toUpperCase()) return word.toUpperCase()
  if (original[0] === original[0].toUpperCase()) {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }
  return word
}

/** Pecah token: prefix/kata/suffix (kata = inti huruf). Undefined bila tanpa huruf. */
function splitToken(token: string):
  | { prefix: string; original: string; core: string; suffix: string }
  | undefined {
  let start = 0
  let end = token.length
  while (start < end && !isLetter(token[start])) start++
  while (end > start && !isLetter(token[end - 1])) end--
  if (start === end) return undefined
  return {
    prefix: token.slice(0, start),
    original: token.slice(start, end),
    core: token.slice(start, end).toLowerCase(),
    suffix: token.slice(end),
  }
}

function fixToken(token: string): string {
  const parts = splitToken(token)
  if (!parts) return token
  const { prefix, original, core, suffix } = parts

  // Singkatan & typo eksplisit selalu dikoreksi (apa pun hurufnya).
  if (Object.hasOwn(EXPLICIT_MAP, core)) {
    // Titik singkatan ("jl.") tidak ikut tersisa saat diperluas
    // menjadi kata penuh ("jalan." adalah salah).
    const expanded = prefix + applyOriginalCasing(EXPLICIT_MAP[core], original)
    return suffix === '.' ? expanded : expanded + suffix
  }

  // Kata berawalan huruf besar = proper name (nama orang/daerah) →
  // jangan di-fuzzy ("Yang" ≠ "gang", "Gana" ≠ "gang").
  if (original[0] === original[0].toUpperCase()) return token

  const correction = fuzzyCorrection(core)
  if (correction === undefined) return token

  return prefix + applyOriginalCasing(correction, original) + suffix
}

/**
 * Sinyal bahwa baris memang alamat (bukan daftar nama).
 * Tanpa sinyal → typo-fix dilewati total, baris dibiarkan apa adanya.
 * Sinyal: singkatan/typo eksplisit, kata alamat verbatim, angka,
 * penanda "no/rt/rw", atau kata ≥6 huruf yang mirip kata alamat
 * (kata panjang jarang nyerempet nama orang).
 */
function lineHasAddressSignal(tokens: string[]): boolean {
  return tokens.some((token) => {
    const parts = splitToken(token)
    if (!parts) return false
    const { core } = parts
    if (Object.hasOwn(EXPLICIT_MAP, core)) return true
    if (CANONICAL.includes(core)) return true
    if (/[0-9]/.test(token)) return true
    if (core === 'no' || core === 'rt' || core === 'rw') return true
    return core.length >= 6 && fuzzyCorrection(core) !== undefined
  })
}

/** Correct common Indonesian address-word typos in a single line. */
export function fixAddressTypos(line: string): string {
  const tokens = line.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return line
  // Gate konteks — perbaikan bug "Yang mengundang" → "Gang mengundang"
  // (16-08-2026): baris tanpa sinyal alamat tidak boleh disentuh.
  if (!lineHasAddressSignal(tokens)) return line
  return tokens.map(fixToken).join(' ')
}