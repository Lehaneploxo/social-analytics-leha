import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface Video {
  id: string
  platform: 'tiktok' | 'instagram'
  url: string
  videoId: string
  accountName: string
  accountNick: string
  avatar: string | null
  publishedAt: string | null
  description: string | null
  coverUrl: string | null
  videoUrl: string | null
  views: number
  likes: number
  comments: number
  reposts: number
  saves: number
  createdAt: string
  updatedAt: string
}

export interface Blogger {
  accountNick: string
  accountName: string
  avatar: string | null
  platform: string
  videoCount: number
  totalViews: number
  totalLikes: number
  totalComments: number
  lastVideo: Video | null
}

export interface Analytics {
  overall: { total: number; views: number; likes: number; comments: number }
  tiktok: { total: number; views: number; likes: number; comments: number }
  instagram: { total: number; views: number; likes: number; comments: number }
  topVideos: Video[]
}

export interface VideosResult {
  videos: Video[]
  total: number
  page: number
  limit: number
  pages: number
}

// Videos
export const fetchVideos = (params: Record<string, string | number>) =>
  api.get<VideosResult>('/api/videos', { params }).then((r) => r.data)

export const deleteVideo = (id: string) =>
  api.delete(`/api/videos/${id}`).then((r) => r.data)

export const refreshVideo = (id: string) =>
  api.post(`/api/videos/${id}/refresh`).then((r) => r.data)

// Bloggers
export const fetchBloggers = () =>
  api.get<Blogger[]>('/api/bloggers').then((r) => r.data)

export const fetchBloggerVideos = (nick: string, platform?: string) =>
  api.get<Video[]>(`/api/bloggers/${encodeURIComponent(nick)}/videos`, {
    params: platform ? { platform } : {},
  }).then((r) => r.data)

// Analytics
export const fetchAnalytics = () =>
  api.get<Analytics>('/api/analytics').then((r) => r.data)

// Admin
export const adminLogin = (secret: string) =>
  api.post<{ token: string }>('/api/admin/login', { secret }).then((r) => r.data)

export const addVideo = (url: string) =>
  api.post('/api/admin/videos', { url }).then((r) => r.data)

export const refreshAllVideos = () =>
  api.post('/api/admin/refresh-all').then((r) => r.data)

export const exportUrl = (format: 'csv' | 'json' | 'excel') => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : ''
  return `${BASE}/api/admin/export/${format}?token=${token}`
}

export default api
