import { PrismaClient } from '@prisma/client'
import ExcelJS from 'exceljs'
import { Response } from 'express'

const prisma = new PrismaClient()

const COLUMNS = [
  'id', 'platform', 'url', 'accountNick', 'accountName',
  'views', 'likes', 'comments', 'reposts', 'saves',
  'publishedAt', 'createdAt', 'updatedAt',
]

export async function exportCSV(res: Response) {
  const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } })
  const header = COLUMNS.join(',')
  const rows = videos.map((v) =>
    COLUMNS.map((col) => {
      const val = (v as Record<string, unknown>)[col]
      if (val instanceof Date) return val.toISOString()
      if (typeof val === 'string' && val.includes(',')) return `"${val.replace(/"/g, '""')}"`
      return val ?? ''
    }).join(',')
  )
  const csv = [header, ...rows].join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"')
  res.send(csv)
}

export async function exportJSON(res: Response) {
  const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } })
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', 'attachment; filename="analytics.json"')
  res.json(videos)
}

export async function exportExcel(res: Response) {
  const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } })
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Analytics')

  ws.columns = COLUMNS.map((col) => ({ header: col, key: col, width: 20 }))

  for (const v of videos) {
    const row: Record<string, unknown> = {}
    for (const col of COLUMNS) {
      const val = (v as Record<string, unknown>)[col]
      row[col] = val instanceof Date ? val.toISOString() : val
    }
    ws.addRow(row)
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename="analytics.xlsx"')
  await wb.xlsx.write(res)
}
