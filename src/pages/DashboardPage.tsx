import { motion } from 'framer-motion'
import { ArrowUpRight, BookHeart, Images, Quote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PhotoCarousel } from '../components/PhotoCarousel'
import { PageIntro } from '../components/ui'
import { editablePhrases } from '../data/demo'
import { defaultStory } from '../data/story'
import { useMemories } from '../hooks/useMemories'
import { formatLongDate, getAnniversaryDuration } from '../lib/dates'
import { getStorySettings } from '../services/story'
import type { StorySettings } from '../types/models'

export function DashboardPage() {
  const { memories, loading, error, isDemo } = useMemories()
  const [story, setStory] = useState<StorySettings>(defaultStory)

  useEffect(() => {
    if (isDemo) return
    let active = true
    void getStorySettings()
      .then((settings) => { if (active) setStory(settings) })
      .catch(() => undefined)
    return () => { active = false }
  }, [isDemo])

  const duration = getAnniversaryDuration(story.relationshipStartDate)
  const carouselPhotos = memories.filter((memory) => memory.isVisible && memory.showInCarousel && memory.imageUrl)
  const latestStory = memories.filter((memory) => memory.isVisible && memory.showInStory).at(-1)

  return (
    <div className="page dashboard">
      <PageIntro eyebrow="Nuestro pequeño universo" title="Hola, mi amorcito.">
        Un lugar quieto para lo que vamos construyendo entre los dos.
      </PageIntro>
      <section className="anniversary-card">
        <div className="anniversary-orbit" aria-hidden="true"><span>✦</span><i /></div>
        <div>
          <p className="eyebrow">Desde el {formatLongDate(story.relationshipStartDate)}</p>
          <h2>El tiempo que llevamos eligiendo quedarnos.</h2>
          <p>El contador se mueve solo. Nuestra historia, no: esa la escribimos nosotros.</p>
        </div>
        <div className="duration-grid" aria-label="Tiempo transcurrido">
          <div><strong>{duration.months}</strong><span>meses</span></div>
          <div><strong>{duration.days}</strong><span>días</span></div>
          <div><strong>{duration.totalDays}</strong><span>días en total</span></div>
        </div>
      </section>
      <section className="dashboard-grid">
        <motion.article className="quote-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Quote size={22} />
          <p>{editablePhrases[0]}</p>
          <span>Una frase para volver a leer</span>
        </motion.article>
        <article className="quick-card">
          <span className="icon-tile"><BookHeart size={20} /></span>
          <div>
            <h3>Nuestra historia</h3>
            <p>Desde aquel malentendido hasta el día de hoy.</p>
          </div>
          <Link to="/historia" aria-label="Ver nuestra historia"><ArrowUpRight size={20} /></Link>
        </article>
        <article className="quick-card">
          <span className="icon-tile icon-tile--pink"><Images size={20} /></span>
          <div>
            <h3>Galería</h3>
            <p>Las fotos que ya quisimos guardar.</p>
          </div>
          <Link to="/galeria" aria-label="Ver galería"><ArrowUpRight size={20} /></Link>
        </article>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Carrusel</p>
            <h2>Fotos que queremos tener cerca</h2>
          </div>
          <Link to="/recuerdos" className="text-link">Administrar fotos <ArrowUpRight size={15} /></Link>
        </div>
        <PhotoCarousel photos={carouselPhotos} loading={loading} error={error} />
      </section>
      {latestStory ? (
        <section className="next-chapter">
          <BookHeart size={20} />
          <div>
            <p className="eyebrow">En la historia</p>
            <h2>{latestStory.title}</h2>
            <p>{latestStory.description}</p>
          </div>
          <Link className="button button--ghost" to="/historia">Abrir historia</Link>
        </section>
      ) : null}
    </div>
  )
}
