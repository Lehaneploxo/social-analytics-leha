import { Router, Request, Response } from 'express'
import { requireAuth, generateToken, validateAdminSecret } from '../middleware/auth'
import { addVideo, refreshAllVideos } from '../services/videoService'
import { exportCSV, exportJSON, exportExcel } from '../services/exportService'

const router = Router()

// POST /api/admin/login
router.post('/login', (req: Request, res: Response) => {
  const { secret } = req.body
  if (!validateAdminSecret(secret)) {
    res.status(401).json({ error: 'Invalid secret' })
    return
  }
  const token = generateToken()
  res.json({ token })
})

// POST /api/admin/videos
router.post('/videos', requireAuth, async (req: Request, res: Response) => {
  try {
    const { url } = req.body
    if (!url) {
      res.status(400).json({ error: 'URL is required' })
      return
    }
    const result = await addVideo(url)
    res.status(result.created ? 201 : 200).json(result)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// POST /api/admin/refresh-all
router.post('/refresh-all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await refreshAllVideos()
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

// GET /api/admin/export/csv
router.get('/export/csv', requireAuth, async (req: Request, res: Response) => {
  await exportCSV(res)
})

// GET /api/admin/export/json
router.get('/export/json', requireAuth, async (req: Request, res: Response) => {
  await exportJSON(res)
})

// GET /api/admin/export/excel
router.get('/export/excel', requireAuth, async (req: Request, res: Response) => {
  await exportExcel(res)
})

export default router
