import { Check, LogOut, Moon, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'
import { Notice, PageIntro } from '../components/ui'

export function ProfilePage() {
  const { session, isDemo, signOut } = useAuth()
  return <div className="page"><PageIntro eyebrow="Configuración" title="Nuestro espacio, a nuestra manera.">Una base sencilla para identidad, preferencias y acceso seguro.</PageIntro>
    <section className="settings-grid"><article className="settings-card"><div className="settings-card__icon"><UserRound size={20} /></div><div><p className="eyebrow">Identidad</p><h2>Perfil</h2></div><div className="profile-row"><div className="avatar-placeholder">OU</div><div><strong>{session?.user.email ?? 'Modo demostración'}</strong><p>{isDemo ? 'Sin cuenta conectada' : 'Miembro autorizado'}</p></div></div><button className="button button--ghost" disabled>Editar perfil</button></article>
      <article className="settings-card"><div className="settings-card__icon"><Moon size={20} /></div><div><p className="eyebrow">Preferencias</p><h2>Experiencia</h2></div><div className="preference-row"><div><strong>Animaciones discretas</strong><p>Se respetan automáticamente las preferencias de movimiento reducido.</p></div><Check size={18} /></div><div className="preference-row"><div><strong>Paleta Cosmic Love</strong><p>Diseñada para confort visual en pantallas oscuras.</p></div><Check size={18} /></div></article>
      <article className="settings-card settings-card--wide"><div className="settings-card__icon"><ShieldCheck size={20} /></div><div><p className="eyebrow">Privacidad</p><h2>Estado de la integración</h2></div><p>{isSupabaseConfigured ? 'Supabase está configurado. El acceso se valida mediante sesión y las políticas RLS del proyecto.' : 'Supabase aún no está configurado. La aplicación muestra únicamente contenido demostrativo local y no persiste datos privados.'}</p>{isDemo ? <Notice>Consulta `README.md` y `.env.example` para activar autenticación, base de datos y almacenamiento privado.</Notice> : <button className="button button--ghost" onClick={() => void signOut()}><LogOut size={16} /> Cerrar sesión</button>}</article></section>
  </div>
}
