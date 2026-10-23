import { motion } from 'framer-motion'
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const { session, loading, isDemo } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) return <main className="page-loader">Preparando un acceso seguro…</main>
  if (session || isDemo) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    setMessage('')
    setIsSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMessage(error ? 'No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.' : 'Sesión iniciada. Bienvenido a casa.')
    setIsSubmitting(false)
  }

  return <main className="login-page">
    <div className="login-stars" aria-hidden="true" />
    <motion.section className="login-copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/" className="brand brand--large"><span className="brand-mark">✦</span>Only<span>Us</span></Link>
      <p className="eyebrow">Desde el 23 · 06 · 2025</p>
      <h1>Un espacio privado<br />para lo que es solo nuestro.</h1>
      <p>Recuerdos, pequeñas cosas y todo lo que todavía queremos construir juntos.</p>
      <div className="orbit-date"><Sparkles size={16} /> Aniversario · 23 de junio</div>
    </motion.section>
    <motion.section className="login-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="login-card__head"><span className="icon-tile"><LockKeyhole size={20} /></span><div><h2>Entrar a OnlyUs</h2><p>Este espacio se mantiene solo para nosotros.</p></div></div>
      <form onSubmit={handleSubmit} className="auth-form">
        <label><span>Correo electrónico</span><div className="input-with-icon"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="correo@ejemplo.com" /></div></label>
        <label><span>Contraseña</span><div className="input-with-icon"><LockKeyhole size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required placeholder="••••••••" /></div></label>
        <button className="button button--primary button--full" disabled={isSubmitting}>{isSubmitting ? 'Verificando…' : <>Entrar <ArrowRight size={17} /></>}</button>
      </form>
      {message && <p className="form-message">{message}</p>}
      <p className="form-footnote">Las cuentas se crean desde el panel de Supabase para mantener el acceso bajo control.</p>
    </motion.section>
  </main>
}
