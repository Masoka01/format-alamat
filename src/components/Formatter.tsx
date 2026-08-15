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

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
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
    <div className="card-enter w-full max-w-3xl rounded-md border border-line bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-8">
      {/* ===== Toolbar atas ===== */}
      <div className="mb-4 flex items-center justify-between">
        <label
          htmlFor="denah-input"
          className="text-sm font-medium tracking-wide text-ink"
        >
          Input
        </label>
        <button
          type="button"
          onClick={() => setInput('')}
          className="rounded-sm border-[1.5px] border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-danger hover:bg-danger/5 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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
        className="studio-scroll min-h-[320px] w-full resize-none rounded-sm border border-line-strong bg-white p-4 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-2"
      />

      {/* ===== Toolbar bawah ===== */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          aria-label="Mode huruf"
          value={mode}
          onChange={(e) => setMode(e.target.value as CaseMode)}
          className="h-12 w-full cursor-pointer rounded-sm border border-line-strong bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-2 sm:w-auto sm:shrink-0"
        >
          {MODES.map((m) => (
            <option key={m.id} value={m.id} className="bg-white text-ink">
              {m.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!lines.length}
          aria-live="polite"
          className={`flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-sm px-4 text-sm font-semibold text-white transition-[transform,box-shadow,background-color] duration-200 enabled:hover:scale-[1.03] enabled:hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:w-auto sm:flex-1 ${
            copied
              ? 'bg-success'
              : copyError
                ? 'bg-danger'
                : 'bg-brand enabled:hover:bg-brand-dark'
          }`}
        >
          {copied ? (
            <>
              <CheckIcon />
              Disalin
            </>
          ) : copyError ? (
            'Gagal nyalin'
          ) : (
            `Salin → CorelDraw${lines.length ? ` (${lines.length})` : ''}`
          )}
        </button>
      </div>
    </div>
  )
}