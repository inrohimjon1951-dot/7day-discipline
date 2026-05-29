import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '7 Day Discipline',
  description: 'Intizomiy va ruhiy rivojlanish bellashuvi — Muhammadyusuf vs Shavkatjon',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  )
}
