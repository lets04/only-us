import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, session, isDemo } = useAuth()
  if (loading) return <main className="page-loader">Conectando con nuestro universo…</main>
  if (!isDemo && !session) return <Navigate to="/login" replace />
  return <>{children}</>
}
