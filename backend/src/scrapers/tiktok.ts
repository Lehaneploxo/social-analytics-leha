import axios from 'axios'
import { Scraper, ScrapedVideoData } from './types'

const PAGE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0',
}

const API_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.tiktok.com/',
  'Origin': 'https://www.tiktok.com',
}

function extractNickFromUrl(url: string): string {
  const match = url.match(/tiktok\.com\/@([^/]+)/)
  return match ? match[1] : ''
}

function extractVideoId(url: string): string | null {
  const match = url.match(/video\/(\d+)/)
  return match ? match[1] : null
}

async function resolveShortUrl(url: string): Promise<string> {
  if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
    try {
      const res = await axios.get(url, {
        headers: PAGE_HEADERS,
        maxRedirects: 5,
        validateStatus: () => true,
        timeout: 10000,
      })
      return (res.request as { res?: { responseUrl?: string } })?.res?.responseUrl || url
    } catch {
      return url
    }
  }
  return url
}

interface TikTokStats {
  views: number
  likes: number
  comments: number
  reposts: number
  saves: number
  accountName: string
  accountNick: string
  avatar: string
  coverUrl: string
  description: string
  publishedAt: Date | undefined
}

async function tryPageScrape(url: string, videoId: string): Promise<Partial<TikTokStats>> {
  try {
    const res = await axios.get(url, { headers: PAGE_HEADERS, timeout: 20000 })
    const html: string = res.data

    // Pattern 1: __UNIVERSAL_DATA_FOR_REHYDRATION__ (current TikTok format as of 2025)
    const univMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/)
    if (univMatch) {
      try {
        const data = JSON.parse(univMatch[1])
        const scope = data?.__DEFAULT_SCOPE__
        const videoDetail = scope?.['webapp.video-detail']?.itemInfo?.itemStruct
          || scope?.['webapp.video-detail']?.itemInfo
        if (videoDetail) {
          const s = videoDetail.stats || videoDetail.statsV2 || {}
          const auth = videoDetail.author || {}
          return {
            views: parseInt(String(s.playCount || 0)) || 0,
            likes: parseInt(String(s.diggCount || 0)) || 0,
            comments: parseInt(String(s.commentCount || 0)) || 0,
            reposts: parseInt(String(s.shareCount || 0)) || 0,
            saves: parseInt(String(s.collectCount || 0)) || 0,
            description: String(videoDetail.desc || ''),
            coverUrl: videoDetail.video?.cover || videoDetail.video?.originCover || '',
            accountNick: String(auth.uniqueId || ''),
            accountName: String(auth.nickname || ''),
            avatar: String(auth.avatarThumb || auth.avatarLarger || ''),
            publishedAt: videoDetail.createTime ? new Date(Number(videoDetail.createTime) * 1000) : undefined,
          }
        }
      } catch { /* ignore */ }
    }

    // Pattern 2: __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
    if (nextDataMatch) {
      try {
        const nd = JSON.parse(nextDataMatch[1])
        const item =
          nd?.props?.pageProps?.itemInfo?.itemStruct ||
          nd?.props?.pageProps?.videoData?.itemInfos
        if (item?.stats) {
          const s = item.stats
          const auth = item.author || item.authorInfos || {}
          return {
            views: parseInt(String(s.playCount || 0)) || 0,
            likes: parseInt(String(s.diggCount || 0)) || 0,
            comments: parseInt(String(s.commentCount || 0)) || 0,
            reposts: parseInt(String(s.shareCount || 0)) || 0,
            saves: parseInt(String(s.collectCount || 0)) || 0,
            description: item.desc || '',
            coverUrl: item.video?.cover || '',
            accountNick: auth.uniqueId || auth.userName || '',
            accountName: auth.nickname || auth.nickName || '',
            avatar: auth.avatarThumb || auth.avatarLarger || '',
            publishedAt: item.createTime ? new Date(Number(item.createTime) * 1000) : undefined,
          }
        }
      } catch { /* ignore */ }
    }

    // Pattern 3: Regex fallback — find stats block directly in HTML
    // Matches: "stats":{"diggCount":290,"shareCount":71,"commentCount":40,"playCount":10900
    const statsBlockMatch = html.match(/"stats"\s*:\s*\{\s*"diggCount"\s*:\s*["']?(\d+)["']?\s*,\s*"shareCount"\s*:\s*["']?(\d+)["']?\s*,\s*"commentCount"\s*:\s*["']?(\d+)["']?\s*,\s*"playCount"\s*:\s*["']?(\d+)["']?/)
    if (statsBlockMatch) {
      return {
        likes: parseInt(statsBlockMatch[1]) || 0,
        reposts: parseInt(statsBlockMatch[2]) || 0,
        comments: parseInt(statsBlockMatch[3]) || 0,
        views: parseInt(statsBlockMatch[4]) || 0,
      }
    }

    // Pattern 4: statsV2 block
    const statsV2Match = html.match(/"statsV2"\s*:\s*\{\s*"diggCount"\s*:\s*"?(\d+)"?\s*,\s*"shareCount"\s*:\s*"?(\d+)"?\s*,\s*"commentCount"\s*:\s*"?(\d+)"?\s*,\s*"playCount"\s*:\s*"?(\d+)"?/)
    if (statsV2Match) {
      return {
        likes: parseInt(statsV2Match[1]) || 0,
        reposts: parseInt(statsV2Match[2]) || 0,
        comments: parseInt(statsV2Match[3]) || 0,
        views: parseInt(statsV2Match[4]) || 0,
      }
    }

    // Pattern 5: individual fields last resort
    const playCountMatch = html.match(/"playCount"\s*:\s*"?(\d+)"?/)
    if (playCountMatch) {
      return {
        views: parseInt(playCountMatch[1]) || 0,
        likes: parseInt((html.match(/"diggCount"\s*:\s*"?(\d+)"?/) || ['', '0'])[1]) || 0,
        comments: parseInt((html.match(/"commentCount"\s*:\s*"?(\d+)"?/) || ['', '0'])[1]) || 0,
        reposts: parseInt((html.match(/"shareCount"\s*:\s*"?(\d+)"?/) || ['', '0'])[1]) || 0,
      }
    }
  } catch { /* ignore */ }
  return {}
}

async function tryApiScrape(videoId: string): Promise<Partial<TikTokStats>> {
  // Try TikTok's internal item detail API
  const endpoints = [
    `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}&version_code=26.1.3&app_name=musical_ly`,
    `https://api2.musical.ly/aweme/v1/feed/?aweme_id=${videoId}`,
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await axios.get(endpoint, {
        headers: { 'User-Agent': 'TikTok 26.1.3 rv:261303 (iPhone; iOS 14.4.2; en_US) Cronet' },
        timeout: 8000,
      })
      const awemes = res.data?.aweme_list
      if (awemes?.[0]?.statistics) {
        const s = awemes[0].statistics
        const auth = awemes[0].author || {}
        return {
          views: s.play_count || s.playCount || 0,
          likes: s.digg_count || s.diggCount || 0,
          comments: s.comment_count || s.commentCount || 0,
          reposts: s.share_count || s.shareCount || 0,
          saves: s.collect_count || 0,
          accountNick: auth.unique_id || auth.uniqueId || '',
          accountName: auth.nickname || '',
          avatar: auth.avatar_thumb?.url_list?.[0] || '',
        }
      }
    } catch { /* ignore */ }
  }
  return {}
}

async function tryOEmbed(url: string): Promise<{ accountName: string; description: string; coverUrl: string }> {
  try {
    const res = await axios.get(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { headers: API_HEADERS, timeout: 10000 }
    )
    return {
      accountName: String(res.data.author_name || ''),
      description: String(res.data.title || ''),
      coverUrl: String(res.data.thumbnail_url || ''),
    }
  } catch {
    return { accountName: '', description: '', coverUrl: '' }
  }
}

export const tiktokScraper: Scraper = {
  canHandle(url: string) {
    return url.includes('tiktok.com')
  },

  async scrape(url: string): Promise<ScrapedVideoData> {
    const resolvedUrl = await resolveShortUrl(url)
    const videoId = extractVideoId(resolvedUrl) || String(Date.now())
    const urlNick = extractNickFromUrl(resolvedUrl)

    // Run all fetch strategies in parallel for speed
    const [oembed, pageScrape, apiScrape] = await Promise.all([
      tryOEmbed(resolvedUrl),
      tryPageScrape(resolvedUrl, videoId),
      tryApiScrape(videoId),
    ])

    // Merge — prefer stats from page/api over oembed; prefer nick from URL
    const views = pageScrape.views || apiScrape.views || 0
    const likes = pageScrape.likes || apiScrape.likes || 0
    const comments = pageScrape.comments || apiScrape.comments || 0
    const reposts = pageScrape.reposts || apiScrape.reposts || 0
    const saves = pageScrape.saves || apiScrape.saves || 0

    const accountNick = urlNick
      || pageScrape.accountNick
      || apiScrape.accountNick
      || oembed.accountName.replace(/^@/, '')
      || 'unknown'

    const accountName = pageScrape.accountName
      || apiScrape.accountName
      || oembed.accountName
      || accountNick

    const coverUrl = pageScrape.coverUrl || apiScrape.coverUrl || oembed.coverUrl
    const description = pageScrape.description || apiScrape.description || oembed.description
    const avatar = pageScrape.avatar || apiScrape.avatar || ''
    const publishedAt = pageScrape.publishedAt || apiScrape.publishedAt

    return {
      platform: 'tiktok',
      url: resolvedUrl,
      videoId,
      accountName,
      accountNick,
      avatar: avatar || undefined,
      publishedAt,
      description,
      coverUrl: coverUrl || undefined,
      videoUrl: resolvedUrl,
      views,
      likes,
      comments,
      reposts,
      saves,
    }
  },
}
