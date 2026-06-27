import { Router, Request, Response } from 'express'
import { getAnalytics } from '../services/videoService'

const router = Router()

// GET /api/analytics
router.get('/', async (_req: Request, res: Response) => {
  try {
    const data = await getAnalytics()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

export default router
