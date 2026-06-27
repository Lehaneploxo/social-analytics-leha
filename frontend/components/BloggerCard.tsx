'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Blogger } from '../lib/api'
import { formatNumber, formatDate } from '../lib/utils'
import { Play, Heart, MessageCircle, Video, ChevronRight } from 'lucide-react'

interface Props {
  blogger: Blogger
  index?: number
}

export function BloggerCard({ blogger, index = 0 }: Props) {
  const isTiktok = blogger.platform === 'tiktok'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/bloggers/${encodeURIComponent(blogger.accountNick)}?platform=${blogger.platform}`}>
        <div className="glass hover-glass p-5 flex items-center gap-4 cursor-pointer">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {blogger.avatar ? (
              <img
                src={blogger.avatar}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
              >
                {blogger.accountNick[0]?.toUpperCase()}
              </div>
            )}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center text-xs"
              style={isTiktok
                ? { background: '#ff2d55' }
                : { background: 'linear-gradient(135deg,#833ab4,#fd1d1d)' }
              }
            >
              {isTiktok ? '♪' : '◉'}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm" style={{ color: '#e4e4f0' }}>
                @{blogger.accountNick}
              </span>
              <span className="text-xs truncate" style={{ color: '#64648a' }}>
                {blogger.accountName}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {[
                { Icon: Video, value: blogger.videoCount, color: '#94a3b8' },
                { Icon: Play, value: blogger.totalViews, color: '#60a5fa' },
                { Icon: Heart, value: blogger.totalLikes, color: '#f87171' },
                { Icon: MessageCircle, value: blogger.totalComments, color: '#34d399' },
              ].map(({ Icon, value, color }) => (
                <div key={color} className="flex items-center gap-1">
                  <Icon size={11} style={{ color }} />
                  <span className="text-xs font-medium" style={{ color: '#e4e4f0' }}>
                    {formatNumber(value)}
                  </span>
                </div>
              ))}
            </div>
            {blogger.lastVideo && (
              <div className="text-xs mt-1" style={{ color: '#64648a' }}>
                Последнее: {formatDate(blogger.lastVideo.createdAt)}
              </div>
            )}
          </div>

          <ChevronRight size={16} style={{ color: '#64648a', flexShrink: 0 }} />
        </div>
      </Link>
    </motion.div>
  )
}
