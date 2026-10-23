import { ImagePlus } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { validateImageFile } from '../services/photos'
import type { Memory, MemoryDraft } from '../types/models'
import { Modal } from './ui'

const emptyDraft: MemoryDraft = {
  title: '',
  date: '',
  description: '',
  isVisible: true,
  showInCarousel: true,
  showInStory: false,
}

type MemoryEditorProps = {
  open: boolean
  title: string
  memory?: Memory | null
  defaults?: Partial<MemoryDraft>
  saving: boolean
  disabled?: boolean
  onClose: () => void
  onSave: (draft: MemoryDraft, photo?: File) => Promise<void>
}

export function MemoryEditor(props: MemoryEditorProps) {
  const { open, title, onClose, memory } = props
  return (
    <Modal open={open} title={title} onClose={onClose}>
      {open ? <MemoryEditorForm key={memory?.id ?? 'new'} {...props} /> : null}
    </Modal>
  )
}

function MemoryEditorForm({
  memory, defaults, saving, disabled, onSave,
}: MemoryEditorProps) {
  const [draft, setDraft] = useState<MemoryDraft>({
    ...emptyDraft,
    ...defaults,
    title: memory?.title ?? defaults?.title ?? '',
    date: memory?.date ?? defaults?.date ?? '',
    description: memory?.description ?? defaults?.description ?? '',
    isVisible: memory?.isVisible ?? defaults?.isVisible ?? true,
    showInCarousel: memory?.showInCarousel ?? defaults?.showInCarousel ?? true,
    showInStory: memory?.showInStory ?? defaults?.showInStory ?? false,
    sortOrder: memory?.sortOrder ?? defaults?.sortOrder,
  })
  const [photo, setPhoto] = useState<File | undefined>()
  const [error, setError] = useState('')
  const preview = useMemo(() => photo ? URL.createObjectURL(photo) : '', [photo])

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return
    try {
      validateImageFile(selected)
      setPhoto(selected)
      setError('')
    } catch (reason) {
      setPhoto(undefined)
      event.target.value = ''
      setError(reason instanceof Error ? reason.message : 'No pudimos validar la foto.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      await onSave(draft, photo)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No pudimos guardar el recuerdo.')
    }
  }

  const imageSrc = preview || memory?.imageUrl

  return (
    <form className="memory-form" onSubmit={(event) => void handleSubmit(event)}>
      <label>Título
        <input required disabled={disabled || saving} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      </label>
      <label>Fecha
        <input required type="date" disabled={disabled || saving} value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
      </label>
      <label>Anécdota
        <textarea required rows={5} disabled={disabled || saving} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="¿Qué pasó ese día que queremos guardar? 💗" />
      </label>
      {imageSrc ? <img className="editor-preview" src={imageSrc} alt="" /> : null}
      <label className="upload-placeholder">
        <ImagePlus size={18} />
        {photo ? photo.name : imageSrc ? 'Cambiar fotito' : 'Agregar fotito'}
        <small>JPG, PNG o WebP · máximo 5 MB</small>
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || saving} onChange={selectPhoto} />
      </label>
      <fieldset className="placement-fieldset" disabled={disabled || saving}>
        <legend>¿Dónde queremos verla?</legend>
        <label className="check-row">
          <input type="checkbox" checked={Boolean(draft.showInStory)} onChange={(event) => setDraft({ ...draft, showInStory: event.target.checked })} />
          Nuestra historia
        </label>
        <label className="check-row">
          <input type="checkbox" checked={Boolean(draft.showInCarousel)} onChange={(event) => setDraft({ ...draft, showInCarousel: event.target.checked })} />
          En el inicio
        </label>
        <label className="check-row">
          <input type="checkbox" checked={Boolean(draft.isVisible)} onChange={(event) => setDraft({ ...draft, isVisible: event.target.checked })} />
          Visible
        </label>
      </fieldset>
      {error ? <p className="form-message">{error}</p> : null}
      <button className="button button--primary button--full" disabled={disabled || saving}>
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  )
}
