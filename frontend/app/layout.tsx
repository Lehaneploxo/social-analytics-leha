import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '../components/Navbar'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Social Analytics | Creator LEHA NEPLOXO',
  description: 'TikTok & Instagram analytics dashboard by LEHA NEPLOXO',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geist.variable} antialiased`}>
      <body className="min-h-screen" style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
        <Providers>
          <Navbar />
          <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
