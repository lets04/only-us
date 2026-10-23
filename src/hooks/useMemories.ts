import { useCallback, useEffect, useState } from 'react'
import { demoMemories } from '../data/demo'
import { ensureFirstStoryMemory, getMemories } from '../services/memories'
import type { Memory } from '../types/models'
import { useAuth } from './useAuth'

export function useMemories() {
  const { isDemo } = useAuth()
  const [memories, setMemories] = useState<Memory[]>(isDemo ? demoMemories : [])
  const [loading, setLoading] = useState(!isDemo)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (isDemo) {
      setMemories(demoMemories)
      return
    }
    const items = await getMemories()
    setMemories(items)
  }, [isDemo])

  useEffect(() => {
    if (isDemo) return
    let active = true
    void (async () => {
      try {
        await ensureFirstStoryMemory()
        const items = await getMemories()
        if (active) {
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

  return { memories, loading, error, refresh, isDemo }
}
