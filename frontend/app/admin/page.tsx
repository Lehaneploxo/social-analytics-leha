'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminLogin, addVideo, refreshAllVideos, deleteVideo, refreshVideo,
  fetchVideos
} from '../../lib/api'
import { VideoCard } from '../../components/VideoCard'
import { motion } from 'framer-motion'
import { Settings, Plus, RefreshCw, Download, LogIn, LogOut, Loader2, CheckCircle } from 'lucide-react'

function useAdminToken() {
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  )

  const save = (t: string) => {
    localStorage.setItem('admin_token', t)
    setToken(t)
  }
  const clear = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
  }

  return { token, save, clear }
}

function LoginForm({ onLogin }: { onLogin: (t: string) => void }) {
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { token } = await adminLogin(secret)
      onLogin(token)
    } catch {
      setError('Неверный ключ доступа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="glass p-8 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}
        >
          <Settings size={24} color="white" />
        </div>
        <h2 className="text-lg font-bold mb-1" style={{ color: '#e4e4f0' }}>Вход в панель</h2>
        <p className="text-sm mb-6" style={{ color: '#64648a' }}>Введите секретный ключ</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Секретный ключ..."
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full px-4 py-3 text-sm"
          />
          {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            Войти
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { token, save, clear } = useAdminToken()
  const qc = useQueryClient()

  const [newUrl, setNewUrl] = useState('')
  const [addMsg, setAddMsg] = useState('')
  const [addError, setAddError] = useState('')

  const { data: videosData, isLoading } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: () => fetchVideos({ limit: 100 }),
    enabled: !!token,
  })

  const addMut = useMutation({
    mutationFn: (url: string) => addVideo(url),
    onSuccess: (res) => {
      setNewUrl('')
      setAddError('')
      setAddMsg(res.created ? 'Видео добавлено!' : 'Видео уже существует')
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['admin-videos'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      qc.invalidateQueries({ queryKey: ['bloggers'] })
      setTimeout(() => setAddMsg(''), 4000)
    },
    onError: (e: Error) => {
      setAddError(e.message || 'Ошибка при добавлении')
    },
  })

  const refreshAllMut = useMutation({
    mutationFn: refreshAllVideos,
    onSuccess: (res) => {
      setAddMsg(`Обновлено ${res.success}/${res.total} видео`)
      qc.invalidateQueries()
      setTimeout(() => setAddMsg(''), 5000)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteVideo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-videos'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      qc.invalidateQueries({ queryKey: ['bloggers'] })
    },
  })

  const refreshMut = useMutation({
    mutationFn: (id: string) => refreshVideo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-videos'] }),
  })

  if (!token) return <LoginForm onLogin={save} />

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const exportUrl = (fmt: string) =>
    `${apiBase}/api/admin/export/${fmt}?token=${token}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Settings size={20} style={{ color: '#6366f1' }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#e4e4f0' }}>Панель администратора</h1>
            <p className="text-sm" style={{ color: '#64648a' }}>Управление видео и данными</p>
          </div>
        </div>
        <button
          onClick={clear}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: '#64648a' }}
        >
          <LogOut size={14} />
          Выйти
        </button>
      </motion.div>

      {/* Add video */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="glass p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#e4e4f0' }}>
            <Plus size={15} style={{ color: '#6366f1' }} />
            Добавить видео
          </h2>
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="https://www.tiktok.com/... или https://www.instagram.com/reel/..."
              value={newUrl}
              onChange={(e) => { setNewUrl(e.target.value); setAddError('') }}
              className="flex-1 px-4 py-3 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && newUrl && addMut.mutate(newUrl)}
            />
            <button
              onClick={() => newUrl && addMut.mutate(newUrl)}
              disabled={addMut.isPending || !newUrl}
              className="px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white' }}
            >
              {addMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {addMut.isPending ? 'Загрузка...' : 'Добавить'}
            </button>
          </div>
          {addMsg && (
            <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: '#34d399' }}>
              <CheckCircle size={14} />
              {addMsg}
            </div>
          )}
          {addError && (
            <div className="mt-3 text-sm" style={{ color: '#f87171' }}>
              {addError}
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#e4e4f0' }}>Действия</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => refreshAllMut.mutate()}
              disabled={refreshAllMut.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-all"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#818cf8',
              }}
            >
              {refreshAllMut.isPending
                ? <Loader2 size={14} className="animate-spin" />
                : <RefreshCw size={14} />
              }
              Обновить все
            </button>

            {(['csv', 'excel', 'json'] as const).map((fmt) => (
              <a
                key={fmt}
                href={exportUrl(fmt)}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                <Download size={14} />
                {fmt.toUpperCase()}
              </a>
            ))}
          </div>
          {refreshAllMut.isSuccess && addMsg && (
            <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: '#34d399' }}>
              <CheckCircle size={14} />
              {addMsg}
            </div>
          )}
        </div>
      </motion.div>

      {/* Videos list */}
      <div>
        <h2 className="text-base font-semibold mb-3" style={{ color: '#e4e4f0' }}>
          Видео {videosData ? `(${videosData.total})` : ''}
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="glass h-32 animate-pulse" />)}
          </div>
        ) : (videosData?.videos || []).length === 0 ? (
          <div className="glass p-12 text-center" style={{ color: '#64648a' }}>
            Видео не добавлены. Добавьте первое видео выше.
          </div>
        ) : (
          <div className="space-y-3">
            {(videosData?.videos || []).map((v, i) => (
              <VideoCard
                key={v.id}
                video={v}
                index={i}
                showAdmin
                onRefresh={(id) => refreshMut.mutate(id)}
                onDelete={(id) => {
                  if (confirm('Удалить это видео?')) deleteMut.mutate(id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
