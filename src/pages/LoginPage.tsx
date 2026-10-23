import { motion } from 'framer-motion'
import { Heart, MoonStar, Sparkles, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const { session, loading, isDemo } = useAuth()
  const [who, setWho] = useState<'Aleja' | 'Sebas'>('Aleja')
  const [date, setDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verified, setVerified] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) return <main className="page-loader">Preparando nuestro rinconcito…</main>
  if (session || isDemo) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    if (date.replace(/[^0-9]/g, '') !== '23062025') {
      setVerified(false)
      setMessage('Esa no es nuestra fecha. Piensa en el día en que nos hicimos novios. 💗')
      return
    }
    if (!verified) {
      setVerified(true)
      setMessage('¡Esa es nuestra fecha! Confirma tu cuenta para cuidar la privacidad de nuestras fotos.')
      return
    }
    if (!supabase) {
      setMessage('Supabase no está disponible. Revisa la configuración de la aplicación.')
      return
    }
    setIsSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMessage(error ? 'No pudimos verificar la cuenta. Revisa tus datos e inténtalo otra vez.' : 'Bienvenido a nuestro pequeño universo. ✨')
    setIsSubmitting(false)
  }

  return <main className="moon-login">
    <div className="moon-login-sky" aria-hidden="true">{Array.from({ length: 70 }, (_, i) => <i key={i} style={{ left: ((i * 37 + 11) % 100) + '%', top: ((i * 61 + 7) % 100) + '%', animationDelay: (i % 9) * -0.43 + 's' }} />)}</div>
    <motion.form className="moon-login-card" onSubmit={(event) => void handleSubmit(event)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="hand-note">una historia real, solo de dos</div>
      <MoonStar className="moon-login-icon" size={42} strokeWidth={1.3} />
      <div className="moon-login-logo">OnlyUs</div>
      <h1>Coincidimos<br /><em>bajo la misma luna</em></h1>
      <p className="moon-login-subtitle">Elige quién eres y escribe el día en que todo empezó.</p>
      <div className="moon-who" role="group" aria-label="¿Quién eres?">
        {(['Aleja', 'Sebas'] as const).map((name) => <button key={name} type="button" aria-pressed={who === name} onClick={() => setWho(name)}><UserRound size={16} />{name}</button>)}
      </div>
      <label className="moon-login-label" htmlFor="relationship-date">Nuestra fecha</label>
      <input id="relationship-date" className="moon-date-input" value={date} onChange={(event) => { setDate(event.target.value); setVerified(false) }} inputMode="numeric" autoComplete="off" placeholder="dd/mm/aaaa" aria-describedby="login-message" />
      {verified && <div className="moon-private-fields"><p><Heart size={14} fill="currentColor" /> ¡Esa es nuestra fecha, {who}! Confirma la cuenta privada para entrar.</p><label htmlFor="email">Correo de tu cuenta</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="Tu correo" required /><label htmlFor="password">Contraseña</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Tu contraseña" required /></div>}
      <p className="moon-login-error" id="login-message" role="alert">{message}</p>
      <button className="moon-login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Abriendo nuestro cielo…' : verified ? 'Entrar a nuestro cielo' : 'Continuar'} <Sparkles size={17} /></button>
      <p className="moon-login-foot">Un pequeño universo, hecho para nosotros dos. <Heart size={12} fill="currentColor" /></p>
    </motion.form>
  </main>
}
