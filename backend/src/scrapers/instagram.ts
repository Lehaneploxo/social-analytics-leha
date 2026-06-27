import axios from 'axios'
import { Scraper, ScrapedVideoData } from './types'

const IG_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
}

function extractShortcode(url: string): string | null {
  // https://www.instagram.com/reel/ABC123/
  // https://www.instagram.com/p/ABC123/
  const match = url.match(/\/(reel|p|tv)\/([A-Za-z0-9_-]+)/)
  return match ? match[2] : null
}

export const instagramScraper: Scraper = {
  canHandle(url: string) {
    return url.includes('instagram.com')
  },

  async scrape(url: string): Promise<ScrapedVideoData> {
    const shortcode = extractShortcode(url)
    if (!shortcode) throw new Error(`Cannot extract shortcode from URL: ${url}`)

    let accountName = ''
    let accountNick = ''
    let avatar = ''
    let description = ''
    let coverUrl = ''
    let publishedAt: Date | undefined
    let views = 0
    let likes = 0
    let comments = 0
    let reposts = 0
    let saves = 0
    let videoUrl = ''

    // Try oEmbed for basic info
    try {
      const oembed = await axios.get(
        `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`,
        { headers: IG_HEADERS, timeout: 10000 }
      )
      const d = oembed.data
      accountName = d.author_name || ''
      accountNick = d.author_url?.split('/').filter(Boolean).pop() || ''
      description = d.title || ''
      coverUrl = d.thumbnail_url || ''
    } catch {
      // ignore
    }

    // Try Instagram GraphQL embedded page
    try {
      const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`
      const res = await axios.get(embedUrl, {
        headers: IG_HEADERS,
        timeout: 15000,
      })
      const html: string = res.data

      // Extract stats from embed HTML
      const likeMatch = html.match(/"like_count"\s*:\s*(\d+)/)
      if (likeMatch) likes = parseInt(likeMatch[1])

      const commentMatch = html.match(/"comment_count"\s*:\s*(\d+)/)
      if (commentMatch) comments = parseInt(commentMatch[1])

      const viewMatch = html.match(/"video_view_count"\s*:\s*(\d+)/)
      if (viewMatch) views = parseInt(viewMatch[1])

      const playMatch = html.match(/"video_play_count"\s*:\s*(\d+)/)
      if (playMatch) views = Math.max(views, parseInt(playMatch[1]))

      // Try to get JSON from page
      const jsonMatch = html.match(/window\.__additionalDataLoaded\s*\(\s*'[^']+'\s*,\s*(\{[\s\S]+?\})\s*\)/)
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1])
          const media = data?.graphql?.shortcode_media
          if (media) {
            likes = media.edge_media_preview_like?.count || likes
            comments = media.edge_media_to_comment?.count || comments
            views = media.video_view_count || views
            description = media.edge_media_to_caption?.edges?.[0]?.node?.text || description
            coverUrl = media.display_url || media.thumbnail_src || coverUrl
            videoUrl = media.video_url || videoUrl
            publishedAt = media.taken_at_timestamp
              ? new Date(media.taken_at_timestamp * 1000)
              : undefined

            const owner = media.owner
            if (owner) {
              accountNick = owner.username || accountNick
              accountName = owner.full_name || accountName
              avatar = owner.profile_pic_url || avatar
            }
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }

    return {
      platform: 'instagram',
      url,
      videoId: shortcode,
      accountName: accountName || accountNick || 'Unknown',
      accountNick: accountNick || accountName || 'unknown',
      avatar: avatar || undefined,
      publishedAt,
      description,
      coverUrl: coverUrl || undefined,
      videoUrl: videoUrl || url,
      views,
      likes,
      comments,
      reposts,
      saves,
    }
  },
}
