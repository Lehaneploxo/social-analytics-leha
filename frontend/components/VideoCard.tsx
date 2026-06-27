'use client'

import { motion } from 'framer-motion'
import { Video } from '../lib/api'
import { formatNumber, formatDate, timeAgo } from '../lib/utils'
import { Play, Heart, MessageCircle, Share2, ExternalLink, RefreshCw, Trash2 } from 'lucide-react'

interface Props {
  video: Video
  index?: number
  onRefresh?: (id: string) => void
  onDelete?: (id: string) => void
  showAdmin?: boolean
}

export function VideoCard({ video, index = 0, onRefresh, onDelete, showAdmin }: Props) {
  const isTiktok = video.platform === 'tiktok'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.3 }}
      className="glass hover-glass overflow-hidden"
    >
      <div className="flex">
        {/* Cover */}
        <div
          className="relative flex-shrink-0"
          style={{ width: 80, minHeight: 110, background: 'rgba(255,255,255,0.04)' }}
        >
          {video.coverUrl ? (
            <img
              src={video.coverUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ minHeight: 110 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 110 }}>
              <Play size={18} style={{ color: '#64648a' }} />
            </div>
          )}
          <div
            className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold"
            style={isTiktok
              ? { background: 'rgba(255,45,85,0.92)', color: '#fff', fontSize: 10 }
              : { background: 'rgba(225,48,108,0.92)', color: '#fff', fontSize: 10 }
            }
          >
            {isTiktok ? 'TT' : 'IG'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          {/* Author */}
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {video.avatar && (
                <img src={video.avatar} alt="" className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
              )}
              <span className="text-xs font-semibold" style={{ color: '#e4e4f0' }}>
                @{video.accountNick}
              </span>
              {video.accountName !== video.accountNick && (
                <span className="text-xs truncate max-w-[100px]" style={{ color: '#64648a' }}>
                  {video.accountName}
                </span>
              )}
            </div>
            {video.description && (
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#9090b0' }}>
                {video.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {[
              { Icon: Play, value: video.views, color: '#60a5fa' },
              { Icon: Heart, value: video.likes, color: '#f87171' },
              { Icon: MessageCircle, value: video.comments, color: '#34d399' },
              { Icon: Share2, value: video.reposts, color: '#a78bfa' },
            ].map(({ Icon, value, color }) => (
              <div key={color} className="flex items-center gap-1">
                <Icon size={10} style={{ color }} />
                <span className="text-xs font-medium" style={{ color: '#e4e4f0' }}>
                  {formatNumber(value)}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex gap-1.5 text-xs flex-wrap" style={{ color: '#64648a' }}>
              <span>{formatDate(video.publishedAt)}</span>
              <span className="hidden sm:inline">· обн. {timeAgo(video.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#64648a' }}
              >
                <ExternalLink size={12} />
              </a>
              {showAdmin && (
                <>
                  <button
                    onClick={() => onRefresh?.(video.id)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: '#64648a' }}
                    title="Обновить"
                  >
                    <RefreshCw size={12} />
                  </button>
                  <button
                    onClick={() => onDelete?.(video.id)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: '#64648a' }}
                    title="Удалить"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
