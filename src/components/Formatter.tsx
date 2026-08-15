'use client'

import { useState } from 'react'

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

  const lines: string[] = input
    .split('\n')
    .map(stripPrefix)
    .filter(Boolean)
    .map((l) => applyCase(l, mode))

  function handleCopy(): void {
    if (!lines.length) return
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h1 className="text-lg font-medium text-gray-800 mb-1">Formatter Alamat Denah</h1>
      <p className="text-sm text-gray-500 mb-5">
        Paste teks bernomor, salin hasil langsung ke CorelDraw.
      </p>

      {/* Mode kapitalisasi */}
      <div className="flex flex-wrap gap-2 mb-5">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              mode === m.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-gray-500">Input</label>
            <button
              onClick={() => setInput('')}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Hapus
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            placeholder={'1.omah\n2.kampung\n3.jalan ati ajor'}
            className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none outline-none focus:border-blue-400 bg-white text-gray-800 leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1">
            Format: <code>1.</code> &nbsp;<code>1)</code> &nbsp;<code>-</code> &nbsp;<code>•</code> &nbsp;atau tanpa awalan
          </p>
        </div>

        {/* Output */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-gray-500">Hasil</label>
            {copied && (
              <span className="text-xs text-green-600 font-medium">Disalin</span>
            )}
          </div>
          <div className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-gray-50 min-h-[240px] leading-relaxed text-gray-800">
            {lines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <button
            onClick={handleCopy}
            className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm rounded-lg transition-all"
          >
            Salin → CorelDraw
          </button>
        </div>
      </div>
    </div>
  )
}
