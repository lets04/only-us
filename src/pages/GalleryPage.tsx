import { CalendarDays, Expand, Heart, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { ImagePlaceholder, Modal, Notice, PageIntro } from '../components/ui'
import { useMemories } from '../hooks/useMemories'
import { formatLongDate } from '../lib/dates'
import type { Memory } from '../types/models'

export function GalleryPage() {
  const { memories, loading, error } = useMemories()
  const [selected, setSelected] = useState<Memory | null>(null)
  const entries = memories.filter((memory) => memory.isVisible && memory.imageUrl).slice().sort((left, right) => right.date.localeCompare(left.date))
  return (
    <div className="page">
      <PageIntro eyebrow="Nuestra galería" title="Para volver a esos días bonitos.">
        Cada fotito guarda algo que quizá solo nosotros entendemos. Y por eso me encanta que estén aquí.
      </PageIntro>
      {error && <Notice kind="warning">No pudimos traer las fotos por ahora. Volvamos a intentarlo en un ratito. 💗</Notice>}
      {loading ? <div className="empty-state"><LoaderCircle className="spin" /> Buscando nuestras fotitos…</div> : entries.length === 0 ? (
        <div className="empty-state"><ImagePlaceholder label="Nuestro álbum empieza aquí" /><Heart size={20} /><h3>¿Guardamos nuestra primera fotito?</h3><p>Un día cualquiera puede convertirse en uno de esos recuerdos que queremos guardar para siempre.</p></div>
      ) : (
        <section className="gallery-grid">
          {entries.map((item, index) => (
            <button className={'gallery-item gallery-item--' + ((index % 4) + 1)} key={item.id} onClick={() => setSelected(item)} aria-label={'Abrir recuerdo: ' + item.title}>
              <img className="gallery-image" src={item.imageUrl} alt={item.title} />
              <span className="gallery-item__zoom"><Expand size={17} /></span>
              <div><p>{item.showInStory ? 'Un capítulo nuestro' : 'Un recuerdo'}</p><h2>{item.title}</h2><span>{formatLongDate(item.date)}</span></div>
            </button>
          ))}
        </section>
      )}
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? ''}>
        {selected && <div className="gallery-modal">{selected.imageUrl ? <img className="modal-image" src={selected.imageUrl} alt={'Foto de ' + selected.title} /> : <ImagePlaceholder label="Nuestra foto" />}<div><p className="eyebrow"><CalendarDays size={14} /> {formatLongDate(selected.date)}</p><p>{selected.description}</p></div></div>}
      </Modal>
    </div>
  )
}
