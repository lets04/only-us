import { ArrowDown, ArrowUp, CheckCircle2, EyeOff, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { MemoryEditor } from '../components/MemoryEditor'
import { ImagePlaceholder, Notice, PageIntro } from '../components/ui'
import { FIRST_STORY_MEMORY_ID } from '../data/story'
import { useMemories } from '../hooks/useMemories'
import { formatLongDate } from '../lib/dates'
import { createMemory, deleteMemory, updateMemory } from '../services/memories'
import type { Memory, MemoryDraft } from '../types/models'

export function MemoriesPage() {
  const { memories, loading, error, refresh, isDemo } = useMemories()
  const [editor, setEditor] = useState<{ memory?: Memory } | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  const saveMemory = async (draft: MemoryDraft, photo?: File) => {
    if (isDemo) return
    setSaving(true)
    try {
      if (editor?.memory) await updateMemory(editor.memory, { ...draft, sortOrder: editor.memory.sortOrder }, photo)
      else await createMemory(draft, photo)
      await refresh()
      setEditor(null)
      setStatus('Listo, este recuerdo ya tiene su lugar aquí. 💗')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (memory: Memory) => {
    if (memory.id === FIRST_STORY_MEMORY_ID) {
      setStatus('Este es nuestro primer recuerdo de la historia; podemos cambiarlo u ocultarlo, pero no borrarlo desde aquí.')
      return
    }
    if (!window.confirm(`¿Quitamos “${memory.title}” de nuestros recuerdos?`)) return
    setDeletingId(memory.id)
    setStatus('')
    try {
      const result = await deleteMemory(memory)
      await refresh()
      setStatus(result.cleanupWarning ?? 'Ya no aparecerá entre nuestros recuerdos.')
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'No pudimos quitarlo por ahora. Inténtalo de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  const moveMemory = async (memory: Memory, direction: -1 | 1) => {
    const index = memories.findIndex((item) => item.id === memory.id)
    const neighbor = memories[index + direction]
    if (!neighbor || isDemo) return
    setStatus('')
    try {
      await updateMemory(memory, { ...memory, sortOrder: neighbor.sortOrder })
      await updateMemory(neighbor, { ...neighbor, sortOrder: memory.sortOrder })
      await refresh()
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'No pudimos cambiar el orden por ahora.')
    }
  }

  const placementLabel = (memory: Memory) => {
    const places = [memory.showInStory ? 'Historia' : null, memory.showInCarousel ? 'Inicio' : null].filter(Boolean)
    if (!memory.isVisible) return 'Oculta'
    if (places.length === 0) return 'Galería'
    return places.join(' · ')
  }

  return (
    <div className="page">
      <PageIntro eyebrow="Nuestros recuerdos" title="Guardemos aquí lo bonito.">
        Cada foto tiene su historia. Elijan dónde quieren verla y en qué orden aparecen nuestros momentos.
      </PageIntro>
      {isDemo && <Notice kind="warning">Por ahora estás viendo una pequeña vista previa. Nuestros recuerdos podrán guardarse y compartirse desde aquí cuando el espacio esté listo. 💗</Notice>}
      {error && <Notice kind="warning">Hoy no pudimos cargar nuestros recuerdos. Inténtalo de nuevo en un ratito.</Notice>}

      <div className="section-heading">
        <div>
          <p className="eyebrow">Nuestro álbum</p>
          <h2>Fotitos que queremos conservar</h2>
        </div>
        <div className="heading-actions">
          {status && <span className="status-message"><CheckCircle2 size={15} /> {status}</span>}
          <button className="button button--primary" type="button" disabled={isDemo} onClick={() => setEditor({})}>
            <Plus size={16} /> Agregar fotito
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><LoaderCircle className="spin" /> Reuniendo nuestros recuerdos…</div>
      ) : memories.length === 0 ? (
        <div className="empty-state">
          <ImagePlaceholder label="Una foto para recordar" />
          <h3>Podemos empezar con una fotito.</h3>
          <p>Ese primer momento guardado siempre termina siendo especial.</p>
        </div>
      ) : (
        <div className="memory-list">
          {memories.map((memory, index) => (
            <article className={`memory-card ${memory.isVisible ? '' : 'memory-card--hidden'}`} key={memory.id}>
              {memory.imageUrl ? <img className="memory-image" src={memory.imageUrl} alt={memory.title} /> : <ImagePlaceholder label="Aquí también puede ir una foto" />}
              <div>
                <span>{formatLongDate(memory.date)} · {placementLabel(memory)}</span>
                <h3>{memory.title}</h3>
                <p>{memory.description}</p>
                <div className="timeline-actions">
                  <button className="text-link" type="button" disabled={index === 0 || isDemo} onClick={() => void moveMemory(memory, -1)}><ArrowUp size={14} /> Subir</button>
                  <button className="text-link" type="button" disabled={index === memories.length - 1 || isDemo} onClick={() => void moveMemory(memory, 1)}><ArrowDown size={14} /> Bajar</button>
                  <button className="text-link" type="button" disabled={isDemo} onClick={() => setEditor({ memory })}><Pencil size={14} /> Cambiar</button>
                  {memory.id !== FIRST_STORY_MEMORY_ID && <button className="memory-delete" type="button" disabled={isDemo || deletingId === memory.id} onClick={() => void handleDelete(memory)}><Trash2 size={14} /> {deletingId === memory.id ? 'Quitando…' : 'Eliminar'}</button>}
                  {!memory.isVisible && <span className="hidden-flag"><EyeOff size={13} /> Oculta</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <MemoryEditor open={Boolean(editor)} title={editor?.memory ? 'Cambiar nuestro recuerdo' : 'Guardar una fotito'} memory={editor?.memory} saving={saving} disabled={isDemo} onClose={() => setEditor(null)} onSave={saveMemory} />
    </div>
  )
}
