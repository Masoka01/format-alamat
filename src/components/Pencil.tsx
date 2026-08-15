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