import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { fixAddressTypos } from '@/lib/typoFix'
import { formatList } from '@/lib/listFormat'
import { toTitleCase } from '@/lib/caseTitle'

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

function applyCase(str: string, mode: CaseMode): string {
  switch (mode) {
    case 'title': return toTitleCase(str)
    case 'upper': return str.toUpperCase()
    case 'lower': return str.toLowerCase()
    default:      return str
  }
}

function formatLines(raw: string, mode: CaseMode): string[] {
  return formatList(raw.split('\n'))
    .filter(Boolean)
    .map(fixAddressTypos)
    .map((l) => applyCase(l, mode))
}

/* ---- Ikon inline SVG (tanpa dependensi) ---- */

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
      className="shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function CopyIcon() {
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
      className="shrink-0"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function TrashIcon() {
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
      className="shrink-0"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

function TypeIcon() {
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
      className="shrink-0"
    >
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
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
      className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
        className="glass-btn flex h-12 w-full items-center justify-between gap-2.5 rounded-lg px-4 text-sm font-medium text-ink outline-none transition-[border-color,background-color,transform] duration-200 hover:border-white/70 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 active:scale-[0.99]"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <TypeIcon />
          <span className="truncate">{MODES[selectedIndex].label}</span>
        </span>
        <ChevronDownIcon open={open} />
      </button>

      {open && (
        <div
          id="mode-listbox"
          role="listbox"
          className="glass-menu absolute left-0 right-0 top-full z-20 mt-2 rounded-lg p-1.5"
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
              className={`flex cursor-pointer items-center justify-between gap-2 rounded-md px-3.5 py-3 text-sm transition-colors duration-150 ${
                i === highlighted ? 'bg-white/10' : ''
              } ${m.id === value ? 'font-medium text-ink' : 'text-muted hover:bg-white/10 hover:text-ink'}`}
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
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {/* ===== Kartu Input ===== */}
        <section className="glass-panel flex flex-col rounded-lg p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <label htmlFor="denah-input" className="text-xs font-semibold tracking-[0.12em] text-muted">
              Input
            </label>
            <button
              type="button"
              onClick={() => setInput('')}
              disabled={!input.trim()}
              className="glass-btn flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-ink outline-none transition-[border-color,background-color,color,transform] duration-200 enabled:hover:border-danger/70 enabled:hover:bg-danger/15 enabled:hover:text-danger active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <TrashIcon />
              Hapus
            </button>
          </div>
          <textarea
            id="denah-input"
            value={input}
            onChange={handleInputChange}
            onPaste={handlePaste}
            placeholder="Tulis atau tempel daftar alamat di sini, satu per baris"
            className="glass-field studio-scroll min-h-[320px] flex-1 w-full resize-none rounded-lg p-5 text-sm leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/60 hover:border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/25"
          />
        </section>

        {/* ===== Kartu Hasil ===== */}
        <section className="glass-panel flex flex-col rounded-lg p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <label htmlFor="denah-result" className="text-xs font-semibold tracking-[0.12em] text-muted">Hasil</label>
            <div className="w-full sm:w-auto sm:shrink-0">
              <ModeDropdown value={mode} onChange={setMode} />
            </div>
          </div>
          <textarea
            id="denah-result"
            readOnly
            value={lines.join('\n')}
            placeholder="Hasil format akan muncul di sini"
            className="glass-field studio-scroll min-h-[320px] flex-1 w-full resize-none rounded-lg p-5 text-sm leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/60 hover:border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/25"
          />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!lines.length}
              aria-live="polite"
              className={`glass-btn flex h-12 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-lg px-5 text-sm font-semibold text-ink transition-[transform,background-color,border-color,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                copied
                  ? 'border-success/70 bg-success/25 shadow-[0_0_24px_rgba(40,167,69,0.35)]'
                  : copyError
                    ? 'border-danger/70 bg-danger/20'
                    : 'enabled:hover:scale-[1.03] enabled:hover:border-white/70 enabled:hover:bg-white/15 active:translate-y-[-1px]'
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
                <>
                  <CopyIcon />
                  {`Salin → CorelDraw${lines.length ? ` (${lines.length})` : ''}`}
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}