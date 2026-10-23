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
      if (editor?.memory) {
        await updateMemory(editor.memory, { ...draft, sortOrder: editor.memory.sortOrder }, photo)
      } else {
        await createMemory(draft, photo)
      }
      await refresh()
      setEditor(null)
      setStatus('Recuerdo guardado de forma privada.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (memory: Memory) => {
    if (memory.id === FIRST_STORY_MEMORY_ID) {
      setStatus('Este primer recuerdo se queda en nuestra historia. Puedes editarlo u ocultarlo.')
      return
    }
    if (!window.confirm(`¿Seguro que quieres eliminar “${memory.title}”?`)) return
    setDeletingId(memory.id)
    setStatus('')
    try {
      const result = await deleteMemory(memory)
      await refresh()
      setStatus(result.cleanupWarning ?? 'Recuerdo eliminado.')
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'No pudimos eliminar el recuerdo.')
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
      setStatus(reason instanceof Error ? reason.message : 'No pudimos cambiar el orden.')
    }
  }

  const placementLabel = (memory: Memory) => {
    const places = [
      memory.showInStory ? 'Historia' : null,
      memory.showInCarousel ? 'Carrusel' : null,
    ].filter(Boolean)
    if (!memory.isVisible) return 'Oculta'
    if (places.length === 0) return 'Galería'
    return places.join(' · ')
  }

  return (
    <div className="page">
      <PageIntro eyebrow="Recuerdos compartidos" title="Lo que construimos entre los dos.">
        Aquí administramos las fotos: dónde aparecen, en qué orden y cuáles queremos guardar cerca.
      </PageIntro>
      {isDemo && <Notice kind="warning">Estás viendo un ejemplo de solo lectura. Configura Supabase para activar recuerdos privados compartidos.</Notice>}
      {error && <Notice kind="warning">{error}</Notice>}

      <div className="section-heading">
        <div>
          <p className="eyebrow">Archivo compartido</p>
          <h2>Nuestros momentos</h2>
        </div>
        <div className="heading-actions">
          {status && <span className="status-message"><CheckCircle2 size={15} /> {status}</span>}
          <button className="button button--primary" type="button" disabled={isDemo} onClick={() => setEditor({})}>
            <Plus size={16} /> Agregar recuerdo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><LoaderCircle className="spin" /> Cargando recuerdos…</div>
      ) : memories.length === 0 ? (
        <div className="empty-state">
          <ImagePlaceholder label="Todavía no hay recuerdos guardados" />
          <h3>El primer recuerdo está esperando.</h3>
          <p>Cuando los dos estén autorizados, va a aparecer aquí de forma privada.</p>
        </div>
      ) : (
        <div className="memory-list">
          {memories.map((memory, index) => (
            <article className={`memory-card ${memory.isVisible ? '' : 'memory-card--hidden'}`} key={memory.id}>
              {memory.imageUrl ? <img className="memory-image" src={memory.imageUrl} alt="" /> : <ImagePlaceholder label="Foto privada opcional" />}
              <div>
                <span>{formatLongDate(memory.date)} · {placementLabel(memory)}</span>
                <h3>{memory.title}</h3>
                <p>{memory.description}</p>
                <div className="timeline-actions">
                  <button className="text-link" type="button" disabled={index === 0 || isDemo} onClick={() => void moveMemory(memory, -1)}>
                    <ArrowUp size={14} /> Subir
                  </button>
                  <button className="text-link" type="button" disabled={index === memories.length - 1 || isDemo} onClick={() => void moveMemory(memory, 1)}>
                    <ArrowDown size={14} /> Bajar
                  </button>
                  <button className="text-link" type="button" disabled={isDemo} onClick={() => setEditor({ memory })}>
                    <Pencil size={14} /> Editar
                  </button>
                  {memory.id !== FIRST_STORY_MEMORY_ID && (
                    <button className="memory-delete" type="button" disabled={isDemo || deletingId === memory.id} onClick={() => void handleDelete(memory)}>
                      <Trash2 size={14} /> {deletingId === memory.id ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  )}
                  {!memory.isVisible && <span className="hidden-flag"><EyeOff size={13} /> Oculta</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <MemoryEditor
        open={Boolean(editor)}
        title={editor?.memory ? 'Editar recuerdo' : 'Nuevo recuerdo'}
        memory={editor?.memory}
        saving={saving}
        disabled={isDemo}
        onClose={() => setEditor(null)}
        onSave={saveMemory}
      />
    </div>
  )
}
