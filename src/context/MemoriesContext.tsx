import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { demoMemories } from '../data/demo'
import { useAuth } from '../hooks/useAuth'
import { ensureFirstStoryMemory, getMemories } from '../services/memories'
import { SIGNED_URL_TTL_SECONDS } from '../services/photos'
import type { Memory } from '../types/models'
import { MemoriesContext } from './memories'

// Refresh signed photo URLs well before they expire.
const REFRESH_AFTER_MS = SIGNED_URL_TTL_SECONDS * 1000 * 0.8

export function MemoriesProvider({ children }: { children: ReactNode }) {
  const { isDemo } = useAuth()
  const [memories, setMemories] = useState<Memory[]>(isDemo ? demoMemories : [])
  const [loading, setLoading] = useState(!isDemo)
  const [error, setError] = useState('')
  const loadedAt = useRef(0)

  const refresh = useCallback(async () => {
    if (isDemo) {
      setMemories(demoMemories)
      return
    }
    const items = await getMemories()
    loadedAt.current = Date.now()
    setMemories(items)
    setError('')
  }, [isDemo])

  useEffect(() => {
    if (isDemo) return
    let active = true
    void (async () => {
      try {
        await ensureFirstStoryMemory()
        const items = await getMemories()
        if (active) {
          loadedAt.current = Date.now()
          setMemories(items)
          setError('')
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'No pudimos cargar los recuerdos.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [isDemo])

  useEffect(() => {
    if (isDemo) return
    const refreshIfStale = () => {
      if (document.visibilityState !== 'visible') return
      if (!loadedAt.current || Date.now() - loadedAt.current < REFRESH_AFTER_MS) return
      void refresh().catch(() => undefined)
    }
    const timer = window.setInterval(refreshIfStale, 60_000)
    document.addEventListener('visibilitychange', refreshIfStale)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshIfStale)
    }
  }, [isDemo, refresh])

  return (
    <MemoriesContext.Provider value={{ memories, loading, error, refresh, isDemo }}>
      {children}
    </MemoriesContext.Provider>
  )
}
