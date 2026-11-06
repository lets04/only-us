import { createContext } from 'react'
import type { Memory } from '../types/models'

export type MemoriesContextValue = {
  memories: Memory[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
  isDemo: boolean
}

export const MemoriesContext = createContext<MemoriesContextValue | undefined>(undefined)
