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