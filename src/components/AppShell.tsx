import { Menu, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { navItems } from './nav'

export function AppShell() {
  const [isOpen, setIsOpen] = useState(false)
  const { isDemo } = useAuth()
  const close = () => setIsOpen(false)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} aria-label="Navegación principal">
        <NavLink to="/" className="brand" onClick={close}>
          <span className="brand-mark">✦</span><span>Only<span>Us</span></span>
        </NavLink>
        <p className="sidebar-intro">Un pequeño universo<br />hecho para dos.</p>
        <nav className="nav-list">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="nav-link" onClick={close}>
              <Icon size={18} strokeWidth={1.7} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <NavLink to="/perfil" className="sidebar-footer" onClick={close}>
          <Settings size={16} /> Configuración
        </NavLink>
      </aside>
      {isOpen && <button className="menu-scrim" aria-label="Cerrar menú" onClick={close} />}
      <main className="main-content">
        <header className="mobile-header">
          <NavLink to="/" className="brand"><span className="brand-mark">✦</span>Only<span>Us</span></NavLink>
          <button className="icon-button" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </header>
        {isDemo && <div className="demo-banner"><span>Modo demostración</span> · Conecta Supabase para activar acceso privado y recuerdos compartidos.</div>}
        <Outlet />
      </main>
    </div>
  )
}
