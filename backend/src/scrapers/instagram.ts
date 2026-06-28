import axios from 'axios'
import * as zlib from 'zlib'
import { promisify } from 'util'
import { Scraper, ScrapedVideoData } from './types'

const brotliDecompress = promisify(zlib.brotliDecompress)
const gunzip = promisify(zlib.gunzip)

const IG_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
}

async function fetchAndDecompress(url: string): Promise<string> {
  const resp = await axios.get(url, {
    headers: IG_HEADERS,
    timeout: 20000,
    responseType: 'arraybuffer',
    validateStatus: (s) => s < 400,
  })

  const encoding = resp.headers['content-encoding'] || ''
  const buf = Buffer.from(resp.data)

  try {
    if (encoding.includes('br')) return (await brotliDecompress(buf)).toString('utf8')
    if (encoding.includes('gzip')) return (await gunzip(buf)).toString('utf8')
  } catch {
    // fall through to raw
  }
  return buf.toString('utf8')
}

function extractShortcode(url: string): { shortcode: string; type: string } | null {
  const match = url.match(/\/(reel|p|tv)\/([A-Za-z0-9_-]+)/)
  return match ? { type: match[1], shortcode: match[2] } : null
}

export const instagramScraper: Scraper = {
  canHandle(url: string) {
    return url.includes('instagram.com')
  },

  async scrape(url: string): Promise<ScrapedVideoData> {
    const parsed = extractShortcode(url)
    if (!parsed) throw new Error(`Cannot extract shortcode from URL: ${url}`)
    const { shortcode, type } = parsed

    let accountName = ''
    let accountNick = ''
    let avatar = ''
    let description = ''
    let coverUrl = ''
    let publishedAt: Date | undefined
    let views = 0
    let likes = 0
    let comments = 0

    // Try the URL's own path type first, then fallback to the other
    const altType = type === 'reel' ? 'p' : 'reel'
    for (const pathType of [type, altType]) {
      try {
        const html = await fetchAndDecompress(`https://www.instagram.com/${pathType}/${shortcode}/`)
        if (!html.includes('like_count') && !html.includes('og:description')) continue

        // OG description: "922 likes, 68 comments - valerik0007_ on June 27, 2026"
        // Note: content may contain newlines (caption included), so use [\s\S] and no trailing $
        const ogDescMatch = html.match(/property="og:description"[^>]*content="([\s\S]*?)"(?:\s*\/)?>/)
        if (ogDescMatch) {
          const desc = decodeHtmlEntities(ogDescMatch[1])
          const m = desc.match(/^([\d,]+)\s*likes?,\s*([\d,]+)\s*comments?\s*[-–]\s*(\S+)\s+on\s+([^\n,]+)/)
          if (m) {
            likes = parseInt(m[1].replace(/,/g, ''))
            comments = parseInt(m[2].replace(/,/g, ''))
            if (!accountNick) accountNick = m[3]
            try { publishedAt = new Date(m[4].replace(/:.*/, '').trim()) } catch { /* ignore */ }
          }
        }

        // OG title: "Валерик 0007 on Instagram" or "Name on Instagram: "caption...""
        const ogTitleMatch = html.match(/property="og:title"[^>]*content="([^"]+)"/)
        if (ogTitleMatch && !accountName) {
          accountName = decodeHtmlEntities(ogTitleMatch[1]).replace(/ on Instagram.*/i, '')
        }

        // OG image for cover
        const ogImgMatch = html.match(/property="og:image"[^>]*content="([^"]+)"/)
        if (ogImgMatch && !coverUrl) {
          coverUrl = decodeHtmlEntities(ogImgMatch[1])
        }

        // JSON blob in page: username, full_name, profile_pic_url
        const userBlobMatch = html.match(/"username":"([^"]+)"[^}]{0,200}"full_name":"((?:[^"\\]|\\.)*)"/s)
        if (userBlobMatch) {
          if (!accountNick) accountNick = userBlobMatch[1]
          if (!accountName) {
            try { accountName = JSON.parse(`"${userBlobMatch[2]}"`) } catch { accountName = userBlobMatch[2] }
          }
        }

        // Avatar URL from profile_pic_url in JSON blob
        const avatarMatch = html.match(/"profile_pic_url":"(https:\/\/[^"]+)"/)
        if (avatarMatch && !avatar) {
          avatar = avatarMatch[1].replace(/\\u0025/g, '%').replace(/\\\//g, '/').replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
        }

        // taken_at timestamp
        const takenAtMatch = html.match(/"taken_at":(\d{10})/)
        if (takenAtMatch && !publishedAt) {
          publishedAt = new Date(parseInt(takenAtMatch[1]) * 1000)
        }

        // Caption/description
        const captionMatch = html.match(/"text":"((?:[^"\\]|\\.)*?)"[^}]*?"created_at"/)
        if (captionMatch && !description) {
          try { description = JSON.parse(`"${captionMatch[1]}"`) } catch { description = captionMatch[1] }
        }

        // Views: Instagram hides reel play counts without login — try anyway
        const playMatch = html.match(/"play_count":(\d+)/)
        const igReelMatch = html.match(/"ig_reel_view_count":(\d+)/)
        const videoViewMatch = html.match(/"video_view_count":(\d+)/)
        if (playMatch) views = Math.max(views, parseInt(playMatch[1]))
        if (igReelMatch) views = Math.max(views, parseInt(igReelMatch[1]))
        if (videoViewMatch) views = Math.max(views, parseInt(videoViewMatch[1]))

        // Also check like_count from JSON (more accurate than OG sometimes)
        const likeMatch = html.match(/"like_count":(\d+)/)
        const commentMatch = html.match(/"comment_count":(\d+)/)
        if (likeMatch) likes = Math.max(likes, parseInt(likeMatch[1]))
        if (commentMatch) comments = Math.max(comments, parseInt(commentMatch[1]))

        if (accountNick || likes > 0) break
      } catch {
        // try next path
      }
    }

    // Strip caption/hashtag bleed into name fields
    accountName = (accountName || accountNick || 'Unknown').split('\n')[0].replace(/"$/, '').trim()
    accountNick = (accountNick || accountName || 'unknown').split('\n')[0].replace(/"$/, '').trim()

    return {
      platform: 'instagram',
      url,
      videoId: shortcode,
      accountName,
      accountNick,
      avatar: avatar || undefined,
      publishedAt,
      description,
      coverUrl: coverUrl || undefined,
      videoUrl: url,
      views,
      likes,
      comments,
      reposts: 0,
      saves: 0,
    }
  },
}
