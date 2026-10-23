import { motion } from 'framer-motion'
import { CalendarDays, ImagePlus, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { MemoryEditor } from '../components/MemoryEditor'
import { ImagePlaceholder, Modal, Notice, PageIntro } from '../components/ui'
import { FIRST_STORY_MEMORY_ID, defaultStory } from '../data/story'
import { useMemories } from '../hooks/useMemories'
import { formatLongDate } from '../lib/dates'
import { createMemory, deleteMemory, updateMemory } from '../services/memories'
import { getStorySettings, updateStorySettings } from '../services/story'
import type { Memory, MemoryDraft, StorySettings } from '../types/models'

const newStoryMemoryDefaults: Partial<MemoryDraft> = {
  showInStory: true,
  showInCarousel: false,
  isVisible: true,
}

export function HistoryPage() {
  const { memories, loading, error, refresh, isDemo } = useMemories()
  const [story, setStory] = useState<StorySettings>(defaultStory)
  const [storyLoading, setStoryLoading] = useState(!isDemo)
  const [status, setStatus] = useState('')
  const [editingStory, setEditingStory] = useState(false)
  const [storyDraft, setStoryDraft] = useState(defaultStory)
  const [savingStory, setSavingStory] = useState(false)
  const [editor, setEditor] = useState<{ mode: 'create' | 'edit'; memory?: Memory } | null>(null)
  const [savingMemory, setSavingMemory] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const timeline = memories
    .filter((memory) => memory.showInStory && memory.isVisible)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.date.localeCompare(right.date))

  useEffect(() => {
    if (isDemo) return
    let active = true
    void getStorySettings()
      .then((settings) => { if (active) setStory(settings) })
      .catch((reason: unknown) => { if (active) setStatus('Hoy no pudimos abrir nuestra historia. Inténtalo de nuevo en un ratito.') })
      .finally(() => { if (active) setStoryLoading(false) })
    return () => { active = false }
  }, [isDemo])

  const openStoryEditor = () => {
    setStoryDraft(story)
    setEditingStory(true)
  }

  const saveStory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDemo) return
    setSavingStory(true)
    setStatus('')
    try {
      await updateStorySettings(storyDraft)
      setStory(storyDraft)
      setEditingStory(false)
      setStatus('Nuestra historia quedó guardada. 💗')
    } catch (reason) {
      setStatus('No se guardaron los cambios esta vez. Probemos otra vez en un ratito.')
    } finally {
      setSavingStory(false)
    }
  }

  const saveMemory = async (draft: MemoryDraft, photo?: File) => {
    if (isDemo) return
    setSavingMemory(true)
    try {
      if (editor?.memory) {
        await updateMemory(editor.memory, {
          ...draft,
          sortOrder: editor.memory.sortOrder,
          showInStory: draft.showInStory ?? true,
        }, photo)
      } else {
        await createMemory({ ...draft, showInStory: draft.showInStory ?? true }, photo)
      }
      await refresh()
      setEditor(null)
      setStatus('Este momento ya tiene su lugar en nuestra historia. 💗')
    } finally {
      setSavingMemory(false)
    }
  }

  const handleDelete = async (memory: Memory) => {
    if (memory.id === FIRST_STORY_MEMORY_ID) return
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

  const paragraphs = story.introText.split(/\n\s*\n/)

  return (
    <div className="page">
      <PageIntro eyebrow="Nuestra historia" title={story.title}>
        {story.subtitle}
      </PageIntro>
      {isDemo && <Notice>Por ahora puedes recorrer nuestra historia y recordar cómo empezó todo. 💗</Notice>}
      {(error || status) && <Notice kind={error ? 'warning' : 'info'}>{error || status}</Notice>}

      <section className="story-intro-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Desde el {formatLongDate(story.relationshipStartDate)}</p>
            <h2>{story.subtitle}</h2>
          </div>
          <button className="button button--ghost" type="button" onClick={openStoryEditor} disabled={storyLoading}>
            <Pencil size={15} /> Editar introducción
          </button>
        </div>
        {storyLoading ? (
          <div className="empty-state"><LoaderCircle className="spin" /> Cargando nuestra historia…</div>
        ) : (
          <div className="story-copy">
            {paragraphs.map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>)}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Línea de tiempo</p>
            <h2>Los días que queremos recordar</h2>
          </div>
          <button className="button button--primary" type="button" onClick={() => setEditor({ mode: 'create' })}>
            <Plus size={16} /> Agregar recuerdo
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><LoaderCircle className="spin" /> Cargando recuerdos…</div>
        ) : (
          <section className="timeline">
            {timeline.map((entry, index) => (
              <motion.article
                className="timeline-entry"
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index * 0.05, 0.2) }}
              >
                <div className="timeline-marker"><span />{index < timeline.length - 1 && <i />}</div>
                <div className="timeline-date"><CalendarDays size={15} />{formatLongDate(entry.date)}</div>
                <div className="timeline-content">
                  <p className="eyebrow">{entry.id === FIRST_STORY_MEMORY_ID ? 'Primer día' : `Recuerdo ${String(index + 1).padStart(2, '0')}`}</p>
                  <h2>{entry.title}</h2>
                  <p>{entry.description}</p>
                  {entry.imageUrl ? (
                    <img className="timeline-image" src={entry.imageUrl} alt={entry.title} />
                  ) : (
                    <button className="timeline-empty-photo" type="button" onClick={() => setEditor({ mode: 'edit', memory: entry })}>
                      <ImagePlaceholder label="Todavía no hay foto de este día" />
                      <span><ImagePlus size={15} /> Agregar la fotografía</span>
                    </button>
                  )}
                  <div className="timeline-actions">
                    <button className="text-link" type="button" onClick={() => setEditor({ mode: 'edit', memory: entry })}>
                      <Pencil size={14} /> Editar
                    </button>
                    {entry.id !== FIRST_STORY_MEMORY_ID && (
                      <button className="memory-delete" type="button" disabled={deletingId === entry.id} onClick={() => void handleDelete(entry)}>
                        <Trash2 size={14} /> {deletingId === entry.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </section>
        )}
      </section>

      <Modal open={editingStory} title="Editar nuestra historia" onClose={() => setEditingStory(false)}>
        <form className="memory-form" onSubmit={(event) => void saveStory(event)}>
          <label>Título
            <input required disabled={isDemo || savingStory} value={storyDraft.title} onChange={(event) => setStoryDraft({ ...storyDraft, title: event.target.value })} />
          </label>
          <label>Subtítulo
            <input required disabled={isDemo || savingStory} value={storyDraft.subtitle} onChange={(event) => setStoryDraft({ ...storyDraft, subtitle: event.target.value })} />
          </label>
          <label>Fecha de inicio
            <input required type="date" disabled={isDemo || savingStory} value={storyDraft.relationshipStartDate} onChange={(event) => setStoryDraft({ ...storyDraft, relationshipStartDate: event.target.value })} />
          </label>
          <label>Introducción
            <textarea required rows={12} disabled={isDemo || savingStory} value={storyDraft.introText} onChange={(event) => setStoryDraft({ ...storyDraft, introText: event.target.value })} />
          </label>
          <button className="button button--primary button--full" disabled={isDemo || savingStory}>
            {savingStory ? 'Guardando…' : 'Guardar historia'}
          </button>
        </form>
      </Modal>

      <MemoryEditor
        open={Boolean(editor)}
        title={editor?.memory ? 'Editar recuerdo' : 'Nuevo recuerdo'}
        memory={editor?.memory}
        defaults={editor?.memory ? undefined : newStoryMemoryDefaults}
        saving={savingMemory}
        disabled={isDemo}
        onClose={() => setEditor(null)}
        onSave={saveMemory}
      />
    </div>
  )
}
