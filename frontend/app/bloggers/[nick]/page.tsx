'use client'

import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchBloggerVideos, fetchBloggers } from '../../../lib/api'
import { VideoCard } from '../../../components/VideoCard'
import { formatNumber } from '../../../lib/utils'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Heart, MessageCircle, Video } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ nick: string }>
}

export default function BloggerPage({ params }: Props) {
  const { nick } = use(params)
  const searchParams = useSearchParams()
  const platform = searchParams.get('platform') || undefined
  const decodedNick = decodeURIComponent(nick)

  const { data: videos, isLoading } = useQuery({
    queryKey: ['blogger-videos', decodedNick, platform],
    queryFn: () => fetchBloggerVideos(decodedNick, platform),
  })

  const { data: bloggers } = useQuery({
    queryKey: ['bloggers'],
    queryFn: fetchBloggers,
  })

  const blogger = bloggers?.find(
    (b) => b.accountNick === decodedNick && (!platform || b.platform === platform)
  )

  const isTiktok = platform === 'tiktok'

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/bloggers"
          className="inline-flex items-center gap-2 text-sm mb-5 transition-colors"
          style={{ color: '#64648a' }}
        >
          <ArrowLeft size={14} />
          Все блогеры
        </Link>

        {/* Blogger header */}
        <div className="glass p-6">
          <div className="flex items-center gap-5">
            {blogger?.avatar ? (
              <img
                src={blogger.avatar}
                alt=""
                className="w-16 h-16 rounded-full object-cover ring-2"
                style={{ ringColor: isTiktok ? '#ff2d55' : '#e1306c' }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
              >
                {decodedNick[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold" style={{ color: '#e4e4f0' }}>
                  @{decodedNick}
                </h1>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={isTiktok
                    ? { background: 'rgba(255,45,85,0.2)', color: '#ff6080' }
                    : { background: 'rgba(225,48,108,0.2)', color: '#f06090' }
                  }
                >
                  {isTiktok ? 'TikTok' : 'Instagram'}
                </span>
              </div>
              {blogger?.accountName && (
                <p className="text-sm mt-0.5" style={{ color: '#64648a' }}>
                  {blogger.accountName}
                </p>
              )}
            </div>
          </div>

          {blogger && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { label: 'Видео', value: blogger.videoCount, Icon: Video, color: '#94a3b8' },
                { label: 'Просмотры', value: blogger.totalViews, Icon: Play, color: '#60a5fa' },
                { label: 'Лайки', value: blogger.totalLikes, Icon: Heart, color: '#f87171' },
                { label: 'Комментарии', value: blogger.totalComments, Icon: MessageCircle, color: '#34d399' },
              ].map(({ label, value, Icon, color }) => (
                <div key={label} className="glass-sm p-3 text-center">
                  <Icon size={14} className="mx-auto mb-1" style={{ color }} />
                  <div className="text-lg font-bold" style={{ color: '#e4e4f0' }}>
                    {formatNumber(value)}
                  </div>
                  <div className="text-xs" style={{ color: '#64648a' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Videos */}
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: '#e4e4f0' }}>
          Видео {videos ? `(${videos.length})` : ''}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="glass h-32 animate-pulse" />)}
          </div>
        ) : (videos || []).length === 0 ? (
          <div className="glass p-12 text-center" style={{ color: '#64648a' }}>Видео не найдены</div>
        ) : (
          <div className="space-y-3">
            {(videos || []).map((v, i) => (
              <VideoCard key={v.id} video={v} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
