import Formatter from '@/components/Formatter'

export default function Home() {
  return (
    <main className="bg-main bg-overlay min-h-screen">
      <div className="above-overlay mx-auto h-screen max-w-[1400px] overflow-y-auto p-6">
        <Formatter />
      </div>
    </main>
  )
}
