# Studio Denah — Redesign Full-Viewport + Gimmick: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah Denah Formatter menjadi workspace "Studio Denah" full-viewport dengan styling glassmorphism premium dan gimmick menghibur (mascot pensil, pesan sarkastik, confetti, easter egg rainbow mode).

**Architecture:** Satu halaman Next.js 14 App Router. `page.tsx` hanya menyediakan shell background; seluruh layout + state + gimmick hidup di `Formatter.tsx` (komponen client), dengan tiga komponen baru: `Pencil`, `Confetti`, `StatusBar`. Semua animasi murni CSS keyframes di `globals.css`. Logika format (stripPrefix/toTitleCase/applyCase) TIDAK diubah.

**Tech Stack:** Next.js 14.2 · React 18 · TypeScript · Tailwind CSS 3 · zero-dependency (tidak menambah npm package).

## Global Constraints

- **Zero-dependency:** dilarang menambah package baru (tidak ada canvas-confetti, framer-motion, dsb.). Confetti manual via div + CSS keyframes.
- **Logika format tidak berubah:** `stripPrefix`, `toTitleCase`, `applyCase`, `MODES` dipertahankan identik (di `src/components/Formatter.tsx`).
- **Git:** keputusan user (2026-08-15): proyek di-init jadi git repo dengan .gitignore. Commit baseline dibuat sebelum Task 1; setiap task diakhiri commit. Worktree TIDAK dipakai — eksekusi langsung di direktori utama (disetujui user).
- **Reduced motion:** semua gimmick animasi dinonaktifkan saat `prefers-reduced-motion: reduce`.
- **Copy wajib `.catch()`:** kegagalan clipboard harus menunjukkan pesan + mood pensil `'sad'`, tidak boleh unhandled promise rejection.

---

### Task 1: globals.css — Palet, keyframes, CSS pensil, rainbow, scrollbar, reduced-motion

**Files:**
- Modify: `src/app/globals.css` (append setelah blok `.above-overlay` yang sudah ada)

**Interfaces:**
- Produces: class CSS yang dipakai task 2-5: `.pencil`, `.pencil-eraser`, `.pencil-body`, `.pencil-tip`, `.pencil-eye`, `.pencil-eye.left/.right`, `.mood-idle/.mood-typing/.mood-happy/.mood-sad`, `.rainbow-active`, `.studio-card.rainbow`, `.studio-scroll`, keyframes `pencil-bob`, `pencil-type`, `pencil-happy`, `pencil-sad`, `confetti-fall`, `rainbow-hue`, `rainbow-border`, `blink`.

- [ ] **Step 1: Append CSS ke `src/app/globals.css`**

Tambahkan blok berikut di akhir file (jangan ubah isi yang sudah ada):

```css
/* =============================================
   STUDIO DENAH — polish, keyframes, mascot
   ============================================= */

/* ---- Mascot pensil (digambar murni CSS) ---- */
.pencil-wrap {
  display: inline-flex;
  cursor: pointer;
  user-select: none;
  line-height: 0;
  border: none;
  background: none;
  padding: 0;
}

.pencil {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 100px;
  transform-origin: 50% 88%;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.45));
}

.pencil-eraser {
  position: absolute;
  top: 0;
  left: 8px;
  width: 24px;
  height: 16px;
  background: linear-gradient(180deg, #f9a8d4, #ec4899);
  border-radius: 6px 6px 0 0;
}

.pencil-eraser::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: -2px;
  width: 28px;
  height: 8px;
  background: linear-gradient(180deg, #9ca3af, #6b7280);
  border-radius: 2px;
}

.pencil-body {
  position: absolute;
  top: 16px;
  left: 4px;
  width: 32px;
  height: 56px;
  background: linear-gradient(180deg, #fde047, #f59e0b 55%, #fbbf24);
  border-radius: 4px 4px 0 0;
}

.pencil-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 6px;
  width: 4px;
  height: 100%;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 2px;
}

.pencil-tip {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-bottom: 26px solid #d97706;
}

.pencil-tip::after {
  content: '';
  position: absolute;
  top: 14px;
  left: -6px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 12px solid #374151;
}

.pencil-eye {
  position: absolute;
  top: 34px;
  width: 6px;
  height: 8px;
  background: #1f2937;
  border-radius: 50%;
  animation: blink 4s infinite;
}

.pencil-eye.left  { left: 9px; }
.pencil-eye.right { right: 9px; }

/* ---- Keyframes ---- */
@keyframes pencil-bob {
  0%, 100% { transform: rotate(-6deg) translateY(0); }
  50%      { transform: rotate(6deg) translateY(-6px); }
}

@keyframes pencil-type {
  0%, 100% { transform: rotate(-10deg) translateY(0); }
  25%      { transform: rotate(-2deg) translateY(-2px); }
  50%      { transform: rotate(6deg) translateY(0); }
  75%      { transform: rotate(-2deg) translateY(-2px); }
}

@keyframes pencil-happy {
  0%   { transform: rotate(0) translateY(0); }
  25%  { transform: rotate(15deg) translateY(-16px); }
  50%  { transform: rotate(-15deg) translateY(-10px); }
  75%  { transform: rotate(10deg) translateY(-14px); }
  100% { transform: rotate(0) translateY(0); }
}

@keyframes pencil-sad {
  0%, 100% { transform: rotate(-16deg) translateY(2px); }
  50%      { transform: rotate(-12deg) translateY(5px); }
}

@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95%           { transform: scaleY(0.1); }
}

@keyframes confetti-fall {
  0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--dx), 110vh) rotate(var(--rot)); opacity: 0; }
}

@keyframes rainbow-hue {
  0%   { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

@keyframes rainbow-border {
  0%   { border-color: #f87171; box-shadow: 0 0 40px rgba(248, 113, 113, 0.35); }
  17%  { border-color: #fbbf24; box-shadow: 0 0 40px rgba(251, 191, 36, 0.35); }
  34%  { border-color: #4ade80; box-shadow: 0 0 40px rgba(74, 222, 128, 0.35); }
  51%  { border-color: #22d3ee; box-shadow: 0 0 40px rgba(34, 211, 238, 0.35); }
  68%  { border-color: #3b82f6; box-shadow: 0 0 40px rgba(59, 130, 246, 0.35); }
  85%  { border-color: #c084fc; box-shadow: 0 0 40px rgba(192, 132, 252, 0.35); }
  100% { border-color: #f87171; box-shadow: 0 0 40px rgba(248, 113, 113, 0.35); }
}

/* ---- Mood pensil ---- */
.mood-idle   .pencil { animation: pencil-bob 2.4s ease-in-out infinite; }
.mood-typing .pencil { animation: pencil-type 0.5s ease-in-out infinite; }
.mood-happy  .pencil { animation: pencil-happy 0.9s ease-in-out; }
.mood-sad    .pencil {
  animation: pencil-sad 2s ease-in-out infinite;
  filter: grayscale(0.85) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.45));
}

/* ---- Rainbow mode ---- */
.rainbow-active .pencil,
.rainbow-active {
  animation: rainbow-hue 2s linear infinite;
}

.studio-card.rainbow {
  animation: rainbow-border 3s linear infinite;
}

/* ---- Scrollbar kustom untuk panel hasil ---- */
.studio-scroll::-webkit-scrollbar { width: 8px; }
.studio-scroll::-webkit-scrollbar-thumb {
  background: rgba(96, 165, 250, 0.35);
  border-radius: 9999px;
}
.studio-scroll::-webkit-scrollbar-track { background: transparent; }

/* ---- Reduced motion ---- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verifikasi tidak ada konflik CSS**

Run: `npx tsc --noEmit`
Expected: PASS (0 error). CSS baru tidak memengaruhi TypeScript; pastikan tidak ada duplikasi selector yang sudah ada (`bg-main`, `bg-overlay`, `above-overlay`).

---

### Task 2: Pencil.tsx — Mascot pensil dengan mood + easter egg

**Files:**
- Create: `src/components/Pencil.tsx`

**Interfaces:**
- Consumes: class CSS dari Task 1 (`.pencil`, `.mood-*`, `.rainbow-active`).
- Produces: `Pencil({ mood, rainbow, onEasterEgg })` — mood: `'idle' | 'typing' | 'happy' | 'sad'`; rainbow: boolean; onEasterEgg: `() => void` (dipanggil saat 7 klik dalam 2 detik).

- [ ] **Step 1: Tulis komponen**

```tsx
'use client'

import { useRef } from 'react'

export type Mood = 'idle' | 'typing' | 'happy' | 'sad'

interface PencilProps {
  mood: Mood
  rainbow: boolean
  onEasterEgg: () => void
}

const CLICK_WINDOW_MS = 2000
const EASTER_EGG_CLICKS = 7

export default function Pencil({ mood, rainbow, onEasterEgg }: PencilProps) {
  const clicks = useRef<number[]>([])

  function handleClick() {
    const now = Date.now()
    clicks.current = clicks.current.filter((t) => now - t < CLICK_WINDOW_MS)
    clicks.current.push(now)
    if (clicks.current.length >= EASTER_EGG_CLICKS) {
      clicks.current = []
      onEasterEgg()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Pensil ajaib — klik cepat 7x untuk kejutan"
      title="Pensil ajaib — klik cepat 7x untuk kejutan"
      className={`pencil-wrap ${rainbow ? 'rainbow-active' : ''}`}
    >
      <span className={`pencil mood-${mood}`}>
        <span className="pencil-eraser" />
        <span className="pencil-body">
          <span className="pencil-eye left" />
          <span className="pencil-eye right" />
        </span>
        <span className="pencil-tip" />
      </span>
    </button>
  )
}
```

- [ ] **Step 2: Verifikasi**

Run: `npx tsc --noEmit`
Expected: PASS.

---

### Task 3: Confetti.tsx — Partikel confetti zero-dep

**Files:**
- Create: `src/components/Confetti.tsx`

**Interfaces:**
- Consumes: keyframe `confetti-fall` + variabel CSS `--dx`, `--rot` dari Task 1.
- Produces: `Confetti({ burst, from })` — burst: number (increment memicu ledakan baru); from: `{ x: number; y: number }` (titik asal dalam viewport, px). Komponen merender partikel `position: fixed`; harus `pointer-events: none` dan membersihkan partikel usang agar DOM tidak menumpuk.

- [ ] **Step 1: Tulis komponen**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
  id: number
  batch: number
  color: string
  dx: number
  rot: number
  delay: number
  left: number
  size: number
}

interface ConfettiProps {
  burst: number
  from: { x: number; y: number }
}

const COLORS = ['#3b82f6', '#22d3ee', '#facc15', '#f472b6', '#ffffff', '#60a5fa']
const COUNT = 60
const LIFETIME_MS = 1800
const KEEP_BATCHES = 2

export default function Confetti({ burst, from }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const idRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (burst === 0) return

    const batch: Particle[] = Array.from({ length: COUNT }, () => ({
      id: idRef.current++,
      batch: burst,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      dx: (Math.random() - 0.5) * 560,
      rot: (Math.random() - 0.5) * 720,
      delay: Math.random() * 0.15,
      left: from.x + (Math.random() - 0.5) * 40,
      size: 6 + Math.random() * 6,
    }))

    setParticles((prev) => [
      ...prev.filter((p) => p.batch > burst - KEEP_BATCHES),
      ...batch,
    ])

    timerRef.current = window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.batch !== burst))
    }, LIFETIME_MS)

    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [burst]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-[2px]"
          style={{
            left: p.left,
            top: from.y,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            animation: `confetti-fall 1.5s ease-in ${p.delay}s forwards`,
            ['--dx' as string]: `${p.dx}px`,
            ['--rot' as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi**

Run: `npx tsc --noEmit`
Expected: PASS.

---

### Task 4: StatusBar.tsx — Pesan sarkastik dinamis

**Files:**
- Create: `src/components/StatusBar.tsx`

**Interfaces:**
- Produces: `StatusBar({ message, modeLabel })` — message: string; modeLabel: string (label mode aktif untuk ditampilkan kanan).

- [ ] **Step 1: Tulis komponen**

```tsx
interface StatusBarProps {
  message: string
  modeLabel: string
}

export default function StatusBar({ message, modeLabel }: StatusBarProps) {
  return (
    <footer className="flex h-10 shrink-0 items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-slate-400 backdrop-blur-xl">
      <span className="truncate">{message}</span>
      <span className="shrink-0 font-mono text-slate-500">
        mode: {modeLabel.toLowerCase()}
      </span>
    </footer>
  )
}
```

- [ ] **Step 2: Verifikasi**

Run: `npx tsc --noEmit`
Expected: PASS.

---

### Task 5: Formatter.tsx — Refactor state utama + wiring semua gimmick + bug fix

**Files:**
- Modify: `src/components/Formatter.tsx` (tulis ulang penuh; logika format dipertahankan)

**Interfaces:**
- Consumes: `Pencil` (Task 2), `Confetti` (Task 3), `StatusBar` (Task 4), class CSS Task 1.
- Produces: default export `Formatter()` — merender seluruh layout Studio (header + grid + status bar), memegang state `input`, `mode`, `copied`, `rainbow`, `mood`, `burst`, `copyFrom`, `copyError`, `msgIndex`.

- [ ] **Step 1: Tulis ulang komponen**

Pertahankan identik: `CaseMode`, `ModeOption`, `MODES`, `toTitleCase`, `applyCase`, `stripPrefix`. Ganti seluruh bagian state/JSX:

```tsx
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
    <div className={`studio-card flex h-full flex-col gap-6 ${rainbow ? 'rainbow' : ''}`}>
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
```

Catatan: `React.ChangeEvent` perlu `import type React from 'react'`? Tidak — dengan `jsx: preserve` dan `@types/react`, namespace `React` global tersedia lewat `import { ... } from 'react'`? Sebenarnya tidak otomatis. Aman: tambahkan `import type { ChangeEvent } from 'react'` dan ganti tipe param menjadi `ChangeEvent<HTMLTextAreaElement>`. Verifikasi di Step 3 akan menangkapnya.

- [ ] **Step 2: Verifikasi TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Verifikasi build**

Run: `npm run build`
Expected: build sukses (PASS), tidak ada warning lint-blocking.

---

### Task 6: page.tsx + layout.tsx — Shell full-viewport & metadata

**Files:**
- Modify: `src/app/page.tsx` (tulis ulang penuh)
- Modify: `src/app/layout.tsx:4-7` (metadata)

**Interfaces:**
- Consumes: `Formatter` (Task 5), class CSS `bg-main`, `bg-overlay`, `above-overlay` (sudah ada di globals.css).

- [ ] **Step 1: Tulis ulang `src/app/page.tsx`**

```tsx
import Formatter from '@/components/Formatter'

export default function Home() {
  return (
    <main className="bg-main bg-overlay min-h-screen">
      <div className="above-overlay h-screen overflow-hidden p-6">
        <Formatter />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Update metadata `src/app/layout.tsx`**

```tsx
export const metadata: Metadata = {
  title: 'Studio Denah — Formatter Alamat CorelDraw',
  description: 'Formatter alamat denah untuk CorelDraw. Paste teks, rapi otomatis, salin langsung.',
}
```

- [ ] **Step 3: Verifikasi**

Run: `npx tsc --noEmit && npm run build`
Expected: keduanya PASS.

---

### Task 7: Verifikasi visual manual (desktop + mobile + gimmick)

**Files:** none.

- [ ] **Step 1: Jalankan dev server**

Run: `npm run dev` (background, biarkan berjalan).

- [ ] **Step 2: Cek tampilan desktop**

Buka `http://localhost:3000` dengan browser (playwright):
- Ambil screenshot full page. Harus terlihat: header glass dengan pensil + judul, grid 2 kolom penuh tinggi, status bar di bawah, textarea & hasil sejajar.
- Assert visual: card memenuhi layar (`h-full`), tidak ada scroll vertikal halaman (konten dalam panel hasil yang scroll).

- [ ] **Step 3: Cek responsif mobile**

Resize viewport ke `390x844`. Harus: layout stack 1 kolom, tidak ada elemen terpotong horizontal.

- [ ] **Step 4: Uji gimmick**

1. Klik tombol "Salin → CorelDraw" → confetti muncul + pensil lompat + status bar pesan sukses.
2. Kosongkan input → pensil jadi layu/sad + pesan kosong.
3. Ketik cepat → pensil mood typing.
4. Klik pensil 7x cepat → rainbow mode aktif (border card berputar pelangi) + pesan "MODE PELANGI! 🌈" selama 10 detik.
5. Cek `prefers-reduced-motion: reduce` (jika tersedia di browser) → animasi berhenti.

- [ ] **Step 5: Verifikasi final**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS keduanya. Matikan dev server.
