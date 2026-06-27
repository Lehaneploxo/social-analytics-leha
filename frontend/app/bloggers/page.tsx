'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchBloggers } from '../../lib/api'
import { BloggerCard } from '../../components/BloggerCard'
import { motion } from 'framer-motion'
import { Users, Search } from 'lucide-react'

export default function BloggersPage() {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')

  const { data: bloggers, isLoading } = useQuery({
    queryKey: ['bloggers'],
    queryFn: fetchBloggers,
  })

  const filtered = (bloggers || []).filter((b) => {
    const matchPlatform = !platform || b.platform === platform
    const matchSearch = !search ||
      b.accountNick.toLowerCase().includes(search.toLowerCase()) ||
      b.accountName.toLowerCase().includes(search.toLowerCase())
    return matchPlatform && matchSearch
  })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Users size={20} style={{ color: '#6366f1' }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e4e4f0' }}>Блогеры</h1>
          <p className="text-sm" style={{ color: '#64648a' }}>
            {filtered.length} блогеров
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="glass p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64648a' }} />
          <input
            type="text"
            placeholder="Поиск по нику или имени..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-2.5 text-sm"
        >
          <option value="" style={{ background: '#0f0f1a' }}>Все платформы</option>
          <option value="tiktok" style={{ background: '#0f0f1a' }}>TikTok</option>
          <option value="instagram" style={{ background: '#0f0f1a' }}>Instagram</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="glass h-24 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass p-16 text-center" style={{ color: '#64648a' }}>
          Блогеры не найдены
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => (
            <BloggerCard
              key={`${b.platform}:${b.accountNick}`}
              blogger={b}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
