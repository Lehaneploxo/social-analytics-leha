'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Blogger, Video } from '../../lib/api'
import { formatNumber } from '../../lib/utils'

const TIKTOK_COLOR = '#ff2d55'
const IG_COLOR = '#e1306c'
const COLORS = ['#6366f1','#a855f7','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6','#f97316','#84cc16']

interface Props {
  bloggers: Blogger[]
  topVideos: Video[]
  tiktokTotal: number
  instagramTotal: number
}

const TooltipStyle = {
  backgroundColor: '#0f0f1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#e4e4f0',
  fontSize: '12px',
}

export function OverviewCharts({ bloggers, topVideos, tiktokTotal, instagramTotal }: Props) {
  const top10Bloggers = bloggers.slice(0, 10).map((b) => ({
    name: `@${b.accountNick}`,
    views: b.totalViews,
    likes: b.totalLikes,
  }))

  const top10Videos = topVideos.slice(0, 10).map((v) => ({
    name: `@${v.accountNick}`,
    views: v.views,
    platform: v.platform,
  }))

  const platformPie = [
    { name: 'TikTok', value: tiktokTotal },
    { name: 'Instagram', value: instagramTotal },
  ].filter((d) => d.value > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Top bloggers by views */}
      <div className="glass p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#e4e4f0' }}>
          ТОП-10 блогеров по просмотрам
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={top10Bloggers} layout="vertical">
            <XAxis type="number" tickFormatter={formatNumber} tick={{ fill: '#64648a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TooltipStyle} formatter={(v: unknown) => formatNumber(Number(v))} />
            <Bar dataKey="views" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 videos */}
      <div className="glass p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#e4e4f0' }}>
          ТОП-10 видео по просмотрам
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={top10Videos} layout="vertical">
            <XAxis type="number" tickFormatter={formatNumber} tick={{ fill: '#64648a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TooltipStyle} formatter={(v: unknown) => formatNumber(Number(v))} />
            <Bar dataKey="views" radius={[0, 4, 4, 0]}>
              {top10Videos.map((entry, i) => (
                <Cell key={i} fill={entry.platform === 'tiktok' ? TIKTOK_COLOR : IG_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Videos by bloggers */}
      <div className="glass p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#e4e4f0' }}>
          Видео по блогерам
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bloggers.slice(0, 10).map((b) => ({
            name: `@${b.accountNick}`,
            count: b.videoCount,
          }))}>
            <XAxis dataKey="name" tick={{ fill: '#64648a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64648a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TooltipStyle} />
            <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform pie */}
      <div className="glass p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#e4e4f0' }}>
          Видео по платформам
        </h3>
        {platformPie.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={platformPie}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#64648a' }}
              >
                {platformPie.map((_, i) => (
                  <Cell key={i} fill={[TIKTOK_COLOR, IG_COLOR][i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TooltipStyle} formatter={(v: unknown) => formatNumber(Number(v))} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center" style={{ color: '#64648a' }}>
            Нет данных
          </div>
        )}
      </div>
    </div>
  )
}
