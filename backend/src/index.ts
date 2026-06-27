import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import videosRouter from './routes/videos'
import bloggersRouter from './routes/bloggers'
import analyticsRouter from './routes/analytics'
import adminRouter from './routes/admin'
import { refreshAllVideos } from './services/videoService'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3000']
  : ['http://localhost:3000', 'http://localhost:3001']

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true)
    cb(null, true) // allow all for now — restrict in production if needed
  },
  credentials: true,
}))
app.use(express.json())

app.use('/api/videos', videosRouter)
app.use('/api/bloggers', bloggersRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/admin', adminRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// Background refresh every 12 minutes
cron.schedule('*/12 * * * *', async () => {
  console.log('[cron] Refreshing all videos...')
  try {
    const result = await refreshAllVideos()
    console.log(`[cron] Done: ${result.success}/${result.total} updated, ${result.failed} failed`)
  } catch (e) {
    console.error('[cron] Error:', e)
  }
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
