import Formatter from '@/components/Formatter'

export default function Home() {
  return (
    <main className="bg-main bg-overlay min-h-screen">
      <div className="above-overlay min-h-screen flex flex-col items-center justify-center p-6">
        <Formatter />
      </div>
    </main>
  )
}
