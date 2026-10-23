import { ExternalLink, LoaderCircle, Music2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Modal, Notice, PageIntro } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { getSpotifyEmbedHeight, getSpotifyEmbedSrc, parseSpotifyUrl } from '../lib/spotify'
import { createSong, deleteSong, getSongs, updateSong } from '../services/songs'
import type { Song, SongDraft } from '../types/models'

const emptySong: SongDraft = { title: '', artist: '', spotifyUrl: '', dedication: '' }

export function SongsPage() {
  const { isDemo } = useAuth()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(!isDemo)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [editor, setEditor] = useState<{ song?: Song } | null>(null)
  const [draft, setDraft] = useState<SongDraft>(emptySong)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refresh = async () => {
    const items = await getSongs()
    setSongs(items)
  }

  useEffect(() => {
    if (isDemo) return
    let active = true
    void getSongs()
      .then((items) => { if (active) { setSongs(items); setError('') } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'No pudimos cargar las canciones.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isDemo])

  const openEditor = (song?: Song) => {
    setDraft(song ? { title: song.title, artist: song.artist, spotifyUrl: song.spotifyUrl, dedication: song.dedication } : emptySong)
    setEditor({ song })
    setStatus('')
  }

  const saveSong = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDemo) return
    setSaving(true)
    setStatus('')
    try {
      parseSpotifyUrl(draft.spotifyUrl)
      if (editor?.song) await updateSong(editor.song.id, draft, editor.song.sortOrder)
      else await createSong(draft)
      await refresh()
      setEditor(null)
      setStatus('Canción guardada.')
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'No pudimos guardar la canción.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (song: Song) => {
    if (!window.confirm(`¿Seguro que quieres eliminar “${song.title}”?`)) return
    setDeletingId(song.id)
    try {
      await deleteSong(song.id)
      await refresh()
      setStatus('Canción eliminada.')
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : 'No pudimos eliminar la canción.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      <PageIntro eyebrow="Canciones nuestras" title="La banda sonora de nosotros.">
        Un rincón para las canciones que nos recuerdan, con una dedicatoria y un enlace a Spotify.
      </PageIntro>
      {isDemo && <Notice kind="warning">En modo demostración las canciones no se guardan. Conecta Supabase para que los dos puedan administrarlas.</Notice>}
      {error && <Notice kind="warning">{error}</Notice>}
      {status && !editor && <Notice>{status}</Notice>}

      <div className="section-heading">
        <div>
          <p className="eyebrow">Nuestra playlist</p>
          <h2>Canciones guardadas</h2>
        </div>
        <button className="button button--primary" type="button" disabled={isDemo} onClick={() => openEditor()}>
          <Plus size={16} /> Agregar canción
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><LoaderCircle className="spin" /> Cargando canciones…</div>
      ) : songs.length === 0 ? (
        <div className="empty-state">
          <Music2 size={28} />
          <h3>Todavía no hay canciones nuestras, mi cielo.</h3>
          <p>Cuando encontremos una que nos recuerde, la vamos a dejar aquí con una dedicatoria.</p>
          <button className="button button--primary" type="button" disabled={isDemo} onClick={() => openEditor()}>
            <Plus size={16} /> Agregar la primera
          </button>
        </div>
      ) : (
        <section className="song-grid">
          {songs.map((song) => {
            let embedSrc = ''
            let embedHeight = 152
            try {
              const link = parseSpotifyUrl(song.spotifyUrl)
              embedSrc = getSpotifyEmbedSrc(link)
              embedHeight = getSpotifyEmbedHeight(link.type)
            } catch {
              embedSrc = ''
            }
            return (
              <article className="song-card" key={song.id}>
                <div className="song-card__head">
                  <span className="song-art"><Music2 size={22} /></span>
                  <div>
                    <p className="eyebrow">Canción nuestra</p>
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                  </div>
                </div>
                {song.dedication ? <p className="song-dedication">{song.dedication}</p> : null}
                {embedSrc ? (
                  <iframe
                    className="spotify-embed"
                    title={`${song.title} en Spotify`}
                    src={embedSrc}
                    width="100%"
                    height={embedHeight}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <a className="button button--ghost" href={song.spotifyUrl} target="_blank" rel="noreferrer">
                    Abrir en Spotify <ExternalLink size={15} />
                  </a>
                )}
                <div className="timeline-actions">
                  <a className="text-link" href={song.spotifyUrl} target="_blank" rel="noreferrer">
                    Abrir Spotify <ExternalLink size={14} />
                  </a>
                  <button className="text-link" type="button" disabled={isDemo} onClick={() => openEditor(song)}>
                    <Pencil size={14} /> Editar
                  </button>
                  <button className="memory-delete" type="button" disabled={isDemo || deletingId === song.id} onClick={() => void handleDelete(song)}>
                    <Trash2 size={14} /> {deletingId === song.id ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <Modal open={Boolean(editor)} title={editor?.song ? 'Editar canción' : 'Agregar canción'} onClose={() => setEditor(null)}>
        <form className="memory-form" onSubmit={(event) => void saveSong(event)}>
          <label>Título
            <input required disabled={isDemo || saving} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Nombre de la canción" />
          </label>
          <label>Artista
            <input required disabled={isDemo || saving} value={draft.artist} onChange={(event) => setDraft({ ...draft, artist: event.target.value })} placeholder="Quién la canta" />
          </label>
          <label>Enlace de Spotify
            <input required disabled={isDemo || saving} value={draft.spotifyUrl} onChange={(event) => setDraft({ ...draft, spotifyUrl: event.target.value })} placeholder="https://open.spotify.com/track/…" />
          </label>
          <label>Dedicatoria
            <textarea rows={4} disabled={isDemo || saving} value={draft.dedication} onChange={(event) => setDraft({ ...draft, dedication: event.target.value })} placeholder="Por qué esta canción es nuestra…" />
          </label>
          {status && editor && <p className="form-message">{status}</p>}
          <button className="button button--primary button--full" disabled={isDemo || saving}>
            {saving ? 'Guardando…' : 'Guardar canción'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
