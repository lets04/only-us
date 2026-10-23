import { motion } from 'framer-motion'
import { ArrowUpRight, BookHeart, Heart, Images, Quote } from 'lucide-react'
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
        Nuestro rinconcito, lleno de esas pequeñas cosas que se vuelven enormes porque las vivimos juntos.
      </PageIntro>
      <motion.section className="anniversary-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="anniversary-orbit" aria-hidden="true"><Heart size={27} fill="currentColor" /><i /></div>
        <div>
          <p className="eyebrow">Desde el {formatLongDate(story.relationshipStartDate)}</p>
          <h2>Y todavía te sigo eligiendo.</h2>
          <p>Cada día contigo se suma a nuestra historia, incluso los más sencillitos.</p>
        </div>
        <div className="duration-grid" aria-label="Tiempo juntos">
          <div><strong>{duration.months}</strong><span>meses</span></div>
          <div><strong>{duration.days}</strong><span>días</span></div>
          <div><strong>{duration.totalDays}</strong><span>días juntitos</span></div>
        </div>
      </motion.section>
      <section className="dashboard-grid">
        <motion.article className="quote-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Quote size={22} />
          <p>{editablePhrases[0]}</p>
          <span>Un pedacito de lo que siento por ti <Heart size={12} fill="currentColor" /></span>
        </motion.article>
        <motion.article className="quick-card" whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
          <span className="icon-tile"><BookHeart size={20} /></span>
          <div>
            <h3>Nuestra historia</h3>
            <p>Desde aquel comienzo tan inesperado hasta hoy.</p>
          </div>
          <Link to="/historia" aria-label="Leer nuestra historia"><ArrowUpRight size={20} /></Link>
        </motion.article>
        <motion.article className="quick-card" whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
          <span className="icon-tile icon-tile--pink"><Images size={20} /></span>
          <div>
            <h3>Nuestras fotitos</h3>
            <p>Momentos que queremos volver a vivir.</p>
          </div>
          <Link to="/galeria" aria-label="Ver nuestras fotos"><ArrowUpRight size={20} /></Link>
        </motion.article>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nuestros recuerdos <Heart size={12} fill="currentColor" /></p>
            <h2>Un montón de momentos que son nuestros</h2>
          </div>
          <Link to="/recuerdos" className="text-link">Ver y agregar fotitos <ArrowUpRight size={15} /></Link>
        </div>
        <PhotoCarousel photos={carouselPhotos} loading={loading} error={error} />
      </section>
      {latestStory ? (
        <motion.section className="next-chapter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <BookHeart size={20} />
          <div>
            <p className="eyebrow">Un recuerdo de nosotros</p>
            <h2>{latestStory.title}</h2>
            <p>{latestStory.description}</p>
          </div>
          <Link className="button button--ghost" to="/historia">Volver a vivirlo</Link>
        </motion.section>
      ) : null}
    </div>
  )
}
