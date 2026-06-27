import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  const queryToken = req.query.token as string | undefined
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : queryToken
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function generateToken(): string {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '30d' })
}

export function validateAdminSecret(secret: string): boolean {
  return secret === ADMIN_SECRET
}
