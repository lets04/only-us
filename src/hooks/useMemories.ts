import { useContext } from 'react'
import { MemoriesContext } from '../context/memories'

export function useMemories() {
  const context = useContext(MemoriesContext)
  if (!context) throw new Error('useMemories debe usarse dentro de MemoriesProvider')
  return context
}
