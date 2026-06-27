import { Router, Request, Response } from 'express'
import { getBloggers, getBloggerVideos } from '../services/videoService'

const router = Router()

// GET /api/bloggers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const bloggers = await getBloggers()
    res.json(bloggers)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// GET /api/bloggers/:nick/videos
router.get('/:nick/videos', async (req: Request, res: Response) => {
  try {
    const { platform } = req.query
    const videos = await getBloggerVideos(
      String(req.params.nick),
      platform ? String(platform) : undefined
    )
    res.json(videos)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

export default router
