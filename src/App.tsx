import { useEffect, useRef } from 'react'
import Formatter from '@/components/Formatter'

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)

  // iOS Safari: properti muted wajib aktif agar autoplay diizinkan.
  // Atribut saja kadang tidak cukup di React — set properti langsung
  // dan panggil play() secara eksplisit (rejection autoplay ditelan).
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.play().catch(() => {})
  }, [])

  return (
    <main className="bg-main bg-overlay min-h-[100dvh]">
      {/* Backdrop blur statis dari poster — mengisi area yang tidak
          tertutup video (contain). Layering: backdrop (-2) < video (-1)
          < veil (0) < konten (1). */}
      <div className="bg-video-backdrop" aria-hidden="true" />
      {/* Video background — di bawah veil (lihat .bg-video di globals.css).
          Foto /images/cok.webp tetap jadi fallback CSS di .bg-main
          dan poster selama video belum termuat. */}
      <video
        ref={videoRef}
        className="bg-video"
        src="/video/cok.webm"
        poster="/images/cok.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        disableRemotePlayback
      />
      <div className="above-overlay mx-auto flex min-h-[100dvh] w-full max-w-[1280px] flex-col items-center justify-center px-4 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6">
        <Formatter />
      </div>
    </main>
  )
}