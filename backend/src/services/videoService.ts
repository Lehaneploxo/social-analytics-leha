import { PrismaClient } from '@prisma/client'
import { scrapeVideo } from '../scrapers'

const prisma = new PrismaClient()

export async function addVideo(url: string) {
  const existing = await prisma.video.findUnique({ where: { url } })
  if (existing) return { video: existing, created: false }

  const data = await scrapeVideo(url)

  const video = await prisma.video.create({
    data: {
      platform: data.platform,
      url: data.url,
      videoId: data.videoId,
      accountName: data.accountName,
      accountNick: data.accountNick,
      avatar: data.avatar,
      publishedAt: data.publishedAt,
      description: data.description,
      coverUrl: data.coverUrl,
      videoUrl: data.videoUrl,
      views: data.views,
      likes: data.likes,
      comments: data.comments,
      reposts: data.reposts,
      saves: data.saves,
    },
  })

  return { video, created: true }
}

export async function refreshVideo(id: string) {
  const existing = await prisma.video.findUnique({ where: { id } })
  if (!existing) throw new Error('Video not found')

  const data = await scrapeVideo(existing.url)

  return prisma.video.update({
    where: { id },
    data: {
      views: data.views,
      likes: data.likes,
      comments: data.comments,
      reposts: data.reposts,
      saves: data.saves,
      accountName: data.accountName,
      accountNick: data.accountNick,
      avatar: data.avatar || existing.avatar,
      coverUrl: data.coverUrl || existing.coverUrl,
      description: data.description || existing.description,
    },
  })
}

export async function refreshAllVideos() {
  const videos = await prisma.video.findMany()
  const results = await Promise.allSettled(
    videos.map((v) => refreshVideo(v.id))
  )
  const success = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  return { total: videos.length, success, failed }
}

export async function deleteVideo(id: string) {
  return prisma.video.delete({ where: { id } })
}

export async function getVideos(params: {
  platform?: string
  search?: string
  sortBy?: string
  order?: string
  page?: number
  limit?: number
}) {
  const {
    platform,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 50,
  } = params

  const where: Record<string, unknown> = {}
  if (platform && platform !== 'all') where.platform = platform
  if (search) {
    where.OR = [
      { accountName: { contains: search } },
      { accountNick: { contains: search } },
      { url: { contains: search } },
    ]
  }

  const validSortFields = ['views', 'likes', 'comments', 'publishedAt', 'createdAt', 'updatedAt']
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
  const sortOrder = order === 'asc' ? 'asc' : 'desc'

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.video.count({ where }),
  ])

  return { videos, total, page, limit, pages: Math.ceil(total / limit) }
}

export async function getBloggers() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const map = new Map<
    string,
    {
      accountNick: string
      accountName: string
      avatar: string | null
      platform: string
      videoCount: number
      totalViews: number
      totalLikes: number
      totalComments: number
      lastVideo: typeof videos[0] | null
    }
  >()

  for (const v of videos) {
    const key = `${v.platform}:${v.accountNick}`
    if (!map.has(key)) {
      map.set(key, {
        accountNick: v.accountNick,
        accountName: v.accountName,
        avatar: v.avatar,
        platform: v.platform,
        videoCount: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        lastVideo: null,
      })
    }
    const b = map.get(key)!
    b.videoCount++
    b.totalViews += v.views
    b.totalLikes += v.likes
    b.totalComments += v.comments
    if (!b.lastVideo || v.createdAt > b.lastVideo.createdAt) {
      b.lastVideo = v
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalViews - a.totalViews)
}

export async function getBloggerVideos(accountNick: string, platform?: string) {
  const where: Record<string, unknown> = { accountNick }
  if (platform) where.platform = platform

  return prisma.video.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAnalytics() {
  const videos = await prisma.video.findMany()

  const tiktok = videos.filter((v) => v.platform === 'tiktok')
  const instagram = videos.filter((v) => v.platform === 'instagram')

  const sum = (arr: typeof videos, key: keyof typeof videos[0]) =>
    arr.reduce((acc, v) => acc + (Number(v[key]) || 0), 0)

  return {
    overall: {
      total: videos.length,
      views: sum(videos, 'views'),
      likes: sum(videos, 'likes'),
      comments: sum(videos, 'comments'),
    },
    tiktok: {
      total: tiktok.length,
      views: sum(tiktok, 'views'),
      likes: sum(tiktok, 'likes'),
      comments: sum(tiktok, 'comments'),
    },
    instagram: {
      total: instagram.length,
      views: sum(instagram, 'views'),
      likes: sum(instagram, 'likes'),
      comments: sum(instagram, 'comments'),
    },
    topVideos: videos
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
  }
}
