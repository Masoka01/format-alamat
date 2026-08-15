'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import Pencil, { type Mood } from './Pencil'
import Confetti from './Confetti'
import StatusBar from './StatusBar'

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

const IDLE_POOL = [
  'Semua tenang. Pensil siap melukis.',
  'Menunggu teks masuk…',
  'Bosen. Ajak aku ngetik dong.',
]
const EMPTY_MSGS = [
  'Males nih, isi dulu dong…',
  'Pensil ini laper, kasih makan teks.',
]
const FEW_MSGS = ['Cuma segitu? Ayo, malu sama pensil ini.']
const MANY_MSGS = ['Wah banyak juga. Semangat ngetiknya.']
const COPIED_MSGS = [
  'Terkirim! CorelDraw nangis bahagia.',
  'Beres. Pensil ini layak naik gaji.',
  'Sip! Format rapi, hati senang.',
]
const FAIL_MSGS = ['Gagal nyalin. Coba lagi ya.']

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

export default function Formatter() {
  const [input, setInput] = useState<string>('1.omah\n2.kampung\n3.jalan ati ajor')
  const [mode, setMode] = useState<CaseMode>('title')
  const [copied, setCopied] = useState<boolean>(false)
  const [copyError, setCopyError] = useState<boolean>(false)
  const [rainbow, setRainbow] = useState<boolean>(false)
  const [mood, setMood] = useState<Mood>('idle')
  const [burst, setBurst] = useState<number>(0)
  const [copyFrom, setCopyFrom] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [msgIndex, setMsgIndex] = useState<number>(0)

  const moodTimer = useRef<number | null>(null)
  const rainbowTimer = useRef<number | null>(null)
  const copyBtnRef = useRef<HTMLButtonElement>(null)

  const lines: string[] = input
    .split('\n')
    .map(stripPrefix)
    .filter(Boolean)
    .map((l) => applyCase(l, mode))

  const wordCount = lines.join(' ').split(/\s+/).filter(Boolean).length
  const modeLabel = MODES.find((m) => m.id === mode)!.label

  // Rotasi pesan idle tiap 5 detik
  useEffect(() => {
    const t = window.setInterval(() => setMsgIndex((i) => i + 1), 5000)
    return () => window.clearInterval(t)
  }, [])

  // Kosong → pensil layu (spesifikasi Bagian 3): timpa timer mood yang pending
  useEffect(() => {
    if (!input.trim()) {
      if (moodTimer.current !== null) {
        window.clearTimeout(moodTimer.current)
        moodTimer.current = null
      }
      setMood('sad')
    }
  }, [input])

  function setMoodTemporarily(next: Mood, ms: number) {
    setMood(next)
    if (moodTimer.current !== null) window.clearTimeout(moodTimer.current)
    moodTimer.current = window.setTimeout(() => setMood('idle'), ms)
  }

  function handleInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    setMoodTemporarily('typing', 800)
  }

  function handleCopy() {
    if (!lines.length) return
    const rect = copyBtnRef.current?.getBoundingClientRect()
    setCopyFrom({
      x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
      y: rect ? rect.top : window.innerHeight / 2,
    })
    setBurst((b) => b + 1)
    setMoodTemporarily('happy', 2000)
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
        setMoodTemporarily('sad', 2000)
      })
  }

  function triggerRainbow() {
    setRainbow(true)
    if (rainbowTimer.current !== null) window.clearTimeout(rainbowTimer.current)
    rainbowTimer.current = window.setTimeout(() => setRainbow(false), 10000)
  }

  function pickMessage(): string {
    if (rainbow) return 'MODE PELANGI! 🌈'
    if (copyError) return pick(FAIL_MSGS)
    if (copied) return COPIED_MSGS[msgIndex % COPIED_MSGS.length]
    if (!input.trim()) return EMPTY_MSGS[msgIndex % EMPTY_MSGS.length]
    if (lines.length <= 2) return FEW_MSGS[0]
    if (lines.length > 20) return MANY_MSGS[0]
    return IDLE_POOL[msgIndex % IDLE_POOL.length]
  }

  return (
    <div className={`studio-card flex min-h-full flex-col gap-6 ${rainbow ? 'rainbow' : ''}`}>
      {/* ===== HEADER ===== */}
      <header className="flex h-14 shrink-0 items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Pencil mood={mood} rainbow={rainbow} onEasterEgg={triggerRainbow} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
              Studio Denah
            </h1>
            <p className="text-xs text-slate-400">
              Formatter alamat untuk CorelDraw
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 font-mono text-sm text-slate-300">
          <span title="Baris valid">
            <span className="text-blue-400">{lines.length}</span> baris
          </span>
          <span title="Total kata">
            <span className="text-blue-400">{wordCount}</span> kata
          </span>
        </div>
      </header>

      {/* ===== MAIN GRID ===== */}
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input */}
        <section className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <label
              htmlFor="denah-input"
              className="text-xs font-medium uppercase tracking-wider text-slate-400"
            >
              Input
            </label>
            <button
              onClick={() => setInput('')}
              className="text-xs text-slate-500 transition-colors hover:text-rose-400"
            >
              Hapus
            </button>
          </div>
          <textarea
            id="denah-input"
            value={input}
            onChange={handleInputChange}
            placeholder={'1.omah\n2.kampung\n3.jalan ati ajor'}
            className="studio-scroll min-h-[300px] w-full flex-1 resize-none rounded-lg border border-white/10 bg-slate-900/60 p-4 text-sm leading-relaxed text-slate-100 outline-none transition-all focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.25)]"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                aria-pressed={mode === m.id}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  mode === m.id
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </section>

        {/* Hasil */}
        <section className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Hasil
            </label>
            {copied && (
              <span className="text-xs font-medium text-emerald-400">
                Disalin ✓
              </span>
            )}
          </div>
          <div className="studio-scroll min-h-[300px] flex-1 overflow-y-auto rounded-lg border border-white/10 bg-slate-900/60 p-4 text-sm leading-relaxed text-slate-100">
            {lines.length ? (
              lines.map((line, i) => <div key={i}>{line}</div>)
            ) : (
              <p className="italic text-slate-600">Belum ada hasil…</p>
            )}
          </div>
          <button
            ref={copyBtnRef}
            onClick={handleCopy}
            disabled={!lines.length}
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 py-3 font-medium text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all hover:from-blue-400 hover:to-blue-300 hover:shadow-[0_0_45px_rgba(59,130,246,0.6)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Salin → CorelDraw{lines.length > 0 ? ` (${lines.length})` : ''}
          </button>
        </section>
      </main>

      {/* ===== STATUS BAR ===== */}
      <StatusBar message={pickMessage()} modeLabel={modeLabel} />

      {/* ===== CONFETTI ===== */}
      <Confetti burst={burst} from={copyFrom} />
    </div>
  )
}