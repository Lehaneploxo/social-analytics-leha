'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Users, Settings, TrendingUp } from 'lucide-react'

const links = [
  { href: '/', label: 'Дашборд', icon: BarChart3 },
  { href: '/bloggers', label: 'Блогеры', icon: Users },
  { href: '/admin', label: 'Админ', icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* Creator banner */}
      <div
        className="w-full text-center py-1.5 text-xs font-semibold tracking-widest uppercase"
        style={{
          background: 'linear-gradient(90deg,#6366f1,#a855f7,#ec4899,#6366f1)',
          backgroundSize: '200% auto',
          animation: 'gradient-move 4s linear infinite',
          color: '#fff',
          letterSpacing: '0.2em',
        }}
      >
        CREATOR LEHA NEPLOXO
      </div>

      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(7,7,15,0.88)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}
            >
              <TrendingUp size={14} color="white" />
            </div>
            <span className="font-semibold text-sm tracking-tight hidden xs:inline" style={{ color: '#e4e4f0' }}>
              Social Analytics
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    color: active ? '#e4e4f0' : '#64648a',
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  }}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
