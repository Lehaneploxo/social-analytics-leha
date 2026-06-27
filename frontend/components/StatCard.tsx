'use client'

import { motion } from 'framer-motion'
import { formatNumber } from '../lib/utils'

interface Props {
  label: string
  value: number
  icon: React.ReactNode
  color?: string
  delay?: number
}

export function StatCard({ label, value, icon, color = '#6366f1', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="glass hover-glass p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#64648a' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}22`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color: '#e4e4f0' }}>
        {formatNumber(value)}
      </div>
    </motion.div>
  )
}
