import { Heart, Home, LogOut, Menu, MoonStar, X, Images, Music2, Mail, Settings, Star } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname === '/' ? 'inicio' : location.pathname === '/historia' ? 'historia' : location.pathname === '/deseos' ? 'deseos' : 'mas'
  const go = (path: string) => { setMoreOpen(false); navigate(path); window.scrollTo(0, 0) }
  return <div className="moon-app-shell">
    <div className="moon-global-stars" aria-hidden="true">{Array.from({ length: 45 }, (_, i) => <i key={i} style={{ left: ((i * 43 + 9) % 100) + '%', top: ((i * 29 + 3) % 100) + '%', animationDelay: (i % 8) * -0.6 + 's' }} />)}</div>
    <header className="moon-app-top"><NavLink to="/" className="moon-app-brand"><MoonStar size={20} />OnlyUs</NavLink><button className="moon-exit" onClick={() => void signOut()}><LogOut size={15} /> Salir</button></header>
    <main className="moon-app-content"><Outlet /></main>
    {moreOpen && <div className="moon-more-scrim" onClick={() => setMoreOpen(false)}><section className="moon-more-panel" onClick={(event) => event.stopPropagation()}><div className="moon-more-heading"><div><span className="hand-note">nuestros rinconcitos</span><h2>Más de nosotros</h2></div><button className="moon-more-close" onClick={() => setMoreOpen(false)} aria-label="Cerrar"><X /></button></div><button onClick={() => go('/galeria')}><Images /> Nuestras fotitos</button><button onClick={() => go('/recuerdos')}><Star /> Administrar recuerdos</button><button onClick={() => go('/canciones')}><Music2 /> Canciones nuestras</button><button onClick={() => go('/cartas')}><Mail /> Cartitas de amor</button><button onClick={() => go('/perfil')}><Settings /> Privacidad y configuración</button></section></div>}
    <nav className="moon-dock" aria-label="Secciones principales">
      <button className={active === 'inicio' ? 'is-current' : ''} onClick={() => go('/')}><Home size={17} /><span>Inicio</span></button>
      <button className={active === 'historia' ? 'is-current' : ''} onClick={() => go('/historia')}><Heart size={17} /><span>Historia</span></button>
      <button className={active === 'deseos' ? 'is-current' : ''} onClick={() => go('/deseos')}><MoonStar size={17} /><span>Deseos</span></button>
      <button className={active === 'mas' ? 'is-current' : ''} onClick={() => setMoreOpen(true)}><Menu size={17} /><span>Más</span></button>
    </nav>
  </div>
}
