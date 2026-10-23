
import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthContextValue = {
  session: Session | null
  loading: boolean
  isDemo: boolean
  person: 'Leticia' | 'Jhonatan' | null
  enterAs: (person: 'Leticia' | 'Jhonatan') => void
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
