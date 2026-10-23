import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Memory } from '../types/models'
import { formatLongDate } from '../lib/dates'
import { ImagePlaceholder } from './ui'

type PhotoCarouselProps = {
  photos: Memory[]
  loading: boolean
  error?: string
}

export function PhotoCarousel({ photos, loading, error }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0)
  const photo = photos.length > 0 ? photos[index % photos.length] : undefined

  useEffect(() => {
    if (photos.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % photos.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [photos.length])

  if (loading) {
    return (
      <div className="carousel empty-state">
        <LoaderCircle className="spin" /> Cargando nuestras fotos…
      </div>
    )
  }

  if (error) {
    return <div className="carousel empty-state">{error}</div>
  }

  if (!photo) {
    return (
      <div className="carousel carousel--empty">
        <ImagePlaceholder label="Aún no hay fotos en el carrusel" />
        <div>
          <h3>Este rincón todavía está en silencio.</h3>
          <p>Cuando marquemos una foto para el inicio, va a aparecer aquí con calma.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="carousel">
      <div className="carousel-frame">
        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            className="carousel-image"
            src={photo.imageUrl ?? ''}
            alt={photo.title}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
        </AnimatePresence>
        <div className="carousel-caption">
          <p>{formatLongDate(photo.date)}</p>
          <h3>{photo.title}</h3>
        </div>
        {photos.length > 1 ? (
          <>
            <button className="carousel-nav carousel-nav--prev" type="button" aria-label="Foto anterior" onClick={() => setIndex((current) => (current - 1 + photos.length) % photos.length)}>
              <ChevronLeft size={18} />
            </button>
            <button className="carousel-nav carousel-nav--next" type="button" aria-label="Foto siguiente" onClick={() => setIndex((current) => (current + 1) % photos.length)}>
              <ChevronRight size={18} />
            </button>
          </>
        ) : null}
      </div>
      {photos.length > 1 ? (
        <div className="carousel-dots">
          {photos.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              className={itemIndex === index ? 'is-active' : ''}
              aria-label={`Ver ${item.title}`}
              onClick={() => setIndex(itemIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
