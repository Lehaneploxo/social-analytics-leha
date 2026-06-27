'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAnalytics, fetchBloggers, fetchVideos } from '../lib/api'
import { PlatformSection } from '../components/PlatformSection'
import { VideoCard } from '../components/VideoCard'
import { SearchBar } from '../components/SearchBar'
import { OverviewCharts } from '../components/charts/OverviewCharts'
import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)

  const { data: analytics, isLoading: aLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
  })

  const { data: bloggers } = useQuery({
    queryKey: ['bloggers'],
    queryFn: fetchBloggers,
  })

  const { data: videosData, isLoading: vLoading, refetch } = useQuery({
    queryKey: ['videos', { platform, search, sortBy, order, page }],
    queryFn: () => fetchVideos({ platform, search, sortBy, order, page, limit: 30 }),
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e4e4f0' }}>
            Аналитика
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64648a' }}>
            TikTok & Instagram в реальном времени
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#818cf8',
          }}
        >
          <RefreshCw size={14} />
          Обновить
        </button>
      </motion.div>

      {/* Platform stat blocks */}
      {aLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass h-40 animate-pulse" />
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlatformSection platform="tiktok" stats={analytics.tiktok} delay={0} />
          <PlatformSection platform="instagram" stats={analytics.instagram} delay={0.08} />
          <PlatformSection platform="total" stats={analytics.overall} delay={0.16} />
        </div>
      ) : null}

      {/* Charts */}
      {bloggers && analytics && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: '#6366f1' }} />
            <h2 className="text-base font-semibold" style={{ color: '#e4e4f0' }}>Графики</h2>
          </div>
          <OverviewCharts
            bloggers={bloggers}
            topVideos={analytics.topVideos}
            tiktokTotal={analytics.tiktok.total}
            instagramTotal={analytics.instagram.total}
          />
        </div>
      )}

      {/* Videos section */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#e4e4f0' }}>
          Все видео {videosData ? `(${videosData.total})` : ''}
        </h2>

        <div className="space-y-3">
          <SearchBar
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1) }}
            platform={platform}
            onPlatform={(v) => { setPlatform(v); setPage(1) }}
            sortBy={sortBy}
            onSortBy={(v) => { setSortBy(v); setPage(1) }}
            order={order}
            onOrder={(v) => { setOrder(v); setPage(1) }}
          />

          {vLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="glass h-32 animate-pulse" />
              ))}
            </div>
          ) : videosData?.videos.length === 0 ? (
            <div className="glass p-12 text-center" style={{ color: '#64648a' }}>
              Видео не найдены
            </div>
          ) : (
            <div className="space-y-3">
              {videosData?.videos.map((v, i) => (
                <VideoCard key={v.id} video={v} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {videosData && videosData.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-40 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#e4e4f0' }}
              >
                ← Пред.
              </button>
              <span className="text-sm" style={{ color: '#64648a' }}>
                {page} / {videosData.pages}
              </span>
              <button
                disabled={page >= videosData.pages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-40 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#e4e4f0' }}
              >
                След. →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
