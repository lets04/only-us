import { motion } from 'framer-motion'
import { ArrowUpRight, Heart, MoonStar, Music2, Quote, Sparkles, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PhotoCarousel } from '../components/PhotoCarousel'
import { Notice } from '../components/ui'
import { defaultStory } from '../data/story'
import { useMemories } from '../hooks/useMemories'
import { getStorySettings } from '../services/story'
import type { StorySettings } from '../types/models'

function partsSince(date: string, now: Date) {
  const start = new Date(date + 'T00:00:00')
  if (Number.isNaN(start.getTime()) || start > now) return [0,0,0,0,0,0]
  let cursor = new Date(start), years = 0, months = 0
  while (true) { const next = new Date(cursor); next.setFullYear(next.getFullYear() + 1); if (next > now) break; cursor = next; years++ }
  while (true) { const next = new Date(cursor); next.setMonth(next.getMonth() + 1); if (next > now) break; cursor = next; months++ }
  let seconds = Math.floor((now.getTime() - cursor.getTime()) / 1000)
  const days = Math.floor(seconds / 86400); seconds %= 86400
  const hours = Math.floor(seconds / 3600); seconds %= 3600
  const minutes = Math.floor(seconds / 60); seconds %= 60
  return [years,months,days,hours,minutes,seconds]
}

export function DashboardPage() {
  const { memories, loading, error, isDemo } = useMemories()
  const [story, setStory] = useState<StorySettings>(defaultStory)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  useEffect(() => {
    if (isDemo) return
    let active = true
    void getStorySettings().then((settings) => { if (active) setStory(settings) }).catch(() => undefined)
    return () => { active = false }
  }, [isDemo])
  const elapsed = partsSince(story.relationshipStartDate, now)
  const carouselPhotos = memories.filter((memory) => memory.isVisible && memory.showInCarousel && memory.imageUrl)
  return <div className="moon-home">
    {error && <Notice kind="warning">{error}</Notice>}
    <motion.section className="moon-home-hero" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <span className="hand-note">hola, mi amorcito</span><MoonStar size={43} className="moon-home-icon" />
      <h1>Coincidimos<br /><em>bajo la misma luna</em></h1>
      <p>Entre tantos caminos, qué suerte que el nuestro se cruzara.</p>
      <div className="moon-home-clock">{elapsed.map((value, index) => <div key={index}><strong>{String(value).padStart(2,'0')}</strong><span>{['años','meses','días','horas','minutos','segundos'][index]}</span></div>)}</div>
      <span className="moon-home-caption">mi tiempo favorito es contigo <Heart size={13} fill="currentColor" /></span>
    </motion.section>
    <section className="moon-home-quote"><Quote size={20} /><div><span className="hand-note">hoy quiero recordarte</span><p>Somos dos personitas aprendiendo a quererse mejor, incluso cuando los días no salen perfectos.</p></div><Heart size={18} fill="currentColor" /></section>
    <section className="moon-home-links">
      <Link to="/historia"><Star /><span><strong>Nuestra constelación</strong><small>Cada estrella es un capítulo</small></span><ArrowUpRight /></Link>
      <Link to="/deseos"><Heart /><span><strong>Antojitos de amor</strong><small>Pídeme un besito, un abrazo o un ratito juntos</small></span><ArrowUpRight /></Link>
      <Link to="/canciones"><Music2 /><span><strong>Canciones nuestras</strong><small>Esas canciones que nos recuerdan al otro</small></span><ArrowUpRight /></Link>
    </section>
    <section className="section-block moon-home-photos"><div className="moon-section-heading"><div><span className="hand-note">pequeños pedacitos de nosotros</span><h2>Nuestras fotitos</h2></div><Link to="/recuerdos" className="text-link">Agregar fotito <ArrowUpRight size={15} /></Link></div><PhotoCarousel photos={carouselPhotos} loading={loading} error={error} /></section>
    <section className="multiverse-card"><Sparkles size={30} /><span className="hand-note">nuestro multiverso</span><h2>«De todos los universos posibles, qué suerte haber coincidido en este».</h2><p>Y qué bonito seguir escribiendo el nuestro, un recuerdo a la vez.</p></section>
  </div>
}
