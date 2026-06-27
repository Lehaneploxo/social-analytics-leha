'use client'

import { motion } from 'framer-motion'
import { formatNumber } from '../lib/utils'
import { Play, Heart, MessageCircle, Video } from 'lucide-react'

interface PlatformStats {
  total: number
  views: number
  likes: number
  comments: number
}

interface Props {
  platform: 'tiktok' | 'instagram' | 'total'
  stats: PlatformStats
  delay?: number
}

const config = {
  tiktok: {
    label: 'TikTok',
    gradient: 'linear-gradient(135deg,#ff2d55,#ff6b35)',
    glow: 'rgba(255,45,85,0.15)',
    icon: '🎵',
  },
  instagram: {
    label: 'Instagram',
    gradient: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
    glow: 'rgba(225,48,108,0.15)',
    icon: '📸',
  },
  total: {
    label: 'Итого',
    gradient: 'linear-gradient(135deg,#6366f1,#a855f7)',
    glow: 'rgba(99,102,241,0.15)',
    icon: '📊',
  },
}

export function PlatformSection({ platform, stats, delay = 0 }: Props) {
  const c = config[platform]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="glass p-6 flex flex-col gap-5"
      style={{ boxShadow: `0 0 40px ${c.glow}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: c.gradient }}
        >
          {c.icon}
        </div>
        <h3 className="font-semibold text-base" style={{ color: '#e4e4f0' }}>
          {c.label}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Видео', value: stats.total, Icon: Video, color: '#94a3b8' },
          { label: 'Просмотры', value: stats.views, Icon: Play, color: '#60a5fa' },
          { label: 'Лайки', value: stats.likes, Icon: Heart, color: '#f87171' },
          { label: 'Комментарии', value: stats.comments, Icon: MessageCircle, color: '#34d399' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="glass-sm p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={11} style={{ color }} />
              <span className="text-xs" style={{ color: '#64648a' }}>{label}</span>
            </div>
            <div className="text-lg font-bold" style={{ color: '#e4e4f0' }}>
              {formatNumber(value)}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
