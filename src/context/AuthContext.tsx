
import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from './auth'
import { supabase } from '../lib/supabase'

type Person = 'Leticia' | 'Jhonatan'
const PERSON_KEY = 'onlyus-person'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [person, setPerson] = useState<Person | null>(() => {
    const saved = localStorage.getItem(PERSON_KEY)
    return saved === 'Leticia' || saved === 'Jhonatan' ? saved : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) return

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

  const enterAs = (nextPerson: Person) => {
    localStorage.setItem(PERSON_KEY, nextPerson)
    setPerson(nextPerson)
  }

  const signOut = async () => {
    localStorage.removeItem(PERSON_KEY)
    setPerson(null)

    if (supabase && session) {
      await supabase.auth.signOut()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isDemo: Boolean(person) || !supabase,
        person,
        enterAs,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
