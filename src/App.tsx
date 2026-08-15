import Formatter from '@/components/Formatter'

export default function App() {
  return (
    <main className="bg-main bg-overlay min-h-[100dvh]">
      <div className="above-overlay mx-auto flex min-h-[100dvh] w-full max-w-[1280px] flex-col items-center justify-center px-4 py-8 sm:px-6">
        <Formatter />
      </div>
    </main>
  )
}