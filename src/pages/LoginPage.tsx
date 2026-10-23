
import { motion } from 'framer-motion'
import { Heart, MoonStar, Sparkles, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { session, loading, isDemo, enterAs } = useAuth()
  const [who, setWho] = useState<'Leticia' | 'Jhonatan'>('Leticia')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')

  if (loading) {
    return <main className="page-loader">Preparando nuestro rinconcito…</main>
  }

  if (session || isDemo) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (date.replace(/[^0-9]/g, '') !== '23062025') {
      setMessage('Esa no es nuestra fecha. Piensa en el día en que nos hicimos novios. 💗')
      return
    }

    enterAs(who)
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
        onSubmit={handleSubmit}
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
          Elige quién eres y escribe el día en que todo empezó.
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

        <label className="moon-login-label" htmlFor="relationship-date">
          Nuestra fecha
        </label>

        <input
          id="relationship-date"
          className="moon-date-input"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/aaaa"
          aria-describedby="login-message"
          required
        />

        <p className="moon-login-error" id="login-message" role="alert">
          {message}
        </p>

        <button className="moon-login-submit" type="submit">
          Entrar a nuestro cielo <Sparkles size={17} />
        </button>

        <p className="moon-login-foot">
          Un pequeño universo, hecho para nosotros dos.{' '}
          <Heart size={12} fill="currentColor" />
        </p>
      </motion.form>
    </main>
  )
}
