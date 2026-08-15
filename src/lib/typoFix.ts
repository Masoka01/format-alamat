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
  gg: 'gang',
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

/** Fuzzy match against the canonical dictionary (distance ≤ 1, ≥ 4 letters). */
function fuzzyCorrection(core: string): string | undefined {
  if (core.length < 4 || CANONICAL.includes(core)) return undefined
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

function fixToken(token: string): string {
  let start = 0
  let end = token.length
  while (start < end && !isLetter(token[start])) start++
  while (end > start && !isLetter(token[end - 1])) end--

  const prefix = token.slice(0, start)
  const suffix = token.slice(end)
  const core = token.slice(start, end).toLowerCase()

  if (core === '') return token

  const correction = Object.hasOwn(EXPLICIT_MAP, core)
    ? EXPLICIT_MAP[core]
    : fuzzyCorrection(core)
  if (correction === undefined) return token

  return prefix + applyOriginalCasing(correction, token.slice(start, end)) + suffix
}

/** Correct common Indonesian address-word typos in a single line. */
export function fixAddressTypos(line: string): string {
  return line
    .split(/\s+/)
    .filter(Boolean)
    .map(fixToken)
    .join(' ')
}