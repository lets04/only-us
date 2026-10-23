import { motion } from 'framer-motion'
import { Heart, MoonStar, Sparkles, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const { session, loading, isDemo, enterAs } = useAuth()
  const [who, setWho] = useState<'Leticia' | 'Jhonatan'>('Leticia')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) return <main className="page-loader">Preparando nuestro rinconcito…</main>
  if (session || isDemo) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!supabase) {
      setMessage('Supabase no está disponible. Revisa la configuración de la aplicación.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setMessage('No pudimos entrar. Revisa tu correo y tu contraseña secreta e inténtalo de nuevo. 💗')
        return
      }

      enterAs(who)
      setMessage('Bienvenido a nuestro pequeño universo. ✨')
    } catch {
      setMessage('No pudimos conectar con nuestro universo. Inténtalo otra vez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="moon-login">
      <div className="moon-login-sky" aria-hidden="true">
        {Array.from({ length: 70 }, (_, i) => (
          <i
            key={i}
            style={{
              left: ((i * 37 + 11) % 100) + '%',
              top: ((i * 61 + 7) % 100) + '%',
              animationDelay: (i % 9) * -0.43 + 's',
            }}
          />
        ))}
      </div>

      <motion.form
        className="moon-login-card"
        onSubmit={(event) => void handleSubmit(event)}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="hand-note">una historia real, solo de dos</div>
        <MoonStar className="moon-login-icon" size={42} strokeWidth={1.3} />
        <div className="moon-login-logo">OnlyUs</div>
        <h1>
          Coincidimos
          <br />
          <em>bajo la misma luna</em>
        </h1>
        <p className="moon-login-subtitle">
          Elige quién eres y entra a nuestro pequeño universo.
        </p>

        <div className="moon-who" role="group" aria-label="¿Quién eres?">
          {(['Leticia', 'Jhonatan'] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={who === name}
              onClick={() => setWho(name)}
            >
              <UserRound size={16} />
              {name}
            </button>
          ))}
        </div>

        <label className="moon-login-label" htmlFor="login-email">Nuestro correo</label>
        <input
          id="login-email"
          className="moon-date-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          placeholder="Escribe el correo de tu cuenta"
          required
        />

        <label className="moon-login-label" htmlFor="login-password">Contraseña secreta</label>
        <input
          id="login-password"
          className="moon-date-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="Pista: nuestro aniversario 💗"
          aria-describedby="login-message"
          required
        />

        <p className="moon-login-error" id="login-message" role="alert">{message}</p>
        <button className="moon-login-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Abriendo nuestro cielo…' : 'Entrar a nuestro cielo'} <Sparkles size={17} />
        </button>
        <p className="moon-login-foot">
          Un pequeño universo, hecho para nosotros dos. <Heart size={12} fill="currentColor" />
        </p>
      </motion.form>
    </main>
  )
}
