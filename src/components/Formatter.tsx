import { useState, type ChangeEvent } from 'react'

type CaseMode = 'title' | 'upper' | 'lower' | 'none'

interface ModeOption {
  id: CaseMode
  label: string
}

const MODES: ModeOption[] = [
  { id: 'title', label: 'Huruf Depan Kapital' },
  { id: 'upper', label: 'SEMUA BESAR' },
  { id: 'lower', label: 'semua kecil' },
  { id: 'none',  label: 'Apa Adanya' },
]

function toTitleCase(str: string): string {
  return str.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

function applyCase(str: string, mode: CaseMode): string {
  switch (mode) {
    case 'title': return toTitleCase(str)
    case 'upper': return str.toUpperCase()
    case 'lower': return str.toLowerCase()
    default:      return str
  }
}

function stripPrefix(line: string): string {
  return line.replace(/^\s*(\d+[\.\)\-]|[-•*])\s*/, '').trim()
}

export default function Formatter() {
  const [input, setInput] = useState<string>('1.omah\n2.kampung\n3.jalan ati ajor')
  const [mode, setMode] = useState<CaseMode>('title')
  const [copied, setCopied] = useState<boolean>(false)
  const [copyError, setCopyError] = useState<boolean>(false)

  const lines: string[] = input
    .split('\n')
    .map(stripPrefix)
    .filter(Boolean)
    .map((l) => applyCase(l, mode))

  function handleInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
  }

  function handleCopy() {
    if (!lines.length) return
    navigator.clipboard
      .writeText(lines.join('\n'))
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

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_25px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8">
        {/* ===== Toolbar atas ===== */}
        <div className="mb-4 flex items-center justify-between">
          <label
            htmlFor="denah-input"
            className="text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            Input
          </label>
          <button
            type="button"
            onClick={() => setInput('')}
            className="rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
          >
            Hapus
          </button>
        </div>

        {/* ===== Area teks ===== */}
        <textarea
          id="denah-input"
          value={input}
          onChange={handleInputChange}
          placeholder={'1.omah\n2.kampung\n3.jalan ati ajor'}
          className="studio-scroll min-h-[320px] w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm leading-relaxed text-slate-100 outline-none transition-all focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.25)]"
        />

        {/* ===== Toolbar bawah ===== */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            aria-label="Mode huruf"
            value={mode}
            onChange={(e) => setMode(e.target.value as CaseMode)}
            className="h-12 w-full cursor-pointer rounded-xl border border-white/10 bg-slate-900/60 px-3.5 text-sm text-slate-200 outline-none transition-all focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.25)] [color-scheme:dark] sm:w-auto sm:shrink-0"
          >
            {MODES.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                {m.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!lines.length}
            aria-live="polite"
            className={`flex h-12 w-full items-center justify-center whitespace-nowrap rounded-xl font-medium text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:w-auto sm:flex-1 ${
              copied
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                : copyError
                  ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                  : 'bg-gradient-to-r from-blue-500 to-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:from-blue-400 hover:to-blue-300 hover:shadow-[0_0_45px_rgba(59,130,246,0.6)]'
            }`}
          >
            {copied
              ? 'Disalin ✓'
              : copyError
                ? 'Gagal nyalin'
                : `Salin → CorelDraw${lines.length ? ` (${lines.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
