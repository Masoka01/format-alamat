import Formatter from '@/components/Formatter'

export default function App() {
  return (
    <main className="min-h-[100dvh] bg-page text-ink">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1280px] flex-col items-center justify-center px-4 py-8 sm:px-6">
        <Formatter />
      </div>
    </main>
  )
}