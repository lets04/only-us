import { Heart, LoaderCircle, Moon, Phone, Send, Sparkles, Star } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Notice } from '../components/ui'
import { supabase } from '../lib/supabase'

const wishes = [
  { id: 'kisses', icon: '♡', title: 'Quiero besitos', detail: 'Un montón, por favor' },
  { id: 'hugs', icon: '✧', title: 'Quiero abrazos', detail: 'De esos que duran mucho' },
  { id: 'date', icon: '☾', title: 'Una tarde juntos', detail: 'Tú y yo, sin apuro' },
  { id: 'call', icon: '✦', title: 'Una videollamada', detail: 'Quiero verte un ratito' },
  { id: 'plan', icon: '❂', title: 'Un plan sorpresa', detail: 'Inventemos algo bonito' },
]
const responses = ['¡Voy por esos besitos!', 'Agendemos nuestra tarde', 'Te llamo en un ratito']

export function WishesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)
  const [sentId, setSentId] = useState<string | null>(null)
  const [latest, setLatest] = useState<{id:string;wish_titles:string[];message:string;response:string|null;created_at:string}|null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(!supabase)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let active = true
    const load = async () => {
      const { data, error } = await supabase.from('love_wishes').select('id,wish_titles,message,response,created_at').order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (active) { if (data) setLatest(data as typeof latest); if (error) setStatus('Cuando apliques la migración de Antojitos de amor, podremos guardar las peticiones aquí.'); setLoading(false) }
    }
    void load()
    const channel = supabase.channel('onlyus-love-wishes').on('postgres_changes', { event: '*', schema: 'public', table: 'love_wishes' }, () => { void load() }).subscribe()
    return () => { active = false; void supabase.removeChannel(channel) }
  }, [])

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const sendWish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected.length) { setStatus('Elige al menos un antojito para avisarle a tu amor. 💗'); return }
    if (!supabase) { setStatus('Para enviar deseos de verdad, necesitamos la conexión con Supabase.'); return }
    setSending(true); setStatus('')
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('Tu sesión venció. Entra de nuevo para enviar el deseo.')
      const { data, error } = await supabase.from('love_wishes').insert({ sender_id: userData.user.id, wish_titles: wishes.filter((w) => selected.includes(w.id)).map((w) => w.title), message: message.trim() }).select('id,wish_titles,message,response,created_at').single()
      if (error) throw new Error('No se pudo enviar. Aplica la migración de Antojitos de amor en Supabase y vuelve a probar.')
      setLatest(data as typeof latest); setSentId(data.id); setStatus('Tu deseo ya quedó guardado para que tu amor lo vea. ✨'); setSelected([]); setMessage('')
    } catch (error) { setStatus(error instanceof Error ? error.message : 'No se pudo enviar el deseo.') }
    finally { setSending(false) }
  }
  const reply = async (response: string) => {
    if (!supabase || !latest) return
    const { error } = await supabase.from('love_wishes').update({ response }).eq('id', latest.id)
    setStatus(error ? 'No pudimos guardar esa respuesta todavía.' : 'Respuesta enviada con mucho amor. 💗')
    if (!error) setLatest({ ...latest, response })
  }

  return <div className="moon-wishes-page">
    <section className="moon-wishes-hero"><span className="hand-note">último capítulo</span><Moon size={39} className="moon-wishes-icon" /><h1>Antojitos<br /><em>de amor</em></h1><p>Porque a veces solo necesito un poquito más de ti. Elige los que quieras y mándame tu mensajito.</p></section>
    {status && <Notice>{status}</Notice>}
    <form onSubmit={(event) => void sendWish(event)}>
      <div className="moon-wish-grid">{wishes.map((wish) => <button key={wish.id} type="button" className={'moon-wish-orb ' + (selected.includes(wish.id) ? 'is-selected' : '')} aria-pressed={selected.includes(wish.id)} onClick={() => toggle(wish.id)}><b>{wish.icon}</b><strong>{wish.title}</strong><small>{wish.detail}</small></button>)}</div>
      <label className="moon-wish-message-label" htmlFor="wish-message">Un mensajito extra, si quieres</label>
      <textarea id="wish-message" className="moon-wish-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Hoy te extraño más de lo normal, mi cielo…" maxLength={1000} />
      <button className="moon-wish-send" type="submit" disabled={sending}>{sending ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />} Avisarle a mi amor <Sparkles size={16} /></button>
    </form>
    <section className="moon-wish-inbox"><div className="moon-wish-inbox-title"><Heart size={19} /><div><span className="hand-note">mensajitos que viajan hasta el otro</span><h2>Lo último que nos mandamos</h2></div></div>
      {loading ? <p className="moon-wish-empty">Buscando mensajitos…</p> : latest ? <article className="moon-wish-notification"><span className="hand-note">un deseo para nosotros</span><h3>{latest.wish_titles.join(' · ')}</h3>{latest.message && <p>“{latest.message}”</p>}{latest.response ? <p className="moon-wish-response"><Heart size={15} fill="currentColor" /> Respuesta: {latest.response}</p> : <><p>Cuando tu amor lo vea, puede responder con una de estas opciones:</p><div className="moon-wish-replies">{responses.map((response) => <button key={response} onClick={() => void reply(response)} type="button">{response}</button>)}</div></>}</article> : <p className="moon-wish-empty">Todavía no hay deseos guardados. Sé la primera personita en mandar uno. 💗</p>}
    </section>
    <p className="moon-wish-foot"><Star size={13} /> Los deseos se guardan en nuestra base privada. Para avisos instantáneos, ambos deben tener la app abierta; las notificaciones del teléfono requieren configurar un servicio push adicional.</p>
  </div>
}
