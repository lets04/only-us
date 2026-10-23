import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, LoaderCircle } from 'lucide-react'
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
    setIndex((current) => photos.length ? current % photos.length : 0)
  }, [photos.length])

  useEffect(() => {
    if (photos.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % photos.length)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [photos.length])

  if (loading) {
    return <div className="carousel empty-state"><LoaderCircle className="spin" /> Preparando nuestros recuerdos…</div>
  }

  if (error) {
    return <div className="carousel empty-state">Hoy no pudimos traer nuestras fotitos. Probemos de nuevo en un ratito. 💗</div>
  }

  if (!photo) {
    return (
      <div className="carousel carousel--empty">
        <div className="carousel-empty-art">
          <motion.div className="empty-heart empty-heart--one" animate={{ y: [0, -9, 0], rotate: [-8, 5, -8] }} transition={{ duration: 4, repeat: Infinity }}><Heart fill="currentColor" /></motion.div>
          <motion.div className="empty-heart empty-heart--two" animate={{ y: [0, 8, 0], rotate: [8, -5, 8] }} transition={{ duration: 3.5, repeat: Infinity }}><Heart fill="currentColor" /></motion.div>
          <ImagePlaceholder label="Nuestro próximo recuerdo" />
        </div>
        <div>
          <p className="eyebrow">Aquí van nuestras fotitos</p>
          <h3>Este espacio está esperando un recuerdo bonito.</h3>
          <p>Agreguen una foto y márquenla para que aparezca aquí. Así, cada vez que entren, habrá un pedacito de ustedes esperándolos.</p>
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
            initial={{ opacity: 0, scale: 1.06, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          />
        </AnimatePresence>
        <div className="carousel-vignette" />
        <motion.span className="carousel-heart carousel-heart--one" aria-hidden="true" animate={{ y: [0, -8, 0], opacity: [0.65, 1, 0.65], scale: [1, 1.08, 1] }} transition={{ duration: 3.2, repeat: Infinity }}><Heart fill="currentColor" /></motion.span>
        <motion.span className="carousel-heart carousel-heart--two" aria-hidden="true" animate={{ y: [0, 7, 0], opacity: [0.45, 0.85, 0.45] }} transition={{ duration: 4.2, repeat: Infinity }}><Heart fill="currentColor" /></motion.span>
        <div className="carousel-caption">
          <p><Heart size={12} fill="currentColor" /> {formatLongDate(photo.date)}</p>
          <h3>{photo.title}</h3>
          {photo.description && <span>{photo.description}</span>}
        </div>
        {photos.length > 1 && (
          <>
            <button className="carousel-nav carousel-nav--prev" type="button" aria-label="Foto anterior" onClick={() => setIndex((current) => (current - 1 + photos.length) % photos.length)}><ChevronLeft size={18} /></button>
            <button className="carousel-nav carousel-nav--next" type="button" aria-label="Foto siguiente" onClick={() => setIndex((current) => (current + 1) % photos.length)}><ChevronRight size={18} /></button>
          </>
        )}
        <span className="carousel-count">{String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
      </div>
      {photos.length > 1 && (
        <div className="carousel-dots">
          {photos.map((item, itemIndex) => (
            <button key={item.id} type="button" className={itemIndex === index ? 'is-active' : ''} aria-label={`Ver ${item.title}`} onClick={() => setIndex(itemIndex)} />
          ))}
        </div>
      )}
    </div>
  )
}
