import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Denah Formatter',
  description: 'Formatter alamat denah untuk CorelDraw',
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
