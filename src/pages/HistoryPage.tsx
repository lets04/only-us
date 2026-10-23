import { motion } from 'framer-motion'
import { Heart, ImagePlus, Infinity as InfinityIcon, LoaderCircle, MoonStar, Pencil, Plus, Sparkles, Star, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { MemoryEditor } from '../components/MemoryEditor'
import { ImagePlaceholder, Modal, Notice } from '../components/ui'
import { FIRST_STORY_MEMORY_ID, defaultStory } from '../data/story'
import { useMemories } from '../hooks/useMemories'
import { formatLongDate } from '../lib/dates'
import { createMemory, deleteMemory, updateMemory } from '../services/memories'
import { getStorySettings, updateStorySettings } from '../services/story'
import type { Memory, MemoryDraft, StorySettings } from '../types/models'

const newStoryMemoryDefaults: Partial<MemoryDraft> = { showInStory: true, showInCarousel: false, isVisible: true }
const chapterTitles = [
  { title: 'El comienzo inesperado', date: 'Verano de 2025', description: 'Una confusión, una llamada y un comienzo que ninguno de los dos se habría imaginado.' },
  { title: 'Llamadas hasta tarde', date: 'Poco a poco', description: 'Hablar cada día se convirtió en nuestra costumbre favorita.' },
  { title: 'Poco a poco, tú', date: 'Sin darnos cuenta', description: 'Entre risas y conversaciones, empezamos a sentir algo más.' },
  { title: 'El día que fuimos nosotros', date: '23 de junio de 2025', description: 'El día que decidimos intentarlo y comenzamos nuestra historia oficial.' },
  { title: 'Nuestra primera fotito', date: '24 de junio de 2025', description: 'Un recuerdo pequeñito de un día enorme para nosotros.' },
  { title: 'Seguimos eligiéndonos', date: 'Hasta hoy', description: 'No todo ha sido fácil, pero seguimos aprendiendo a querernos mejor.' },
]
function elapsedParts(start: string, now: Date) {
  const origin = new Date(start + 'T00:00:00')
  if (Number.isNaN(origin.getTime()) || origin > now) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  let cursor = new Date(origin)
  let years = 0, months = 0
  while (true) { const next = new Date(cursor); next.setFullYear(next.getFullYear() + 1); if (next > now) break; cursor = next; years++ }
  while (true) { const next = new Date(cursor); next.setMonth(next.getMonth() + 1); if (next > now) break; cursor = next; months++ }
  let remaining = Math.floor((now.getTime() - cursor.getTime()) / 1000)
  const days = Math.floor(remaining / 86400); remaining %= 86400
  const hours = Math.floor(remaining / 3600); remaining %= 3600
  const minutes = Math.floor(remaining / 60); const seconds = remaining % 60
  return { years, months, days, hours, minutes, seconds }
}

export function HistoryPage() {
  const { memories, error, refresh, isDemo } = useMemories()
  const [story, setStory] = useState<StorySettings>(defaultStory)
  const [storyLoading, setStoryLoading] = useState(!isDemo)
  const [status, setStatus] = useState('')
  const [editingStory, setEditingStory] = useState(false)
  const [storyDraft, setStoryDraft] = useState(defaultStory)
  const [savingStory, setSavingStory] = useState(false)
  const [editor, setEditor] = useState<{ mode: 'create' | 'edit'; memory?: Memory } | null>(null)
  const [savingMemory, setSavingMemory] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  const [activeChapter, setActiveChapter] = useState(0)

  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  const timeline = memories.filter((memory) => memory.showInStory && memory.isVisible).sort((left, right) => left.sortOrder - right.sortOrder || left.date.localeCompare(right.date))
  const elapsed = elapsedParts(story.relationshipStartDate, now)

  useEffect(() => {
    if (isDemo) return
    let active = true
    void getStorySettings().then((settings) => { if (active) setStory(settings) })
      .catch(() => { if (active) setStatus('Hoy no pudimos abrir nuestra historia. Inténtalo de nuevo en un ratito.') })
      .finally(() => { if (active) setStoryLoading(false) })
    return () => { active = false }
  }, [isDemo])

  const openStoryEditor = () => { setStoryDraft(story); setEditingStory(true) }
  const saveStory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (isDemo) return
    setSavingStory(true); setStatus('')
    try { await updateStorySettings(storyDraft); setStory(storyDraft); setEditingStory(false); setStatus('Nuestra historia quedó guardada. 💗') }
    catch { setStatus('No se guardaron los cambios esta vez. Probemos otra vez en un ratito.') }
    finally { setSavingStory(false) }
  }
  const saveMemory = async (draft: MemoryDraft, photo?: File) => {
    if (isDemo) return
    setSavingMemory(true)
    try {
      if (editor?.memory) await updateMemory(editor.memory, { ...draft, sortOrder: editor.memory.sortOrder, showInStory: draft.showInStory ?? true }, photo)
      else await createMemory({ ...draft, showInStory: draft.showInStory ?? true }, photo)
      await refresh(); setEditor(null); setStatus('Este momento ya tiene su lugar en nuestra historia. 💗')
    } finally { setSavingMemory(false) }
  }
  const handleDelete = async (memory: Memory) => {
    if (memory.id === FIRST_STORY_MEMORY_ID || !window.confirm('¿Quitamos este recuerdo de nuestra historia?')) return
    setDeletingId(memory.id); setStatus('')
    try { const result = await deleteMemory(memory); await refresh(); setStatus(result.cleanupWarning ?? 'Ya no aparecerá en nuestra historia.') }
    catch { setStatus('No pudimos quitarlo por ahora. Inténtalo de nuevo.') }
    finally { setDeletingId(null) }
  }
  const chapters = timeline.length ? timeline.map((memory) => ({ id: memory.id, title: memory.title, date: formatLongDate(memory.date), description: memory.description, memory })) : chapterTitles.map((item, index) => ({ ...item, id: 'sample-' + index, memory: undefined }))
  const selected = chapters[Math.min(activeChapter, chapters.length - 1)] ?? chapters[0]
  const paragraphs = story.introText.split(/\n\s*\n/)

  return (
    <div className="page moon-story">
      <div className="moon-story-top"><span className="moon-brand"><MoonStar size={19} /> OnlyUs</span><button className="button button--ghost" type="button" onClick={openStoryEditor} disabled={storyLoading}><Pencil size={14} /> Editar nuestra historia</button></div>
      <motion.section className="moon-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="moon-hero-glow" />
        <span className="hand-note">una historia real, solo de dos</span>
        <MoonStar className="hero-moon" size={46} strokeWidth={1.2} />
        <p className="moon-kicker">23 · 06 · 2025</p>
        <h1>Coincidimos<br /><em>bajo la misma luna</em></h1>
        <p className="moon-hero-copy">Entre tantas personas, qué bonito que nuestros caminos se encontraran.</p>
        <div className="together-clock" aria-label="Tiempo juntos">
          {([{value:elapsed.years,label:'años'},{value:elapsed.months,label:'meses'},{value:elapsed.days,label:'días'},{value:elapsed.hours,label:'horas'},{value:elapsed.minutes,label:'minutos'},{value:elapsed.seconds,label:'segundos'}]).map((part) => <div className="clock-unit" key={part.label}><strong>{String(part.value).padStart(2,'0')}</strong><span>{part.label}</span></div>)}
        </div>
        <span className="clock-caption">mi tiempo favorito es contigo <Heart size={12} fill="currentColor" /></span>
      </motion.section>

      {(error || status) && <Notice kind={error ? 'warning' : 'info'}>{error || status}</Notice>}
      {isDemo && <Notice>Por ahora estás viendo una pequeña muestra de nuestra historia. 💗</Notice>}

      <section className="moon-chapters section-block">
        <div className="moon-section-heading"><div><span className="hand-note">y pensar que un día coincidimos</span><h2>Cada recuerdo, una parte de nosotros</h2><p>Toca una estrella y vuelve a ese momento.</p></div><button className="button button--primary" type="button" onClick={() => setEditor({ mode: 'create' })} disabled={isDemo}><Plus size={16} /> Agregar fotito</button></div>
        <div className="constellation-map">
          <svg viewBox="0 0 100 62" preserveAspectRatio="none" aria-hidden="true"><polyline points="7,46 22,19 38,37 54,13 71,31 91,10" fill="none" stroke="currentColor" strokeWidth=".35" strokeDasharray="1.4 1.8" /></svg>
          {chapters.map((chapter, index) => <button type="button" key={chapter.id} className={'constellation-star ' + (index === activeChapter ? 'is-active' : '')} style={{ left: [7,22,38,54,71,91][index % 6] + '%', top: [74,30,60,20,50,16][index % 6] + '%' }} aria-pressed={index === activeChapter} onClick={() => setActiveChapter(index)}><Star size={20} fill="currentColor" /><span>{String(index + 1).padStart(2,'0')}</span></button>)}
        </div>
        <motion.article key={selected?.id ?? 'empty'} className="moon-chapter-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="moon-chapter-photo">
            {selected?.memory?.imageUrl ? <img src={selected.memory.imageUrl} alt={selected.title} /> : <div className="moon-photo-empty"><ImagePlaceholder label="Aquí guardaremos esta fotito" /><button className="button button--ghost" type="button" onClick={() => selected?.memory ? setEditor({ mode: 'edit', memory: selected.memory }) : setEditor({ mode: 'create' })} disabled={isDemo}><ImagePlus size={15} /> Agregar fotito</button></div>}
            {selected?.memory?.imageUrl && <button className="photo-edit" type="button" onClick={() => setEditor({ mode: 'edit', memory: selected.memory })} aria-label="Cambiar fotito"><Pencil size={15} /></button>}
          </div>
          <div className="moon-chapter-copy"><span className="moon-kicker">{selected?.date}</span><h3>{selected?.title}</h3><p>{selected?.description}</p><div className="moon-chapter-actions"><button className="button button--ghost" type="button" disabled={isDemo} onClick={() => selected?.memory ? setEditor({ mode: 'edit', memory: selected.memory }) : setEditor({ mode: 'create' })}><Pencil size={14} /> {selected?.memory ? 'Editar recuerdo' : 'Guardar este capítulo'}</button>{selected?.memory && selected.memory.id !== FIRST_STORY_MEMORY_ID && <button className="memory-delete" type="button" disabled={deletingId === selected.memory.id} onClick={() => void handleDelete(selected.memory!)}><Trash2 size={14} /> Eliminar</button>}</div><div className="chapter-pager"><button type="button" onClick={() => setActiveChapter((activeChapter - 1 + chapters.length) % chapters.length)}>← Anterior</button><span>{activeChapter + 1} / {chapters.length}</span><button type="button" onClick={() => setActiveChapter((activeChapter + 1) % chapters.length)}>Siguiente →</button></div></div>
        </motion.article>
        <p className="photo-note"><Sparkles size={14} /> Puedes sumar recuerdos cuando quieras; tus fotos se guardan en nuestro álbum privado.</p>
      </section>

      <section className="multiverse-card">
        <InfinityIcon size={34} strokeWidth={1.3} />
        <span className="hand-note">nuestro multiverso</span>
        <h2>«De todos los universos posibles, qué suerte haber coincidido en este».</h2>
        <p>Y si volviera a empezar, ojalá nuestros caminos volvieran a encontrarse.</p>
      </section>

      <section className="moon-story-letter">
        <div className="moon-letter-heading"><div><span className="hand-note">lo que quiero que sepas</span><h2>Nuestra historia, con mis palabras</h2></div><Heart size={20} color="#ffb8c6" fill="#ffb8c6" /></div>
        {storyLoading ? <div className="empty-state"><LoaderCircle className="spin" /> Cargando nuestros recuerdos…</div> : <div className="story-copy">{paragraphs.map((paragraph) => <p key={paragraph.slice(0,48)}>{paragraph}</p>)}</div>}
      </section>

      <Modal open={editingStory} title="Editar nuestra historia" onClose={() => setEditingStory(false)}>
        <form className="memory-form" onSubmit={(event) => void saveStory(event)}>
          <label>Título<input required disabled={isDemo || savingStory} value={storyDraft.title} onChange={(event) => setStoryDraft({ ...storyDraft, title: event.target.value })} /></label>
          <label>Subtítulo<input required disabled={isDemo || savingStory} value={storyDraft.subtitle} onChange={(event) => setStoryDraft({ ...storyDraft, subtitle: event.target.value })} /></label>
          <label>Fecha de inicio<input required type="date" disabled={isDemo || savingStory} value={storyDraft.relationshipStartDate} onChange={(event) => setStoryDraft({ ...storyDraft, relationshipStartDate: event.target.value })} /></label>
          <label>Introducción<textarea required rows={12} disabled={isDemo || savingStory} value={storyDraft.introText} onChange={(event) => setStoryDraft({ ...storyDraft, introText: event.target.value })} /></label>
          <button className="button button--primary button--full" disabled={isDemo || savingStory}>{savingStory ? 'Guardando…' : 'Guardar historia'}</button>
        </form>
      </Modal>
      <MemoryEditor open={Boolean(editor)} title={editor?.memory ? 'Cambiar nuestro recuerdo' : 'Guardar una fotito'} memory={editor?.memory} defaults={editor?.memory ? undefined : newStoryMemoryDefaults} saving={savingMemory} disabled={isDemo} onClose={() => setEditor(null)} onSave={saveMemory} />
    </div>
  )
}
