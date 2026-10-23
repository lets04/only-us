import { CalendarDays, Expand, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { ImagePlaceholder, Modal, Notice, PageIntro } from '../components/ui'
import { useMemories } from '../hooks/useMemories'
import { formatLongDate } from '../lib/dates'
import type { Memory } from '../types/models'

export function GalleryPage() {
  const { memories, loading, error, isDemo } = useMemories()
  const [selected, setSelected] = useState<Memory | null>(null)
  const entries = memories
    .filter((memory) => memory.isVisible && memory.imageUrl)
    .slice()
    .sort((left, right) => right.date.localeCompare(left.date))

  return (
    <div className="page">
      <PageIntro eyebrow="Galería" title="Mirar atrás, despacio.">
        Aquí viven las fotos que ya quisimos guardar, con la historia que las acompaña.
      </PageIntro>
      {isDemo && <Notice>Estás viendo el modo demostración. Tus fotos privadas aparecen aquí después de conectar Supabase y subirlas.</Notice>}
      {error && <Notice kind="warning">{error}</Notice>}
      {loading ? (
        <div className="empty-state"><LoaderCircle className="spin" /> Cargando fotos privadas…</div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <ImagePlaceholder label="Todavía no hay fotos privadas" />
          <h3>La primera foto está esperando.</h3>
          <p>Agrega un recuerdo con imagen para verla en esta galería.</p>
        </div>
      ) : (
        <section className="gallery-grid">
          {entries.map((item, index) => (
            <button className={`gallery-item gallery-item--${(index % 4) + 1}`} key={item.id} onClick={() => setSelected(item)}>
              <img className="gallery-image" src={item.imageUrl} alt="" />
              <span className="gallery-item__zoom"><Expand size={17} /></span>
              <div>
                <p>{item.showInStory ? 'Historia' : 'Recuerdo'}</p>
                <h2>{item.title}</h2>
                <span>{formatLongDate(item.date)}</span>
              </div>
            </button>
          ))}
        </section>
      )}
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? ''}>
        {selected && (
          <div className="gallery-modal">
            {selected.imageUrl ? <img className="modal-image" src={selected.imageUrl} alt={`Foto de ${selected.title}`} /> : <ImagePlaceholder label="Aquí va a aparecer nuestra foto" />}
            <div>
              <p className="eyebrow"><CalendarDays size={14} /> {formatLongDate(selected.date)}</p>
              <p>{selected.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
