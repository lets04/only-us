import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from './auth'
import { supabase } from '../lib/supabase'

// Left over from the old "¿Quién eres?" selector; cleared so it does not linger.
const LEGACY_PERSON_KEY = 'onlyus-person'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  // Start loading while Supabase restores the saved session, so a reload
  // does not bounce through /login and lose the current page.
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    try { localStorage.removeItem(LEGACY_PERSON_KEY) } catch { /* storage unavailable */ }

    void supabase.auth.getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession)
        setLoading(false)
      },
    )

    return () => subscription.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  useEffect(() => {
    if (!supabase || !userId) return
    let active = true
    void supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setDisplayName((data as { display_name: string } | null)?.display_name ?? null)
      })
    return () => { active = false }
  }, [userId])

  const signOut = async () => {
    setDisplayName(null)
    if (supabase && session) {
      await supabase.auth.signOut()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isDemo: !supabase,
        displayName: userId ? displayName : null,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
