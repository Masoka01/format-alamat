import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Studio Denah — Formatter Alamat CorelDraw',
  description: 'Formatter alamat denah untuk CorelDraw. Paste teks, rapi otomatis, salin langsung.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
