import { tiktokScraper } from './tiktok'
import { instagramScraper } from './instagram'
import { Scraper, ScrapedVideoData } from './types'

const scrapers: Scraper[] = [tiktokScraper, instagramScraper]

export async function scrapeVideo(url: string): Promise<ScrapedVideoData> {
  const scraper = scrapers.find((s) => s.canHandle(url))
  if (!scraper) throw new Error(`No scraper found for URL: ${url}`)
  return scraper.scrape(url)
}

export function detectPlatform(url: string): 'tiktok' | 'instagram' | null {
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  return null
}

export { ScrapedVideoData }
