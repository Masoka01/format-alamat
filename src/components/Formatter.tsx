import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { fixAddressTypos } from '@/lib/typoFix'
import { formatListLine } from '@/lib/listFormat'

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

function formatLines(raw: string, mode: CaseMode): string[] {
  return raw
    .split('\n')
    .map(formatListLine)
    .filter(Boolean)
    .map(fixAddressTypos)
    .map((l) => applyCase(l, mode))
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

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ModeDropdown({
  value,
  onChange,
}: {
  value: CaseMode
  onChange: (mode: CaseMode) => void
}) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState<number>(() =>
    MODES.findIndex((m) => m.id === value),
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedIndex = MODES.findIndex((m) => m.id === value)

  // Saat menu terbuka, sorotan keyboard kembali ke opsi yang dipilih
  useEffect(() => {
    if (open) setHighlighted(selectedIndex)
  }, [open, selectedIndex])

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  // Escape menutup dari mana pun
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  function handleTriggerKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          setHighlighted(selectedIndex)
          setOpen(true)
        } else {
          setHighlighted((i) => (i + 1) % MODES.length)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) {
          setHighlighted(selectedIndex)
          setOpen(true)
        } else {
          setHighlighted((i) => (i - 1 + MODES.length) % MODES.length)
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) {
          onChange(MODES[highlighted].id)
          setOpen(false)
        } else {
          setOpen(true)
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto sm:shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="mode-listbox"
        aria-label="Mode huruf"
        aria-activedescendant={open ? `mode-option-${MODES[highlighted].id}` : undefined}
        className="flex h-12 w-full items-center justify-between gap-2 rounded-sm border border-line-strong bg-surface px-3.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-surface"
      >
        <span className="truncate">{MODES[selectedIndex].label}</span>
        <ChevronDownIcon open={open} />
      </button>

      {open && (
        <div
          id="mode-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-line bg-surface p-1 shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
        >
          {MODES.map((m, i) => (
            <div
              key={m.id}
              id={`mode-option-${m.id}`}
              role="option"
              aria-selected={m.id === value}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => {
                onChange(m.id)
                setOpen(false)
              }}
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                i === highlighted ? 'bg-white/5' : ''
              } ${m.id === value ? 'font-medium text-brand' : 'text-ink'}`}
            >
              <span>{m.label}</span>
              {m.id === value && <CheckIcon />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Formatter() {
  const [input, setInput] = useState<string>('')
  const [mode, setMode] = useState<CaseMode>('title')
  const [copied, setCopied] = useState<boolean>(false)
  const [copyError, setCopyError] = useState<boolean>(false)

  const lines: string[] = formatLines(input, mode)

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

  function handlePaste(e: ReactClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData('text')
    const start = e.currentTarget.selectionStart ?? 0
    const end = e.currentTarget.selectionEnd ?? start
    const merged = input.slice(0, start) + text + input.slice(end)
    const fullLines = formatLines(merged, mode)
    if (!fullLines.length) return
    navigator.clipboard
      .writeText(fullLines.join('\n'))
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
    <div className="card-enter w-full max-w-5xl">
      <div className="grid gap-6 md:grid-cols-2">
        {/* ===== Kartu Input ===== */}
        <section className="flex flex-col rounded-md border border-line bg-surface/70 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <label htmlFor="denah-input" className="text-sm font-medium tracking-wide text-muted">
              Input
            </label>
            <button
              type="button"
              onClick={() => setInput('')}
              disabled={!input.trim()}
              className="rounded-sm border-[1.5px] border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition-colors enabled:hover:border-danger enabled:hover:bg-danger/10 enabled:hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hapus
            </button>
          </div>
          <textarea
            id="denah-input"
            value={input}
            onChange={handleInputChange}
            onPaste={handlePaste}
            placeholder="Tulis atau tempel daftar alamat di sini, satu per baris"
            className="studio-scroll min-h-[320px] flex-1 w-full resize-none rounded-sm border border-line-strong bg-surface p-4 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-surface"
          />
        </section>

        {/* ===== Kartu Hasil ===== */}
        <section className="flex flex-col rounded-md border border-line bg-surface/70 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <label htmlFor="denah-result" className="text-sm font-medium tracking-wide text-muted">Hasil</label>
            <div className="w-full sm:w-auto sm:shrink-0">
              <ModeDropdown value={mode} onChange={setMode} />
            </div>
          </div>
          <textarea
            id="denah-result"
            readOnly
            value={lines.join('\n')}
            placeholder="Hasil format akan muncul di sini"
            className="studio-scroll min-h-[320px] flex-1 w-full resize-none rounded-sm border border-line-strong bg-surface p-4 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand focus:ring-offset-surface"
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!lines.length}
              aria-live="polite"
              className={`flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-sm px-4 text-sm font-semibold text-white transition-[transform,box-shadow,background-color] duration-200 enabled:hover:scale-[1.03] enabled:hover:shadow-[0_2px_8px_rgba(0,0,0,0.25)] active:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${
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
        </section>
      </div>
    </div>
  )
}