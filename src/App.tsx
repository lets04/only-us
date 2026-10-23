import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CardsPage } from './pages/CardsPage'
import { DashboardPage } from './pages/DashboardPage'
import { WishesPage } from './pages/WishesPage'
import { GalleryPage } from './pages/GalleryPage'
import { HistoryPage } from './pages/HistoryPage'
import { LoginPage } from './pages/LoginPage'
import { MemoriesPage } from './pages/MemoriesPage'
import { ProfilePage } from './pages/ProfilePage'
import { SongsPage } from './pages/SongsPage'

function PrivateLayout() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/historia" element={<HistoryPage />} />
          <Route path="/deseos" element={<WishesPage />} />
          <Route path="/galeria" element={<GalleryPage />} />
          <Route path="/canciones" element={<SongsPage />} />
          <Route path="/cartas" element={<CardsPage />} />
          <Route path="/recuerdos" element={<MemoriesPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
