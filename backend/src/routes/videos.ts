import { Router, Request, Response } from 'express'
import { getVideos, deleteVideo, refreshVideo } from '../services/videoService'
import { requireAuth } from '../middleware/auth'

const router = Router()

// GET /api/videos
router.get('/', async (req: Request, res: Response) => {
  try {
    const { platform, search, sortBy, order, page, limit } = req.query
    const result = await getVideos({
      platform: String(platform || ''),
      search: String(search || ''),
      sortBy: String(sortBy || 'createdAt'),
      order: String(order || 'desc'),
      page: Number(page) || 1,
      limit: Number(limit) || 50,
    })
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// DELETE /api/videos/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await deleteVideo(req.params.id)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// POST /api/videos/:id/refresh
router.post('/:id/refresh', requireAuth, async (req: Request, res: Response) => {
  try {
    const video = await refreshVideo(req.params.id)
    res.json(video)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

export default router
