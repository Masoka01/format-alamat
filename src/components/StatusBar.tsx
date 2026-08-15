interface StatusBarProps {
  message: string
  modeLabel: string
}

export default function StatusBar({ message, modeLabel }: StatusBarProps) {
  return (
    <footer className="flex h-10 shrink-0 items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-slate-400 backdrop-blur-xl">
      <span className="truncate" aria-live="polite">{message}</span>
      <span className="shrink-0 font-mono text-slate-500">
        mode: {modeLabel.toLowerCase()}
      </span>
    </footer>
  )
}
