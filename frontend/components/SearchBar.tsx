'use client'

import { Search, SlidersHorizontal } from 'lucide-react'

interface Props {
  search: string
  onSearch: (v: string) => void
  platform: string
  onPlatform: (v: string) => void
  sortBy: string
  onSortBy: (v: string) => void
  order: string
  onOrder: (v: string) => void
}

const PLATFORMS = [
  { value: '', label: 'Все' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
]

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Дата добавления' },
  { value: 'views', label: 'Просмотры' },
  { value: 'likes', label: 'Лайки' },
  { value: 'comments', label: 'Комментарии' },
  { value: 'publishedAt', label: 'Дата публикации' },
  { value: 'updatedAt', label: 'Дата обновления' },
]

export function SearchBar({ search, onSearch, platform, onPlatform, sortBy, onSortBy, order, onOrder }: Props) {
  return (
    <div className="glass p-4 flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64648a' }} />
        <input
          type="text"
          placeholder="Поиск по нику, имени, ссылке..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal size={14} style={{ color: '#64648a', flexShrink: 0 }} />

        {/* Platform filter */}
        <select
          value={platform}
          onChange={(e) => onPlatform(e.target.value)}
          className="px-3 py-2.5 text-sm"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value} style={{ background: '#0f0f1a' }}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortBy(e.target.value)}
          className="px-3 py-2.5 text-sm"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value} style={{ background: '#0f0f1a' }}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Order toggle */}
        <button
          onClick={() => onOrder(order === 'desc' ? 'asc' : 'desc')}
          className="px-3 py-2.5 text-sm rounded-[10px] transition-all font-medium"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e4e4f0',
          }}
        >
          {order === 'desc' ? '↓' : '↑'}
        </button>
      </div>
    </div>
  )
}
