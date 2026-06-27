export interface ScrapedVideoData {
  platform: 'tiktok' | 'instagram'
  url: string
  videoId: string
  accountName: string
  accountNick: string
  avatar?: string
  publishedAt?: Date
  description?: string
  coverUrl?: string
  videoUrl?: string
  views: number
  likes: number
  comments: number
  reposts: number
  saves: number
}

export interface Scraper {
  canHandle(url: string): boolean
  scrape(url: string): Promise<ScrapedVideoData>
}
